// Simple JavaScript API route for leads
export default function handler(req, res) {
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

      return res.status(200).json({
        success: true,
        message: 'Lead submitted successfully',
        leadId: `temp-${Date.now()}`,
        savedLocally: true,
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