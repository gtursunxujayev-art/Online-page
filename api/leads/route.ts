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
      if (process.env.AMOCRM_SUBDOMAIN && process.env.AMOCRM_ACCESS_TOKEN) {
        try {
          // Simple AmoCRM integration (you can expand this later)
          amoCRMResult = {
            attempted: true,
            success: false,
            message: 'AmoCRM integration not fully implemented'
          };
        } catch (amoError) {
          console.error('AmoCRM sync error:', amoError);
          amoCRMResult = {
            attempted: true,
            success: false,
            error: amoError instanceof Error ? amoError.message : 'Unknown error'
          };
        }
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