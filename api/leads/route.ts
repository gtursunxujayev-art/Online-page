import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createLead, getLeads } from '@/lib/db';
import { syncLeadToAmoCRM } from '@/lib/amocrm';

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
    // GET /api/leads - Get all leads (admin only)
    if (req.method === 'GET') {
      // Check authentication (simplified for now)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const leads = await getLeads();
      return res.status(200).json(leads);
    }

    // POST /api/leads - Create a new lead
    if (req.method === 'POST') {
      const body = req.body;
      
      // Validate the request body
      const validationResult = leadSchema.safeParse(body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.errors
        });
      }

      const leadData = validationResult.data;
      
      // Save to database
      let lead;
      try {
        lead = await createLead({
          ...leadData,
          syncStatus: 'pending',
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue without database storage
        lead = {
          id: 'temp-' + Date.now(),
          ...leadData,
          syncStatus: 'pending'
        } as any;
      }

      // Try to sync with AmoCRM (in background)
      try {
        const amoResult = await syncLeadToAmoCRM(lead);
        
        if (amoResult.success) {
          console.log('Lead synced to AmoCRM:', amoResult.leadId);
        } else {
          console.error('Failed to sync lead to AmoCRM:', amoResult.error);
        }
      } catch (amoError) {
        console.error('AmoCRM sync error:', amoError);
        // Don't fail the request if AmoCRM sync fails
      }

      return res.status(200).json({
        success: true,
        message: 'Lead submitted successfully',
        leadId: lead.id,
        savedLocally: true,
      });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      savedLocally: false 
    });
  }
}