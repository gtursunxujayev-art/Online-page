import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Simple protection - check for a secret query parameter
    const secret = request.nextUrl.searchParams.get('secret');
    if (secret !== process.env.ADMIN_TOKEN && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      tables: ['users', 'leads', 'settings']
    });

  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}