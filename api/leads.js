// JavaScript API route for leads with AmoCRM integration
export default async function handler(req, res) {
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
    return res.status(200).end();
  }

  try {
    // POST /api/leads - Create a new lead
    if (req.method === 'POST') {
      let body;
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
      
      // Simple validation
      if (!body.name || !body.phone || !body.job) {
        return res.status(400).json({
          error: 'Validation failed',
          details: 'Name, phone, and job are required',
          savedLocally: false
        });
      }

      // Log the lead submission
      console.log('Lead submitted:', {
        name: body.name,
        phone: body.phone,
        job: body.job,
        source: body.source || 'website',
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

          // First, try to find existing contact by phone
          let contactId = null;
          const searchResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/contacts?query=${encodeURIComponent(body.phone)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (searchResponse.ok) {
            const searchResult = await searchResponse.json();
            if (searchResult._embedded?.contacts?.length > 0) {
              contactId = searchResult._embedded.contacts[0].id;
              console.log('Found existing contact:', contactId);
              
              // Update existing contact with new info
              const updateContactData = {
                name: body.name,
                custom_fields_values: [
                  {
                    field_id: 142993, // Phone field ID
                    values: [{ value: body.phone }]
                  },
                  {
                    field_id: 142995, // Position/Job field ID
                    values: [{ value: body.job }]
                  }
                ]
              };

              const updateResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/contacts/${contactId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateContactData)
              });

              if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.error('Failed to update contact:', updateResponse.status, errorText);
              }
            }
          }

          // If no existing contact found, create new one
          if (!contactId) {
            const contactData = {
              name: body.name,
              custom_fields_values: [
                {
                  field_id: 142993, // Phone field ID (common in AmoCRM)
                  values: [{ value: body.phone }]
                },
                {
                  field_id: 142995, // Position/Job field ID
                  values: [{ value: body.job }]
                }
              ]
            };

            console.log('Creating contact with data:', JSON.stringify(contactData, null, 2));
            
            // Create contact
            const contactResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/contacts`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify([contactData])
            });

            const contactResponseText = await contactResponse.text();
            console.log('Contact API Response Status:', contactResponse.status);
            console.log('Contact API Response:', contactResponseText);
            
            if (contactResponse.ok) {
              try {
                const contactResult = JSON.parse(contactResponseText);
                contactId = contactResult._embedded?.contacts?.[0]?.id;
                console.log('✅ Contact created in AmoCRM:', contactId);
              } catch (parseError) {
                console.error('Failed to parse contact response:', parseError);
              }
            } else {
              console.error('❌ Failed to create contact:', contactResponse.status, contactResponseText);
            }
          }

          // Create lead in AmoCRM with all details
          const leadName = `Заявка с сайта: ${body.name}`;
          
          // Prepare custom fields for the lead
          const customFields = [];
          
          // Add job/position field (from your existing field)
          customFields.push({
            field_id: 142273, // Job field ID - keep your existing one
            values: [{ value: body.job }]
          });
          
          // Add phone field to lead as well (in case contact creation failed)
          customFields.push({
            field_id: 142993, // Phone field ID - same as contact
            values: [{ value: body.phone }]
          });
          
          // Add UTM fields if provided
          if (body.utm_source) {
            customFields.push({
              field_id: 1112343, // utm_source field ID from your AmoCRM
              values: [{ value: body.utm_source }]
            });
          }
          
          if (body.utm_medium) {
            customFields.push({
              field_id: 1112339, // utm_medium field ID
              values: [{ value: body.utm_medium }]
            });
          }
          
          if (body.utm_campaign) {
            customFields.push({
              field_id: 1112341, // utm_campaign field ID
              values: [{ value: body.utm_campaign }]
            });
          }
          
          if (body.utm_content) {
            customFields.push({
              field_id: 1112337, // utm_content field ID
              values: [{ value: body.utm_content }]
            });
          }
          
          if (body.utm_referrer) {
            customFields.push({
              field_id: 1112347, // utm_referrer field ID
              values: [{ value: body.utm_referrer }]
            });
          }
          
          if (body.referrer) {
            customFields.push({
              field_id: 1112351, // referrer field ID
              values: [{ value: body.referrer }]
            });
          }
          
          if (body.form) {
            customFields.push({
              field_id: 1112361, // form field ID
              values: [{ value: body.form }]
            });
          }
          
          if (body.fbclid) {
            customFields.push({
              field_id: 1112373, // fbclid field ID
              values: [{ value: body.fbclid }]
            });
          }
          
          // Add source (original source field)
          if (body.source) {
            customFields.push({
              field_id: 142271, // Your existing source field ID
              values: [{ value: body.source }]
            });
          }
          
          // Add timestamp/notes
          customFields.push({
            field_id: 142275, // Notes field ID
            values: [{ value: `Submitted: ${new Date().toISOString()}\nName: ${body.name}\nPhone: ${body.phone}\nJob: ${body.job}` }]
          });

          const leadData = {
            name: leadName,
            price: 0,
            pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
            status_id: statusId ? parseInt(statusId) : undefined,
            custom_fields_values: customFields,
            _embedded: contactId ? {
              contacts: [{ id: contactId }]
            } : undefined
          };

          console.log('Creating lead with data:', JSON.stringify(leadData, null, 2));
          
          const leadResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([leadData])
          });

          let leadId = null;
          const responseText = await leadResponse.text();
          console.log('Lead API Response Status:', leadResponse.status);
          console.log('Lead API Response:', responseText);
          
          if (leadResponse.ok) {
            try {
              const leadResult = JSON.parse(responseText);
              leadId = leadResult._embedded?.leads?.[0]?.id;
              console.log('✅ Lead created in AmoCRM:', leadId);
              amoCRMResult = {
                attempted: true,
                success: true,
                contactId: contactId,
                leadId: leadId,
                message: 'Successfully synced with AmoCRM'
              };
            } catch (parseError) {
              console.error('Failed to parse lead response:', parseError);
              amoCRMResult = {
                attempted: true,
                success: false,
                error: `Failed to parse AmoCRM response: ${parseError.message}`
              };
            }
          } else {
            console.error('❌ Failed to create lead:', leadResponse.status, responseText);
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
            error: amoError.message || 'Unknown AmoCRM error'
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

    // GET /api/leads - For testing
    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'API is working!',
        endpoint: '/api/leads',
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
      message: error.message || 'Unknown error'
    });
  }
}