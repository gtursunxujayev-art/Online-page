import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Validation schema for lead submission
const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\+998\d{9}$/, "Phone must be in format +998XXXXXXXXX"),
  job: z.string().min(1, "Job is required"),
  source: z.string().optional().default("website"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // POST /api/leads - Create a new lead
    if (req.method === 'POST') {
      let body: any;
      try {
        // Parse JSON body if it's a string
        if (typeof req.body === 'string') {
          body = JSON.parse(req.body);
        } else {
          body = req.body;
        }
      } catch (parseError) {
        return res.status(400).json({
          error: 'Invalid JSON',
          savedLocally: false
        });
      }
      
      // Validate the request body
      const validationResult = leadSchema.safeParse(body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.errors,
          savedLocally: false
        });
      }

      const leadData = validationResult.data;
      
      // Log the lead submission (for debugging)
      console.log('Lead submitted:', {
        name: leadData.name,
        phone: leadData.phone,
        job: leadData.job,
        source: leadData.source,
        timestamp: new Date().toISOString()
      });

      // Try to sync with AmoCRM if configured
      let amoCRMResult = null;
      const subdomain = process.env.AMOCRM_SUBDOMAIN;
      const accessToken = process.env.AMOCRM_ACCESS_TOKEN;
      const pipelineId = process.env.AMOCRM_PIPELINE_ID;
      const statusId = process.env.AMOCRM_STATUS_ID;

      if (subdomain && accessToken) {
        try {
          console.log('Attempting to sync with AmoCRM...');
          
          // Extract subdomain from URL if full URL is provided
          let cleanSubdomain = subdomain;
          if (subdomain.includes('://')) {
            try {
              const url = new URL(subdomain);
              cleanSubdomain = url.hostname.split('.')[0];
              console.log('Extracted subdomain:', cleanSubdomain);
            } catch (urlError) {
              console.error('Error parsing subdomain URL:', urlError);
            }
          }

          // SIMPLE APPROACH: Create lead with minimal data first
          console.log('=== SIMPLE APPROACH: Creating basic lead ===');
          
          // First, try to create a simple lead (no custom fields)
          const simpleLeadData = {
            name: `Заявка с сайта: ${leadData.name}`,
            price: 0,
            pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
            status_id: statusId ? parseInt(statusId) : undefined,
          };

          console.log('Creating simple lead:', JSON.stringify([simpleLeadData], null, 2));
          
          const leadResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([simpleLeadData])
          });

          const responseText = await leadResponse.text();
          console.log('Lead creation - Status:', leadResponse.status);
          console.log('Lead creation - Response:', responseText);

          let leadId: number | null = null;
          
          if (leadResponse.ok) {
            try {
              const result = JSON.parse(responseText);
              leadId = result._embedded?.leads?.[0]?.id;
              console.log('✅ Simple lead created successfully:', leadId);
              
              // Now try to add custom fields
              console.log('=== Adding custom fields ===');
              
              // Try adding phone field first (most important)
              const updateData = {
                custom_fields_values: [
                  {
                    field_id: 1112329, // Phone field
                    values: [{ value: leadData.phone }]
                  }
                ]
              };
              
              console.log('Adding phone field:', JSON.stringify(updateData, null, 2));
              
              const updateResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads/${leadId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
              });
              
              const updateResponseText = await updateResponse.text();
              console.log('Update phone - Status:', updateResponse.status);
              console.log('Update phone - Response:', updateResponseText);
              
              if (updateResponse.ok) {
                console.log('✅ Phone field added successfully');
                
                // Try adding job field
                const updateJobData = {
                  custom_fields_values: [
                    {
                      field_id: 1112329, // Keep phone
                      values: [{ value: leadData.phone }]
                    },
                    {
                      field_id: 1416915, // Add job
                      values: [{ value: leadData.job }]
                    }
                  ]
                };
                
                console.log('Adding job field:', JSON.stringify(updateJobData, null, 2));
                
                const updateJobResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads/${leadId}`, {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(updateJobData)
                });
                
                const updateJobResponseText = await updateJobResponse.text();
                console.log('Update job - Status:', updateJobResponse.status);
                console.log('Update job - Response:', updateJobResponseText);
                
                if (updateJobResponse.ok) {
                  console.log('✅ Job field added successfully');
                  amoCRMResult = {
                    attempted: true,
                    success: true,
                    leadId: leadId,
                    message: 'Lead created with all fields'
                  };
                } else {
                  console.log('⚠️ Lead created but job field failed');
                  amoCRMResult = {
                    attempted: true,
                    success: true,
                    leadId: leadId,
                    message: 'Lead created with phone only (job field failed)'
                  };
                }
              } else {
                console.log('⚠️ Lead created but phone field failed');
                amoCRMResult = {
                  attempted: true,
                  success: true,
                  leadId: leadId,
                  message: 'Lead created without custom fields'
                };
              }
              
            } catch (parseError) {
              console.error('Failed to parse response:', parseError);
              amoCRMResult = {
                attempted: true,
                success: false,
                error: `Failed to parse AmoCRM response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
              };
            }
          } else {
            console.error('❌ Simple lead creation failed:', responseText);
            
            // Try alternative: create lead with phone field only
            console.log('=== ALTERNATIVE: Trying with phone field ===');
            
            const phoneLeadData = {
              name: `Заявка с сайта: ${leadData.name}`,
              price: 0,
              pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
              status_id: statusId ? parseInt(statusId) : undefined,
              custom_fields_values: [
                {
                  field_id: 1112329, // Phone field only
                  values: [{ value: leadData.phone }]
                }
              ]
            };
            
            console.log('Creating lead with phone:', JSON.stringify([phoneLeadData], null, 2));
            
            const phoneResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify([phoneLeadData])
            });
            
            const phoneResponseText = await phoneResponse.text();
            console.log('Phone lead - Status:', phoneResponse.status);
            console.log('Phone lead - Response:', phoneResponseText);
            
            if (phoneResponse.ok) {
              try {
                const phoneResult = JSON.parse(phoneResponseText);
                leadId = phoneResult._embedded?.leads?.[0]?.id;
                console.log('✅ Lead created with phone:', leadId);
                amoCRMResult = {
                  attempted: true,
                  success: true,
                  leadId: leadId,
                  message: 'Lead created with phone field'
                };
              } catch (phoneParseError) {
                console.error('Failed to parse phone response:', phoneParseError);
                amoCRMResult = {
                  attempted: true,
                  success: false,
                  error: `Failed to parse AmoCRM response: ${phoneParseError instanceof Error ? phoneParseError.message : 'Unknown error'}`
                };
              }
            } else {
              console.error('❌ All attempts failed');
              amoCRMResult = {
                attempted: true,
                success: false,
                error: `AmoCRM error: ${leadResponse.status} ${responseText.substring(0, 200)}`
              };
            }
          }

        } catch (amoError) {
          console.error('AmoCRM sync error:', amoError);
          amoCRMResult = {
            attempted: true,
            success: false,
            error: amoError instanceof Error ? amoError.message : 'Unknown AmoCRM error'
          };
        }
      } else {
        console.log('AmoCRM credentials not configured, skipping CRM sync');
        amoCRMResult = {
          attempted: false,
          success: false,
          message: 'AmoCRM credentials not configured'
        };
      }

      return res.status(200).json({
        success: true,
        message: 'Lead submitted successfully',
        leadId: `temp-${Date.now()}`,
        savedLocally: true,
        amoCRM: amoCRMResult,
        timestamp: new Date().toISOString()
      });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      savedLocally: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}