import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsItemSchema, insertClientSchema, insertOpportunitySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const category = req.query.category as string;
      let newsItems;
      
      if (category && category !== "All News") {
        newsItems = await storage.getNewsByCategory(category);
      } else {
        newsItems = await storage.getAllNews();
      }
      
      res.json(newsItems);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news items" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const newsData = insertNewsItemSchema.parse(req.body);
      const newNewsItem = await storage.addNewsItem(newsData);
      res.status(201).json(newNewsItem);
    } catch (error) {
      console.error("Error adding news item:", error);
      res.status(400).json({ message: "Invalid news item data" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClientById(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const newClient = await storage.addClient(clientData);
      res.status(201).json(newClient);
    } catch (error) {
      console.error("Error adding client:", error);
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  // Opportunity routes
  app.get("/api/opportunities", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      if (clientId) {
        const opportunities = await storage.getOpportunitiesByClientId(clientId);
        res.json(opportunities);
      } else {
        const opportunities = await storage.getAllOpportunities();
        res.json(opportunities);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const opportunityData = insertOpportunitySchema.parse(req.body);
      const newOpportunity = await storage.addOpportunity(opportunityData);
      res.status(201).json(newOpportunity);
    } catch (error) {
      console.error("Error adding opportunity:", error);
      res.status(400).json({ message: "Invalid opportunity data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
