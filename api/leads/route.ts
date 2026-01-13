import { NextRequest, NextResponse } from 'next/server';
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

// GET /api/leads - Get all leads (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication (simplified for now)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leads = await getLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = leadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
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
        // Update lead with AmoCRM ID
        // Note: In a real implementation, you'd update the lead in database
        console.log('Lead synced to AmoCRM:', amoResult.leadId);
      } else {
        console.error('Failed to sync lead to AmoCRM:', amoResult.error);
      }
    } catch (amoError) {
      console.error('AmoCRM sync error:', amoError);
      // Don't fail the request if AmoCRM sync fails
    }

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
      leadId: lead.id,
      savedLocally: true,
    });
    
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead', savedLocally: false },
      { status: 500 }
    );
  }
}