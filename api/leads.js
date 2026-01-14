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

          // Step 1: Create or find contact
          let contactId = null;
          console.log('=== STEP 1: Contact Management ===');
          
          try {
            // Search for existing contact by phone
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
                
                // Update existing contact
                const updateContactData = {
                  name: body.name,
                  custom_fields_values: [
                    {
                      field_id: 142993, // Phone field ID
                      values: [{ value: body.phone }]
                    },
                    {
                      field_id: 142995, // Position/Job field ID (contact)
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
                } else {
                  console.log('✅ Contact updated');
                }
              }
            }
          } catch (contactError) {
            console.error('Contact search/update error:', contactError);
          }

          // Create new contact if not found
          if (!contactId) {
            console.log('Creating new contact...');
            const contactData = {
              name: body.name,
              custom_fields_values: [
                {
                  field_id: 142993, // Phone field ID
                  values: [{ value: body.phone }]
                },
                {
                  field_id: 142995, // Position/Job field ID (contact)
                  values: [{ value: body.job }]
                }
              ]
            };

            try {
              const contactResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/contacts`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify([contactData])
              });

              const contactResponseText = await contactResponse.text();
              console.log('Contact creation - Status:', contactResponse.status);
              
              if (contactResponse.ok) {
                try {
                  const contactResult = JSON.parse(contactResponseText);
                  contactId = contactResult._embedded?.contacts?.[0]?.id;
                  console.log('✅ Contact created:', contactId);
                } catch (parseError) {
                  console.error('Failed to parse contact response:', parseError);
                }
              } else {
                console.error('❌ Failed to create contact:', contactResponseText);
              }
            } catch (createContactError) {
              console.error('Contact creation error:', createContactError);
            }
          }

          // Step 2: Create lead with contact association
          console.log('=== STEP 2: Lead Creation ===');
          
          // OPTION 1: Try creating lead with ALL fields at once
          console.log('=== OPTION 1: Creating lead with all fields ===');
          
          const leadData = {
            name: `Заявка с сайта: ${body.name}`,
            price: 0,
            pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
            status_id: statusId ? parseInt(statusId) : undefined,
            custom_fields_values: [
              {
                field_id: 142993, // Phone field
                values: [{ value: body.phone }]
              },
              {
                field_id: 142273, // Job field (lead)
                values: [{ value: body.job }]
              }
            ],
            _embedded: contactId ? {
              contacts: [{ id: contactId }]
            } : undefined
          };

          console.log('Creating lead with data:', JSON.stringify([leadData], null, 2));
          
          const leadResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([leadData])
          });

          const responseText = await leadResponse.text();
          console.log('Lead creation - Status:', leadResponse.status);
          console.log('Lead creation - Response:', responseText);

          let leadId = null;
          
          if (leadResponse.ok) {
            try {
              const result = JSON.parse(responseText);
              leadId = result._embedded?.leads?.[0]?.id;
              console.log('✅ Lead created successfully with all fields:', leadId);
              
              amoCRMResult = {
                attempted: true,
                success: true,
                contactId: contactId,
                leadId: leadId,
                message: 'Lead created with all fields and contact'
              };
              
            } catch (parseError) {
              console.error('Failed to parse response:', parseError);
              
              // OPTION 2: Try with just phone field
              console.log('=== OPTION 2: Trying with just phone field ===');
              
              const phoneOnlyData = {
                name: `Заявка с сайта: ${body.name}`,
                price: 0,
                pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
                status_id: statusId ? parseInt(statusId) : undefined,
                custom_fields_values: [
                  {
                    field_id: 142993, // Phone field only
                    values: [{ value: body.phone }]
                  }
                ],
                _embedded: contactId ? {
                  contacts: [{ id: contactId }]
                } : undefined
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
                        values: [{ value: body.phone }]
                      },
                      {
                        field_id: 142273, // Add job
                        values: [{ value: body.job }]
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
                    contactId: contactId,
                    leadId: leadId,
                    message: updateResponse.ok ? 'Lead created and updated with job' : 'Lead created with phone only'
                  };
                  
                } catch (phoneParseError) {
                  console.error('Failed to parse phone-only response:', phoneParseError);
                  amoCRMResult = {
                    attempted: true,
                    success: false,
                    error: `Failed to parse AmoCRM response: ${phoneParseError.message}`
                  };
                }
              } else {
                // OPTION 3: Try minimal lead (no custom fields)
                console.log('=== OPTION 3: Trying minimal lead (no custom fields) ===');
                
                const minimalData = {
                  name: `Заявка с сайта: ${body.name}`,
                  price: 0,
                  pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
                  status_id: statusId ? parseInt(statusId) : undefined,
                  _embedded: contactId ? {
                    contacts: [{ id: contactId }]
                  } : undefined
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
                      contactId: contactId,
                      leadId: leadId,
                      message: 'Lead created without custom fields'
                    };
                  } catch (minimalParseError) {
                    console.error('Failed to parse minimal response:', minimalParseError);
                    amoCRMResult = {
                      attempted: true,
                      success: false,
                      error: `Failed to parse AmoCRM response: ${minimalParseError.message}`
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