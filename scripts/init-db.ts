import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { leads, users, settings } from '@/shared/schema';

async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    const db = drizzle(sql);
    
    // Create tables if they don't exist
    console.log('Creating tables...');
    
    // Note: In production, you should use migrations (drizzle-kit)
    // This is a simplified setup for initial deployment
    
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
    const existingAdmin = await db.select().from(users).where(sql`username = 'admin'`);
    if (existingAdmin.length === 0) {
      console.log('Creating default admin user...');
      // In production, use proper password hashing!
      await db.insert(users).values({
        username: 'admin',
        password: 'admin' // CHANGE THIS IN PRODUCTION!
      });
      console.log('Default admin created: username=admin, password=admin');
    }
    
    console.log('✅ Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();