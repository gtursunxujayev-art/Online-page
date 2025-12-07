import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Validation schema for lead submission
const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\+998\d{9}$/, "Phone must be in format +998XXXXXXXXX"),
  job: z.string().min(1, "Job is required"),
  source: z.string().optional(), // "registration" or "footer"
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // GET /api/leads - list all leads
  app.get("/api/leads", async (req, res) => {
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

      // Prepare lead data for Kommo CRM with pipeline/stage
      const kommoLead: Record<string, unknown> = {
        name: `${leadData.name} | ${leadData.phone} | ${leadData.job}`,
        _embedded: {
          tags: [{ name: leadData.source || "website" }]
        }
      };
      
      // Add pipeline and status if configured
      if (defaultPipelineId) {
        kommoLead.pipeline_id = parseInt(defaultPipelineId);
      }
      if (defaultStatusId) {
        kommoLead.status_id = parseInt(defaultStatusId);
      }

      // Send to Kommo CRM API
      const kommoUrl = `https://${kommoSubdomain}.${kommoDomain}/api/v4/leads`;
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
