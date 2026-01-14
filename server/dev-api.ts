// Simple development API server
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { z } from 'zod';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Validation schema
const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\+998\d{9}$/, "Phone must be in format +998XXXXXXXXX"),
  job: z.string().min(1, "Job is required"),
  source: z.string().optional().default("website"),
});

// POST /api/leads
app.post('/api/leads', async (req, res) => {
  try {
    const body = req.body;
    
    // Validate
    const validationResult = leadSchema.safeParse(body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
        savedLocally: false
      });
    }

    const leadData = validationResult.data;
    
    // Log the submission
    console.log('✅ Lead submitted:', {
      name: leadData.name,
      phone: leadData.phone,
      job: leadData.job,
      source: leadData.source,
      timestamp: new Date().toISOString()
    });

    // Return success (in production, this would save to database and sync to AmoCRM)
    return res.status(200).json({
      success: true,
      message: 'Lead submitted successfully',
      leadId: `dev-${Date.now()}`,
      savedLocally: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      savedLocally: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/leads (for testing)
app.get('/api/leads', (req, res) => {
  res.json({ message: 'API is working!', endpoint: '/api/leads' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`📡 Development API server running on http://localhost:${PORT}`);
  console.log(`   Test: http://localhost:${PORT}/api/health`);
});

export default app;