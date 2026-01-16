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
});

// Helper function to create or update contact in amoCRM
async function createOrUpdateContact(
  cleanSubdomain: string,
  accessToken: string,
  name: string,
  phone: string,
  job: string
): Promise<number | null> {
  try {
    const contactsUrl = `https://${cleanSubdomain}.amocrm.ru/api/v4/contacts`;
    
    // Search for existing contact by phone
    const searchResponse = await fetch(`${contactsUrl}?query=${encodeURIComponent(phone)}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    let contactId: number | null = null;

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      const existingContacts = searchResult._embedded?.contacts;
      
      if (existingContacts && existingContacts.length > 0) {
        // Update existing contact
        contactId = existingContacts[0].id;
        console.log('Found existing contact:', contactId);
        
        const updateData = {
          name: name,
          custom_fields_values: [
            {
              field_id: 1112329, // Phone field
              values: [{ value: phone }]
            },
            {
              field_id: 1416915, // Job field
              values: [{ value: job }]
            }
          ]
        };

        const updateResponse = await fetch(`${contactsUrl}/${contactId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          console.log('✅ Contact updated successfully');
        } else {
          const updateText = await updateResponse.text();
          console.error('Failed to update contact:', updateText);
        }
      }
    }

    // If no existing contact, create new one
    if (!contactId) {
      console.log('Creating new contact...');
      const contactData = {
        name: name,
        custom_fields_values: [
          {
            field_id: 1112329, // Phone field
            values: [{ value: phone }]
          },
          {
            field_id: 1416915, // Job field
            values: [{ value: job }]
          }
        ]
      };

      const createResponse = await fetch(contactsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([contactData])
      });

      if (createResponse.ok) {
        const createResult = await createResponse.json();
        contactId = createResult._embedded?.contacts?.[0]?.id;
        console.log('✅ Contact created successfully:', contactId);
      } else {
        const createText = await createResponse.text();
        console.error('Failed to create contact:', createText);
        return null;
      }
    }

    return contactId;
  } catch (error) {
    console.error('Error in createOrUpdateContact:', error);
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
      console.log('Lead submitted:', {
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

          // Step 1: Create or update contact
          console.log('=== Step 1: Creating/updating contact ===');
          const contactId = await createOrUpdateContact(
            cleanSubdomain,
            accessToken,
            leadData.name,
            leadData.phone,
            leadData.job
          );

          if (!contactId) {
            console.error('❌ Failed to create/update contact, but will try to create lead anyway');
          }

          // Step 2: Build custom fields array for lead (UTM tracking and referrer)
          const customFields: Array<{ field_id: number; values: Array<{ value: string }> }> = [];
          
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

          // Step 3: Create lead with contact attached and custom fields
          console.log('=== Step 2: Creating lead with contact and UTM fields ===');
          
          const leadDataPayload: any = {
            name: `Заявка с сайта: ${leadData.name}`,
            price: 0,
            pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
            status_id: statusId ? parseInt(statusId) : undefined,
          };

          // Attach contact if we have one
          if (contactId) {
            leadDataPayload._embedded = {
              contacts: [{ id: contactId }]
            };
          }

          // Add custom fields if any
          if (customFields.length > 0) {
            leadDataPayload.custom_fields_values = customFields;
          }

          console.log('Creating lead:', JSON.stringify([leadDataPayload], null, 2));
          
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
          console.log('Lead creation - Response:', responseText);

          if (leadResponse.ok) {
            try {
              const result = JSON.parse(responseText);
              const leadId = result._embedded?.leads?.[0]?.id;
              console.log('✅ Lead created successfully with contact and UTM fields:', leadId);
              amoCRMResult = {
                attempted: true,
                success: true,
                leadId: leadId,
                contactId: contactId,
                message: `Lead created with contact${contactId ? ' attached' : ' (contact creation failed)'} and ${customFields.length} tracking fields`
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