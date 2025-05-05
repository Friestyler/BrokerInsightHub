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

  // Document endpoints
  app.get('/api/documents', async (req, res) => {
    try {
      // Default to user 1 for now - in a real app, this would be the logged-in user's ID
      const userId = 1;
      const documents = await storage.getAllDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  // File Upload Endpoint
  app.post('/api/files/upload', async (req, res) => {
    try {
      // In a real implementation, this would process the actual file upload
      // For now, we'll simulate this by storing metadata in our database
      
      // Default to user 1 for now
      const userId = 1; 
      const { filename, fileType, fileSize, content, tags = [] } = req.body;
      
      if (!filename || !fileType || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const document = await storage.createDocument({
        userId,
        filename,
        fileType,
        fileSize: fileSize || 1024, // Default size if not provided
        content,
        tags
      });
      
      res.json({ 
        success: true, 
        message: 'File uploaded successfully',
        file: {
          id: document.id,
          name: document.filename,
          type: document.fileType,
          date: document.uploadDate.toISOString()
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // File comparison endpoint
  app.post('/api/files/compare', async (req, res) => {
    try {
      const { document1Id, document2Id, userId = 1 } = req.body;
      
      if (!document1Id || !document2Id) {
        return res.status(400).json({ message: 'Missing document IDs' });
      }
      
      const document1 = await storage.getDocument(document1Id);
      const document2 = await storage.getDocument(document2Id);
      
      if (!document1 || !document2) {
        return res.status(404).json({ message: 'One or both documents not found' });
      }
      
      // In a real implementation, we would do actual file comparison here
      // For now, we'll create a simulated comparison result
      
      const comparisonResult = {
        differencesSummary: `Found key differences between ${document1.filename} and ${document2.filename}`,
        differences: {
          addedClauses: 3,
          removedClauses: 1,
          modifiedClauses: 5,
          details: [
            { type: 'addition', section: 'Coverage Limits', description: 'Increased coverage limit from €1M to €2M' },
            { type: 'removal', section: 'Exclusions', description: 'Removed exclusion for cyber incidents' },
            { type: 'modification', section: 'Deductibles', description: 'Changed deductible from 10% to 5%' }
          ]
        }
      };
      
      const comparison = await storage.createFileComparison({
        userId,
        document1Id,
        document2Id,
        differencesSummary: comparisonResult.differencesSummary,
        differences: comparisonResult.differences
      });
      
      res.json({ 
        success: true, 
        comparison: {
          id: comparison.id,
          date: comparison.comparisonDate.toISOString(),
          document1: {
            id: document1.id,
            name: document1.filename
          },
          document2: {
            id: document2.id,
            name: document2.filename
          },
          ...comparisonResult
        }
      });
    } catch (error) {
      console.error('Error comparing files:', error);
      res.status(500).json({ message: 'Failed to compare files' });
    }
  });

  // Email Sending Endpoint
  app.post('/api/email/send', async (req, res) => {
    try {
      const { recipient, subject, content, comparisonId } = req.body;
      
      if (!recipient || !subject || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // In a real implementation, this would send an email using a service like SendGrid
      // If comparisonId is provided, we could attach the comparison results
      
      // Let's log the email details for now
      console.log('Email details:', { recipient, subject, contentLength: content.length });
      
      if (comparisonId) {
        console.log('Attaching comparison results for comparison ID:', comparisonId);
      }
      
      res.json({ 
        success: true, 
        message: 'Email sent successfully',
        details: {
          recipient,
          subject,
          sentAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
