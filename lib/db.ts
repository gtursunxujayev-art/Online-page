import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { leads, users, settings, type InsertLead, type InsertUser } from '@/shared/schema';
import { eq } from 'drizzle-orm';

// Initialize database connection for Vercel Postgres
export const db = drizzle(sql);

// Lead operations
export async function createLead(leadData: InsertLead) {
  const [lead] = await db.insert(leads).values(leadData).returning();
  return lead;
}

export async function getLeads() {
  return await db.select().from(leads).orderBy(leads.submittedAt);
}

export async function getLead(id: string) {
  const [lead] = await db.select().from(leads).where(eq(leads.id, id));
  return lead;
}

export async function updateLeadSyncStatus(id: string, amoLeadId: number | null, syncStatus: string) {
  const [lead] = await db.update(leads)
    .set({ 
      amoLeadId,
      syncStatus,
      ...(amoLeadId ? { pipelineId: 0, statusId: 0 } : {}) // Set default pipeline/status
    })
    .where(eq(leads.id, id))
    .returning();
  return lead;
}

// User operations (for admin)
export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

export async function createUser(userData: InsertUser) {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

// Settings operations
export async function getSetting(key: string) {
  const [setting] = await db.select().from(settings).where(eq(settings.key, key));
  return setting?.value;
}

export async function setSetting(key: string, value: string) {
  await db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}