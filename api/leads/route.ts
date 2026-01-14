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

          // OPTION 1: Try creating lead with ALL fields at once (simplest)
          console.log('=== OPTION 1: Creating lead with all fields ===');
          
          const leadDataFull = {
            name: `Заявка с сайта: ${leadData.name}`,
            price: 0,
            pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
            status_id: statusId ? parseInt(statusId) : undefined,
            custom_fields_values: [
              {
                field_id: 142993, // Phone field
                values: [{ value: leadData.phone, enum_code: "WORK" }]
              },
              {
                field_id: 142273, // Job field
                values: [{ value: leadData.job }]
              }
            ]
          };

          console.log('Creating lead with data:', JSON.stringify([leadDataFull], null, 2));
          
          const leadResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([leadDataFull])
          });

          const responseText = await leadResponse.text();
          console.log('Lead creation - Status:', leadResponse.status);
          console.log('Lead creation - Response:', responseText);

          let leadId: number | null = null;
          
          if (leadResponse.ok) {
            try {
              const result = JSON.parse(responseText);
              leadId = result._embedded?.leads?.[0]?.id;
              console.log('✅ Lead created successfully with all fields:', leadId);
              
              amoCRMResult = {
                attempted: true,
                success: true,
                leadId: leadId,
                message: 'Lead created with all fields'
              };
              
            } catch (parseError) {
              console.error('Failed to parse response:', parseError);
              
              // OPTION 2: Try without enum_code for phone
              console.log('=== OPTION 2: Trying without enum_code ===');
              
              const leadDataSimple = {
                name: `Заявка с сайта: ${leadData.name}`,
                price: 0,
                pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
                status_id: statusId ? parseInt(statusId) : undefined,
                custom_fields_values: [
                  {
                    field_id: 142993, // Phone field
                    values: [{ value: leadData.phone }]  // No enum_code
                  },
                  {
                    field_id: 142273, // Job field
                    values: [{ value: leadData.job }]
                  }
                ]
              };
              
              console.log('Trying simple lead data:', JSON.stringify([leadDataSimple], null, 2));
              
              const simpleResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify([leadDataSimple])
              });
              
              const simpleResponseText = await simpleResponse.text();
              console.log('Simple lead - Status:', simpleResponse.status);
              console.log('Simple lead - Response:', simpleResponseText);
              
              if (simpleResponse.ok) {
                try {
                  const simpleResult = JSON.parse(simpleResponseText);
                  leadId = simpleResult._embedded?.leads?.[0]?.id;
                  console.log('✅ Lead created successfully (simple):', leadId);
                  
                  amoCRMResult = {
                    attempted: true,
                    success: true,
                    leadId: leadId,
                    message: 'Lead created with simple field structure'
                  };
                } catch (simpleParseError) {
                  console.error('Failed to parse simple response:', simpleParseError);
                  amoCRMResult = {
                    attempted: true,
                    success: false,
                    error: `Failed to parse AmoCRM response: ${simpleParseError instanceof Error ? simpleParseError.message : 'Unknown error'}`
                  };
                }
              } else {
                // OPTION 3: Try with just phone field
                console.log('=== OPTION 3: Trying with just phone field ===');
                
                const phoneOnlyData = {
                  name: `Заявка с сайта: ${leadData.name}`,
                  price: 0,
                  pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
                  status_id: statusId ? parseInt(statusId) : undefined,
                  custom_fields_values: [
                    {
                      field_id: 142993, // Phone field only
                      values: [{ value: leadData.phone }]
                    }
                  ]
                };
                
                console.log('Trying phone-only lead data:', JSON.stringify([phoneOnlyData], null, 2));
                
                const phoneResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify([phoneOnlyData])
                });
                
                const phoneResponseText = await phoneResponse.text();
                console.log('Phone-only lead - Status:', phoneResponse.status);
                console.log('Phone-only lead - Response:', phoneResponseText);
                
                if (phoneResponse.ok) {
                  try {
                    const phoneResult = JSON.parse(phoneResponseText);
                    leadId = phoneResult._embedded?.leads?.[0]?.id;
                    console.log('✅ Lead created with phone only:', leadId);
                    
                    // Try to update with job field
                    console.log('=== Trying to update with job field ===');
                    
                    const updateData = {
                      custom_fields_values: [
                        {
                          field_id: 142993, // Keep phone
                          values: [{ value: leadData.phone }]
                        },
                        {
                          field_id: 142273, // Add job
                          values: [{ value: leadData.job }]
                        }
                      ]
                    };
                    
                    console.log('Updating lead with job:', JSON.stringify(updateData, null, 2));
                    
                    const updateResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads/${leadId}`, {
                      method: 'PATCH',
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(updateData)
                    });
                    
                    const updateResponseText = await updateResponse.text();
                    console.log('Update job - Status:', updateResponse.status);
                    console.log('Update job - Response:', updateResponseText);
                    
                    amoCRMResult = {
                      attempted: true,
                      success: true,
                      leadId: leadId,
                      message: updateResponse.ok ? 'Lead created and updated with job' : 'Lead created with phone only'
                    };
                    
                  } catch (phoneParseError) {
                    console.error('Failed to parse phone-only response:', phoneParseError);
                    amoCRMResult = {
                      attempted: true,
                      success: false,
                      error: `Failed to parse AmoCRM response: ${phoneParseError instanceof Error ? phoneParseError.message : 'Unknown error'}`
                    };
                  }
                } else {
                  // OPTION 4: Try minimal lead (no custom fields)
                  console.log('=== OPTION 4: Trying minimal lead (no custom fields) ===');
                  
                  const minimalData = {
                    name: `Заявка с сайта: ${leadData.name}`,
                    price: 0,
                    pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
                    status_id: statusId ? parseInt(statusId) : undefined,
                  };
                  
                  console.log('Trying minimal lead data:', JSON.stringify([minimalData], null, 2));
                  
                  const minimalResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([minimalData])
                  });
                  
                  const minimalResponseText = await minimalResponse.text();
                  console.log('Minimal lead - Status:', minimalResponse.status);
                  console.log('Minimal lead - Response:', minimalResponseText);
                  
                  if (minimalResponse.ok) {
                    try {
                      const minimalResult = JSON.parse(minimalResponseText);
                      leadId = minimalResult._embedded?.leads?.[0]?.id;
                      console.log('✅ Minimal lead created:', leadId);
                      
                      amoCRMResult = {
                        attempted: true,
                        success: true,
                        leadId: leadId,
                        message: 'Lead created without custom fields'
                      };
                    } catch (minimalParseError) {
                      console.error('Failed to parse minimal response:', minimalParseError);
                      amoCRMResult = {
                        attempted: true,
                        success: false,
                        error: `Failed to parse AmoCRM response: ${minimalParseError instanceof Error ? minimalParseError.message : 'Unknown error'}`
                      };
                    }
                  } else {
                    amoCRMResult = {
                      attempted: true,
                      success: false,
                      error: `All attempts failed. Last error: ${phoneResponse.status} ${phoneResponseText.substring(0, 200)}`
                    };
                  }
                }
              }
            }
          } else {
            console.error('❌ Lead creation failed:', responseText);
            amoCRMResult = {
              attempted: true,
              success: false,
              error: `AmoCRM error: ${leadResponse.status} ${responseText.substring(0, 200)}`
            };
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