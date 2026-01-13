import { VercelRequest, VercelResponse } from '@vercel/node';
import { getAmoCRMPipelines } from '@/lib/amocrm';
import { getSetting } from '@/lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only GET method is allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pipelines = await getAmoCRMPipelines();
    
    // Get saved pipeline and status from settings
    const savedPipelineId = await getSetting('amocrm_pipeline_id');
    const savedStatusId = await getSetting('amocrm_status_id');
    
    return res.status(200).json({
      pipelines,
      selectedPipelineId: savedPipelineId ? parseInt(savedPipelineId) : null,
      selectedStatusId: savedStatusId ? parseInt(savedStatusId) : null,
    });
  } catch (error) {
    console.error('Failed to fetch AmoCRM pipelines:', error);
    return res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
}