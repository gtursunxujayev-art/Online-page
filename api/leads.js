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

          // PHASE 1: First test with minimal lead data (no custom fields)
          console.log('=== PHASE 1: Testing with minimal lead data ===');
          
          const minimalLeadData = {
            name: `Заявка с сайта: ${body.name}`,
            price: 0,
            pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
            status_id: statusId ? parseInt(statusId) : undefined,
          };

          console.log('Testing minimal lead data:', JSON.stringify([minimalLeadData], null, 2));
          
          const testLeadResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([minimalLeadData])
          });

          const testResponseText = await testLeadResponse.text();
          console.log('Minimal lead test - Status:', testLeadResponse.status);
          console.log('Minimal lead test - Response:', testResponseText);

          let leadId = null;
          
          if (testLeadResponse.ok) {
            try {
              const testResult = JSON.parse(testResponseText);
              leadId = testResult._embedded?.leads?.[0]?.id;
              console.log('✅ Minimal lead created successfully:', leadId);
              
              // PHASE 2: Now try with custom fields
              console.log('=== PHASE 2: Adding custom fields ===');
              
              // Prepare custom fields - start with just phone
              const customFields = [];
              
              // Add phone field (most important)
              customFields.push({
                field_id: 142993, // Phone field ID
                values: [{ value: body.phone }]
              });
              
              // Update lead with custom fields
              const updateData = {
                custom_fields_values: customFields
              };
              
              console.log('Updating lead with custom fields:', JSON.stringify(updateData, null, 2));
              
              const updateResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads/${leadId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
              });
              
              const updateResponseText = await updateResponse.text();
              console.log('Update lead - Status:', updateResponse.status);
              console.log('Update lead - Response:', updateResponseText);
              
              if (updateResponse.ok) {
                console.log('✅ Lead updated with phone field');
                
                // PHASE 3: Try adding job field
                console.log('=== PHASE 3: Adding job field ===');
                
                customFields.push({
                  field_id: 142273, // Job field ID
                  values: [{ value: body.job }]
                });
                
                const updateJobData = {
                  custom_fields_values: customFields
                };
                
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
                  console.log('✅ Lead updated with job field');
                } else {
                  console.error('❌ Failed to update lead with job field:', updateJobResponseText);
                }
              } else {
                console.error('❌ Failed to update lead with phone field:', updateResponseText);
              }
              
              amoCRMResult = {
                attempted: true,
                success: true,
                leadId: leadId,
                message: 'Lead created and updated with custom fields'
              };
              
            } catch (parseError) {
              console.error('Failed to parse test response:', parseError);
              amoCRMResult = {
                attempted: true,
                success: false,
                error: `Failed to parse AmoCRM response: ${parseError.message}`
              };
            }
          } else {
            console.error('❌ Minimal lead creation failed:', testResponseText);
            
            // Try alternative approach: create lead with basic custom fields only
            console.log('=== Trying alternative approach ===');
            
            const alternativeLeadData = {
              name: `Заявка с сайта: ${body.name}`,
              price: 0,
              pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
              status_id: statusId ? parseInt(statusId) : undefined,
              custom_fields_values: [
                {
                  field_id: 142993, // Phone field only
                  values: [{ value: body.phone }]
                }
              ]
            };
            
            console.log('Alternative lead data:', JSON.stringify([alternativeLeadData], null, 2));
            
            const altResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify([alternativeLeadData])
            });
            
            const altResponseText = await altResponse.text();
            console.log('Alternative approach - Status:', altResponse.status);
            console.log('Alternative approach - Response:', altResponseText);
            
            if (altResponse.ok) {
              try {
                const altResult = JSON.parse(altResponseText);
                leadId = altResult._embedded?.leads?.[0]?.id;
                console.log('✅ Alternative lead created successfully:', leadId);
                amoCRMResult = {
                  attempted: true,
                  success: true,
                  leadId: leadId,
                  message: 'Lead created with phone field only'
                };
              } catch (parseError) {
                console.error('Failed to parse alternative response:', parseError);
                amoCRMResult = {
                  attempted: true,
                  success: false,
                  error: `Failed to parse AmoCRM response: ${parseError.message}`
                };
              }
            } else {
              amoCRMResult = {
                attempted: true,
                success: false,
                error: `AmoCRM error: ${testLeadResponse.status} ${testResponseText.substring(0, 200)}`
              };
            }
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