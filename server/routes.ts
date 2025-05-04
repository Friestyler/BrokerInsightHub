import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // News Articles Endpoints
  app.get('/api/news', async (req, res) => {
    try {
      const articles = await storage.getAllNewsArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch news articles' });
    }
  });
  
  // Opportunities Endpoints
  app.get('/api/opportunities', async (req, res) => {
    try {
      const opportunities = await storage.getAllOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch opportunities' });
    }
  });

  // Clients Endpoints
  app.get('/api/clients', async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch clients' });
    }
  });

  // Insurance Products Endpoints
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getAllInsuranceProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch insurance products' });
    }
  });

  // File Upload Endpoint (mock for now)
  app.post('/api/files/upload', (req, res) => {
    // In a real implementation, this would handle file uploads
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      file: {
        id: Math.floor(Math.random() * 1000),
        name: 'uploaded_file.pdf',
        date: new Date().toISOString()
      }
    });
  });

  // Email Sending Endpoint
  app.post('/api/email/send', (req, res) => {
    const { recipient, subject, content } = req.body;
    
    if (!recipient || !subject || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // In a real implementation, this would send an email
    res.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
