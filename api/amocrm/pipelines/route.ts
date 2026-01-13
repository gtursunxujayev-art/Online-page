import { NextRequest, NextResponse } from 'next/server';
import { getAmoCRMPipelines, getAmoCRMStatuses } from '@/lib/amocrm';
import { getSetting } from '@/lib/db';

// GET /api/amocrm/pipelines - Get AmoCRM pipelines
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pipelines = await getAmoCRMPipelines();
    
    // Get saved pipeline and status from settings
    const savedPipelineId = await getSetting('amocrm_pipeline_id');
    const savedStatusId = await getSetting('amocrm_status_id');
    
    return NextResponse.json({
      pipelines,
      selectedPipelineId: savedPipelineId ? parseInt(savedPipelineId) : null,
      selectedStatusId: savedStatusId ? parseInt(savedStatusId) : null,
    });
  } catch (error) {
    console.error('Failed to fetch AmoCRM pipelines:', error);
    return NextResponse.json({ error: 'Failed to fetch pipelines' }, { status: 500 });
  }
}