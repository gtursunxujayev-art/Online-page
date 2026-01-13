import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

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
    // Simple protection - check for a secret query parameter
    const secret = req.query.secret as string;
    if (secret !== process.env.ADMIN_TOKEN && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Initializing database tables...');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `;

    // Create leads table
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        amo_lead_id INTEGER,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        job TEXT NOT NULL,
        source TEXT DEFAULT 'website',
        pipeline_id INTEGER,
        status_id INTEGER,
        sync_status TEXT DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    // Create default admin user if not exists
    const existingAdmin = await sql`
      SELECT * FROM users WHERE username = 'admin'
    `;
    
    if (existingAdmin.rowCount === 0) {
      await sql`
        INSERT INTO users (username, password) 
        VALUES ('admin', 'admin')
      `;
      console.log('Default admin user created');
    }

    return res.status(200).json({
      success: true,
      message: 'Database tables created successfully',
      tables: ['users', 'leads', 'settings']
    });

  } catch (error) {
    console.error('Database initialization failed:', error);
    return res.status(500).json(
      { 
        success: false, 
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}