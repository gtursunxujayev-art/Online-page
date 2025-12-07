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
      const kommoSubdomain = process.env.KOMMO_SUBDOMAIN;
      const kommoAccessToken = process.env.KOMMO_ACCESS_TOKEN;
      
      if (!kommoSubdomain || !kommoAccessToken) {
        console.error("Kommo credentials not configured");
        // Still return success to user, but log the error
        return res.json({ 
          success: true, 
          message: "Ma'lumotingiz qabul qilindi" 
        });
      }

      // Prepare lead data for Kommo CRM
      const kommoLead = {
        name: `${leadData.name} - ${leadData.job}`,
        custom_fields_values: [
          {
            field_code: "PHONE",
            values: [
              {
                value: leadData.phone,
                enum_code: "WORK"
              }
            ]
          },
          {
            field_code: "EMAIL", 
            values: [
              {
                value: `${leadData.job}`,
                enum_code: "WORK"
              }
            ]
          }
        ],
        _embedded: {
          tags: [
            {
              name: leadData.source || "website"
            }
          ]
        }
      };

      // Send to Kommo CRM API
      const kommoResponse = await fetch(
        `https://${kommoSubdomain}.kommo.com/api/v4/leads`,
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
