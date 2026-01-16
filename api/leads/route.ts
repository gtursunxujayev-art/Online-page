import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Validation schema for lead submission
const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\+998\d{9}$/, "Phone must be in format +998XXXXXXXXX"),
  job: z.string().min(1, "Job is required"),
  source: z.string().optional().default("website"),
  // UTM tracking parameters
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
  utm_referrer: z.string().optional(),
  roistat: z.string().optional(),
  referrer: z.string().optional(),
  openstat_service: z.string().optional(),
  // Additional tracking fields from frontend
  form: z.string().optional(),
  fbclid: z.string().optional(),
  gclid: z.string().optional(),
});

// Helper function to create contact in amoCRM
async function createContact(
  cleanSubdomain: string,
  accessToken: string,
  name: string,
  phone: string
): Promise<number | null> {
  try {
    console.log('=== CONTACT CREATION DEBUG ===');
    console.log('Parameters:', { cleanSubdomain, name, phone });
    console.log('Access token present:', !!accessToken);
    
    const contactsUrl = `https://${cleanSubdomain}.amocrm.ru/api/v4/contacts`;
    console.log('Contacts URL:', contactsUrl);
    
    console.log('Creating new contact (skipping search for now)...');
    
    // Use standard amoCRM PHONE field format with enum_code
    // Also try with first_name/last_name instead of just name
    const contactData = {
      name: name,
      // Try splitting name into first_name and last_name
      first_name: name.split(' ')[0] || name,
      last_name: name.split(' ').slice(1).join(' ') || 'Not provided',
      custom_fields_values: [
        {
          field_code: "PHONE",
          values: [{ 
            value: phone,
            enum_code: "MOB"  // Mobile phone type
          }]
        }
      ]
    };

    console.log('Creating contact with data:', JSON.stringify([contactData], null, 2));
    
    const createResponse = await fetch(contactsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([contactData])
    });

    const createResponseText = await createResponse.text();
    console.log('Contact creation - Status:', createResponse.status);
    console.log('Contact creation - Response (first 500 chars):', createResponseText.substring(0, 500));
    console.log('Contact creation - Full response length:', createResponseText.length);

    if (createResponse.ok) {
      try {
        const createResult = JSON.parse(createResponseText) as any;
        console.log('Contact creation parsed successfully');
        console.log('Create result keys:', Object.keys(createResult));
        console.log('Create result _embedded keys:', createResult._embedded ? Object.keys(createResult._embedded) : 'No _embedded');
        
        const contactId = createResult._embedded?.contacts?.[0]?.id;
        if (contactId) {
          console.log('✅ Contact created successfully, ID:', contactId);
          console.log('Created contact details:', createResult._embedded?.contacts?.[0]);
          console.log('=== CONTACT CREATION COMPLETE ===');
          return contactId;
        } else {
          console.error('❌ Contact creation succeeded but no contact ID returned');
          console.log('Full create result:', createResult);
          return null;
        }
      } catch (parseError) {
        console.error('Failed to parse create response:', parseError);
        console.log('Raw response that failed to parse:', createResponseText);
        return null;
      }
    } else {
      console.error('❌ Failed to create contact - HTTP error');
      console.log('Full error response:', createResponseText);
      return null;
    }
  } catch (error) {
    console.error('Error in createContact:', error);
    return null;
  }
}

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
      console.log('=== LEAD SUBMISSION DEBUG ===');
      console.log('Lead data received:', {
        name: leadData.name,
        phone: leadData.phone,
        job: leadData.job,
        source: leadData.source,
        utm: {
          utm_source: leadData.utm_source,
          utm_medium: leadData.utm_medium,
          utm_campaign: leadData.utm_campaign,
          utm_content: leadData.utm_content,
          utm_term: leadData.utm_term,
          utm_referrer: leadData.utm_referrer,
          roistat: leadData.roistat,
          referrer: leadData.referrer,
          openstat_service: leadData.openstat_service,
        },
        timestamp: new Date().toISOString()
      });
      
      // Check which UTM fields have values
      const utmFieldsWithValues = Object.entries({
        utm_source: leadData.utm_source,
        utm_medium: leadData.utm_medium,
        utm_campaign: leadData.utm_campaign,
        utm_content: leadData.utm_content,
        utm_term: leadData.utm_term,
        utm_referrer: leadData.utm_referrer,
        roistat: leadData.roistat,
        referrer: leadData.referrer,
        openstat_service: leadData.openstat_service,
      }).filter(([key, value]) => value).map(([key]) => key);
      
      console.log('UTM fields with values:', utmFieldsWithValues);

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

          // Step 1: Create contact
          console.log('=== Step 1: Creating contact ===');
          const contactId = await createContact(
            cleanSubdomain,
            accessToken,
            leadData.name,
            leadData.phone
          );

          if (!contactId) {
            console.error('❌ Failed to create/update contact, but will try to create lead anyway');
          }

          // Step 2: Build custom fields array for lead (phone, job, UTM tracking and referrer)
          const customFields: Array<{ field_id: number; values: Array<{ value: string }> }> = [];
          
          // Add phone field to lead
          customFields.push({
            field_id: 1112329, // Phone field on lead
            values: [{ value: leadData.phone }]
          });
          
          // Add job field to lead
          customFields.push({
            field_id: 1416915, // Job field on lead
            values: [{ value: leadData.job }]
          });
          
          // Add UTM tracking fields if they exist
          if (leadData.utm_content) {
            customFields.push({
              field_id: 1112337, // utm_content
              values: [{ value: leadData.utm_content }]
            });
          }
          if (leadData.utm_medium) {
            customFields.push({
              field_id: 1112339, // utm_medium
              values: [{ value: leadData.utm_medium }]
            });
          }
          if (leadData.utm_campaign) {
            customFields.push({
              field_id: 1112341, // utm_campaign
              values: [{ value: leadData.utm_campaign }]
            });
          }
          if (leadData.utm_source) {
            customFields.push({
              field_id: 1112343, // utm_source
              values: [{ value: leadData.utm_source }]
            });
          }
          if (leadData.utm_term) {
            customFields.push({
              field_id: 1112345, // utm_term
              values: [{ value: leadData.utm_term }]
            });
          }
          if (leadData.utm_referrer) {
            customFields.push({
              field_id: 1112347, // utm_referrer
              values: [{ value: leadData.utm_referrer }]
            });
          }
          if (leadData.roistat) {
            customFields.push({
              field_id: 1112349, // roistat
              values: [{ value: leadData.roistat }]
            });
          }
          if (leadData.referrer) {
            customFields.push({
              field_id: 1112351, // referrer
              values: [{ value: leadData.referrer }]
            });
          }
          if (leadData.openstat_service) {
            customFields.push({
              field_id: 1112353, // openstat_service
              values: [{ value: leadData.openstat_service }]
            });
          }

          // Step 3: Create lead with custom fields (without contact - will link separately)
          console.log('=== Step 2: Creating lead with UTM fields ===');
          
          const leadDataPayload: any = {
            name: `Заявка с сайта: ${leadData.name}`,
            price: 0,
            pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
            status_id: statusId ? parseInt(statusId) : undefined,
          };

          // Add custom fields if any
          if (customFields.length > 0) {
            leadDataPayload.custom_fields_values = customFields;
          }

          console.log('=== LEAD CREATION PAYLOAD DEBUG ===');
          console.log('Contact ID to link later:', contactId);
          console.log('Custom fields count:', customFields.length);
          console.log('Custom fields:', customFields);
          console.log('Full lead payload:', JSON.stringify([leadDataPayload], null, 2));
          console.log('Lead creation URL:', `https://${cleanSubdomain}.amocrm.ru/api/v4/leads`);
          
          const leadResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([leadDataPayload])
          });

          const responseText = await leadResponse.text();
          console.log('Lead creation - Status:', leadResponse.status);
          console.log('Lead creation - Response (first 500 chars):', responseText.substring(0, 500));
          console.log('Lead creation - Full response length:', responseText.length);

          let leadId: number | null = null;
          let contactLinked = false;

          if (leadResponse.ok) {
            try {
              const result = JSON.parse(responseText) as any;
              console.log('Lead creation parsed successfully');
              console.log('Lead result keys:', Object.keys(result));
              console.log('Lead result _embedded keys:', result._embedded ? Object.keys(result._embedded) : 'No _embedded');
              
              leadId = result._embedded?.leads?.[0]?.id;
              if (leadId) {
                console.log('✅ Lead created successfully, ID:', leadId);
                console.log('Created lead details:', result._embedded?.leads?.[0]);
              } else {
                console.error('❌ Lead creation succeeded but no lead ID returned');
                console.log('Full lead result:', result);
              }
              
              // Step 4: Link contact to lead if we have both IDs
              if (leadId && contactId) {
                console.log('=== Step 3: Linking contact to lead ===');
                console.log(`Linking contact ${contactId} to lead ${leadId}`);
                
                const linkUrl = `https://${cleanSubdomain}.amocrm.ru/api/v4/leads/${leadId}/link`;
                const linkPayload = [
                  {
                    to_entity_id: contactId,
                    to_entity_type: "contacts"
                  }
                ];
                
                console.log('Link URL:', linkUrl);
                console.log('Link payload:', JSON.stringify(linkPayload, null, 2));
                
                const linkResponse = await fetch(linkUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(linkPayload)
                });
                
                const linkResponseText = await linkResponse.text();
                console.log('Link response - Status:', linkResponse.status);
                console.log('Link response - Body (first 500 chars):', linkResponseText.substring(0, 500));
                console.log('Link response - Full response length:', linkResponseText.length);
                
                if (linkResponse.ok) {
                  console.log('✅ Contact linked to lead successfully');
                  contactLinked = true;
                  try {
                    const linkResult = JSON.parse(linkResponseText) as any;
                    console.log('Link result:', linkResult);
                  } catch (e) {
                    console.log('Link response not JSON or empty');
                  }
                } else {
                  console.error('❌ Failed to link contact to lead');
                  console.log('Full link error response:', linkResponseText);
                }
              }
              
              amoCRMResult = {
                attempted: true,
                success: true,
                leadId: leadId,
                contactId: contactId,
                contactLinked: contactLinked,
                message: `Lead created${contactLinked ? ' with contact linked' : contactId ? ' (contact link failed)' : ' (no contact)'} and ${customFields.length} tracking fields`
              };
            } catch (parseError) {
              console.error('Failed to parse response:', parseError);
              amoCRMResult = {
                attempted: true,
                success: false,
                error: `Failed to parse AmoCRM response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
              };
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