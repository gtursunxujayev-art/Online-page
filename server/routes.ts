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
  
  // API route to submit leads to Kommo CRM
  app.post("/api/leads", async (req, res) => {
    try {
      // Validate request body
      const leadData = leadSchema.parse(req.body);
      
      // Get Kommo credentials from environment variables
      const rawSubdomain = process.env.KOMMO_SUBDOMAIN || "";
      const kommoAccessToken = process.env.KOMMO_ACCESS_TOKEN || "";
      
      // Detect domain type and extract subdomain
      let kommoSubdomain = rawSubdomain;
      let kommoDomain = "kommo.com"; // Default to international domain
      
      // Check if using Russian AmoCRM domain
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
        // Just clean any protocol if present
        kommoSubdomain = rawSubdomain.replace(/^https?:\/\//, "").trim();
      }
      
      if (!kommoSubdomain || !kommoAccessToken) {
        console.error("Kommo credentials not configured");
        // Still return success to user, but log the error
        return res.json({ 
          success: true, 
          message: "Ma'lumotingiz qabul qilindi" 
        });
      }

      // Prepare lead data for Kommo CRM
      // Include all info in lead name for simplicity (works with any account)
      const kommoLead = {
        name: `${leadData.name} | ${leadData.phone} | ${leadData.job}`,
        _embedded: {
          tags: [
            {
              name: leadData.source || "website"
            }
          ]
        }
      };

      // Send to Kommo CRM API
      const kommoUrl = `https://${kommoSubdomain}.${kommoDomain}/api/v4/leads`;
      console.log("Sending lead to Kommo:", kommoUrl);
      
      const kommoResponse = await fetch(
        kommoUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${kommoAccessToken}`
          },
          body: JSON.stringify([kommoLead])
        }
      );

      if (!kommoResponse.ok) {
        const errorText = await kommoResponse.text();
        console.error("Kommo API error:", kommoResponse.status, errorText);
        // Still return success to user
        return res.json({ 
          success: true, 
          message: "Ma'lumotingiz qabul qilindi" 
        });
      }

      const kommoData = await kommoResponse.json();
      console.log("Lead created in Kommo:", kommoData);

      res.json({ 
        success: true, 
        message: "Ma'lumotingiz muvaffaqiyatli yuborildi!",
        leadId: kommoData._embedded?.leads?.[0]?.id 
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Xatolik: " + error.errors[0].message 
        });
      }
      
      console.error("Error creating lead:", error);
      res.status(500).json({ 
        success: false, 
        message: "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring." 
      });
    }
  });

  return httpServer;
}
