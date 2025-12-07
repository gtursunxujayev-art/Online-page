import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

// Validation schema for lead submission
const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\+998\d{9}$/, "Phone must be in format +998XXXXXXXXX"),
  job: z.string().min(1, "Job is required"),
  source: z.string().optional(), // "registration" or "footer"
});

// Extend session data
declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
  }
}

// Create default admin user if it doesn't exist
async function ensureDefaultAdmin() {
  const existingAdmin = await storage.getUserByUsername("admin");
  if (!existingAdmin) {
    await storage.createUser({ username: "admin", password: "admin" });
    console.log("Default admin user created (admin/admin)");
  }
}

// Auth middleware for protected routes
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create default admin user
  await ensureDefaultAdmin();
  
  // Session middleware
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "najot-nur-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({ checkPeriod: 86400000 }),
    cookie: { 
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // POST /api/auth/login - admin login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username va parol kiritilishi shart" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Noto'g'ri login yoki parol" });
      }
      
      req.session.userId = user.id;
      req.session.isAdmin = true;
      
      res.json({ success: true, message: "Muvaffaqiyatli kirildi" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login xatolik" });
    }
  });

  // POST /api/auth/logout - admin logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout xatolik" });
      }
      res.json({ success: true });
    });
  });

  // GET /api/auth/check - check if logged in
  app.get("/api/auth/check", (req, res) => {
    if (req.session?.userId) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });

  // PATCH /api/auth/credentials - change username/password
  app.patch("/api/auth/credentials", requireAuth, async (req, res) => {
    try {
      const { newUsername, newPassword, currentPassword } = req.body;
      
      if (!currentPassword) {
        return res.status(400).json({ error: "Joriy parol kiritilishi shart" });
      }
      
      const user = await storage.getUser(req.session.userId!);
      
      if (!user || user.password !== currentPassword) {
        return res.status(401).json({ error: "Joriy parol noto'g'ri" });
      }
      
      const updates: { username?: string; password?: string } = {};
      
      if (newUsername && newUsername !== user.username) {
        const existing = await storage.getUserByUsername(newUsername);
        if (existing) {
          return res.status(400).json({ error: "Bu username band" });
        }
        updates.username = newUsername;
      }
      
      if (newPassword) {
        updates.password = newPassword;
      }
      
      if (Object.keys(updates).length > 0) {
        await storage.updateUser(user.id, updates);
      }
      
      res.json({ success: true, message: "Ma'lumotlar yangilandi" });
    } catch (error) {
      console.error("Update credentials error:", error);
      res.status(500).json({ error: "Yangilashda xatolik" });
    }
  });

  // GET /api/leads - list all leads (protected)
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const allLeads = await storage.getLeads();
      res.json(allLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // GET /api/kommo/pipelines - fetch pipelines from AmoCRM
  app.get("/api/kommo/pipelines", async (req, res) => {
    try {
      const rawSubdomain = process.env.KOMMO_SUBDOMAIN || "";
      const kommoAccessToken = process.env.KOMMO_ACCESS_TOKEN || "";
      
      let kommoSubdomain = rawSubdomain;
      let kommoDomain = "kommo.com";
      
      if (rawSubdomain.includes("amocrm.ru")) {
        kommoDomain = "amocrm.ru";
        kommoSubdomain = rawSubdomain
          .replace(/^https?:\/\//, "")
          .replace(/\.amocrm\.ru.*$/, "")
          .trim();
      } else if (rawSubdomain.includes("amocrm.com")) {
        kommoDomain = "amocrm.com";
        kommoSubdomain = rawSubdomain
          .replace(/^https?:\/\//, "")
          .replace(/\.amocrm\.com.*$/, "")
          .trim();
      } else if (rawSubdomain.includes("kommo.com")) {
        kommoSubdomain = rawSubdomain
          .replace(/^https?:\/\//, "")
          .replace(/\.kommo\.com.*$/, "")
          .trim();
      } else {
        kommoSubdomain = rawSubdomain.replace(/^https?:\/\//, "").trim();
      }

      if (!kommoSubdomain || !kommoAccessToken) {
        return res.status(400).json({ error: "Kommo credentials not configured" });
      }

      const pipelinesUrl = `https://${kommoSubdomain}.${kommoDomain}/api/v4/leads/pipelines`;
      const response = await fetch(pipelinesUrl, {
        headers: {
          "Authorization": `Bearer ${kommoAccessToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Kommo pipelines error:", response.status, errorText);
        return res.status(response.status).json({ error: "Failed to fetch pipelines" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching pipelines:", error);
      res.status(500).json({ error: "Failed to fetch pipelines" });
    }
  });

  // GET /api/settings/pipeline-stage - get current pipeline/stage settings
  app.get("/api/settings/pipeline-stage", async (req, res) => {
    try {
      const pipelineId = await storage.getSetting("default_pipeline_id");
      const statusId = await storage.getSetting("default_status_id");
      res.json({
        pipelineId: pipelineId ? parseInt(pipelineId) : null,
        statusId: statusId ? parseInt(statusId) : null
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // PATCH /api/settings/pipeline-stage - update pipeline/stage settings
  app.patch("/api/settings/pipeline-stage", async (req, res) => {
    try {
      const { pipelineId, statusId } = req.body;
      
      if (pipelineId !== undefined) {
        await storage.setSetting("default_pipeline_id", String(pipelineId));
      }
      if (statusId !== undefined) {
        await storage.setSetting("default_status_id", String(statusId));
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // API route to submit leads to Kommo CRM
  app.post("/api/leads", async (req, res) => {
    let localLead: { id: string } | null = null;
    
    try {
      // Validate request body
      const leadData = leadSchema.parse(req.body);
      
      // Get default pipeline/stage settings
      const defaultPipelineId = await storage.getSetting("default_pipeline_id");
      const defaultStatusId = await storage.getSetting("default_status_id");
      
      // Save lead to local database first
      localLead = await storage.createLead({
        name: leadData.name,
        phone: leadData.phone,
        job: leadData.job,
        source: leadData.source || "website",
        pipelineId: defaultPipelineId ? parseInt(defaultPipelineId) : null,
        statusId: defaultStatusId ? parseInt(defaultStatusId) : null,
        syncStatus: "pending"
      });
      
      // Get Kommo credentials from environment variables
      const rawSubdomain = process.env.KOMMO_SUBDOMAIN || "";
      const kommoAccessToken = process.env.KOMMO_ACCESS_TOKEN || "";
      
      // Detect domain type and extract subdomain
      let kommoSubdomain = rawSubdomain;
      let kommoDomain = "kommo.com";
      
      if (rawSubdomain.includes("amocrm.ru")) {
        kommoDomain = "amocrm.ru";
        kommoSubdomain = rawSubdomain
          .replace(/^https?:\/\//, "")
          .replace(/\.amocrm\.ru.*$/, "")
          .trim();
      } else if (rawSubdomain.includes("amocrm.com")) {
        kommoDomain = "amocrm.com";
        kommoSubdomain = rawSubdomain
          .replace(/^https?:\/\//, "")
          .replace(/\.amocrm\.com.*$/, "")
          .trim();
      } else if (rawSubdomain.includes("kommo.com")) {
        kommoSubdomain = rawSubdomain
          .replace(/^https?:\/\//, "")
          .replace(/\.kommo\.com.*$/, "")
          .trim();
      } else {
        kommoSubdomain = rawSubdomain.replace(/^https?:\/\//, "").trim();
      }
      
      if (!kommoSubdomain || !kommoAccessToken) {
        console.error("Kommo credentials not configured");
        await storage.updateLead(localLead.id, { syncStatus: "failed" });
        return res.status(502).json({ 
          success: false,
          savedLocally: true,
          message: "Ma'lumotingiz saqlandi, lekin CRM ga yuborilmadi",
          syncError: "CRM sozlanmagan"
        });
      }

      // Prepare lead data for Kommo CRM with pipeline/stage and embedded contact
      const kommoLead: Record<string, unknown> = {
        name: `Заявка с сайта: ${leadData.name}`,
        _embedded: {
          tags: [{ name: leadData.source || "website" }],
          contacts: [{
            name: leadData.name,
            custom_fields_values: [
              {
                field_code: "PHONE",
                values: [{ value: leadData.phone }]
              },
              {
                field_code: "POSITION",
                values: [{ value: leadData.job }]
              }
            ]
          }]
        },
        custom_fields_values: [
          {
            field_code: "UTM_SOURCE",
            values: [{ value: "site : online.najotnur.uz" }]
          }
        ]
      };
      
      // Add pipeline and status if configured
      if (defaultPipelineId) {
        kommoLead.pipeline_id = parseInt(defaultPipelineId);
      }
      if (defaultStatusId) {
        kommoLead.status_id = parseInt(defaultStatusId);
      }

      // Send to Kommo CRM API (complex leads endpoint for embedded contacts)
      const kommoUrl = `https://${kommoSubdomain}.${kommoDomain}/api/v4/leads/complex`;
      console.log("Sending lead to Kommo:", kommoUrl);
      
      const kommoResponse = await fetch(kommoUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${kommoAccessToken}`
        },
        body: JSON.stringify([kommoLead])
      });

      if (!kommoResponse.ok) {
        const errorText = await kommoResponse.text();
        console.error("Kommo API error:", kommoResponse.status, errorText);
        await storage.updateLead(localLead.id, { syncStatus: "failed" });
        return res.status(502).json({ 
          success: false,
          savedLocally: true,
          message: "Ma'lumotingiz saqlandi, lekin CRM ga yuborilmadi",
          syncError: "CRM xatolik"
        });
      }

      const kommoData = await kommoResponse.json();
      const amoLeadId = kommoData._embedded?.leads?.[0]?.id;
      console.log("Lead created in Kommo:", amoLeadId);
      
      // Update local lead with AmoCRM ID and sync status
      await storage.updateLead(localLead.id, { 
        amoLeadId: amoLeadId,
        syncStatus: "synced" 
      });

      res.json({ 
        success: true,
        synced: true,
        message: "Ma'lumotingiz muvaffaqiyatli yuborildi!",
        leadId: amoLeadId 
      });
      
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Xatolik: " + error.errors[0].message 
        });
      }
      
      console.error("Error creating lead:", error);
      
      // Check if lead was created locally before the error
      // This happens when the error occurs during CRM sync
      if (localLead?.id) {
        await storage.updateLead(localLead.id, { syncStatus: "failed" });
        return res.status(502).json({ 
          success: false,
          savedLocally: true,
          message: "Ma'lumotingiz saqlandi, lekin CRM ga yuborilmadi",
          syncError: error instanceof Error ? error.message : "CRM xatolik"
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring." 
      });
    }
  });

  return httpServer;
}
