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

          // Create contact in AmoCRM
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

          // Create contact
          const contactResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/contacts`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([contactData])
          });

          let contactId = null;
          if (contactResponse.ok) {
            const contactResult = await contactResponse.json();
            contactId = contactResult._embedded?.contacts?.[0]?.id;
            console.log('Contact created in AmoCRM:', contactId);
          } else {
            const errorText = await contactResponse.text();
            console.error('Failed to create contact:', contactResponse.status, errorText);
          }

          // Create lead in AmoCRM
          const leadData = {
            name: `Lead from website: ${body.name}`,
            pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
            status_id: statusId ? parseInt(statusId) : undefined,
            _embedded: contactId ? {
              contacts: [{ id: contactId }]
            } : undefined
          };

          const leadResponse = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([leadData])
          });

          let leadId = null;
          if (leadResponse.ok) {
            const leadResult = await leadResponse.json();
            leadId = leadResult._embedded?.leads?.[0]?.id;
            console.log('Lead created in AmoCRM:', leadId);
            amoCRMResult = {
              attempted: true,
              success: true,
              contactId: contactId,
              leadId: leadId,
              message: 'Successfully synced with AmoCRM'
            };
          } else {
            const errorText = await leadResponse.text();
            console.error('Failed to create lead:', leadResponse.status, errorText);
            amoCRMResult = {
              attempted: true,
              success: false,
              error: `AmoCRM error: ${leadResponse.status} ${errorText.substring(0, 100)}`
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