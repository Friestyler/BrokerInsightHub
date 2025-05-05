import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { comparePdfDocuments, extractTextFromPdf } from './services/pdfComparison';

// Setup multer storage for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads/pdfs');
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent collisions
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Create the multer upload middleware
const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

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
  app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Default to user 1 for now
      const userId = 1;
      const uploadedFile = req.file;
      
      // Extract file information from the uploaded file
      const filePath = uploadedFile.path;
      const fileSize = uploadedFile.size;
      const filename = req.body.filename || uploadedFile.originalname;
      const fileType = uploadedFile.mimetype;
      
      // Extract some content from the PDF for storage
      let content = '';
      try {
        // Only extract first 1000 chars to avoid overloading the database
        const pdfText = await extractTextFromPdf(filePath);
        content = pdfText.substring(0, 1000);
      } catch (err) {
        console.warn('Could not extract PDF text:', err);
        content = 'PDF content could not be extracted';
      }
      
      // Get tags if provided
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      
      // Store document information in the database
      const document = await storage.createDocument({
        userId,
        filename,
        fileType,
        fileSize,
        filePath,  // Store the path to the file on disk
        content,   // First 1000 chars of PDF content
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
      
      // Check if files paths are available
      if (!document1.filePath || !document2.filePath) {
        // Fall back to dummy data if the file paths aren't available
        console.warn('File paths not available, using content-based comparison');
        
        // Compare the content stored in the database instead
        const oldContent = document1.content || '';
        const newContent = document2.content || '';
        
        // Do a simple text-based comparison
        const addedWords = newContent.split(/\s+/).filter(word => !oldContent.includes(word)).length;
        const removedWords = oldContent.split(/\s+/).filter(word => !newContent.includes(word)).length;
        
        const comparisonResult = {
          differencesSummary: `Found ${addedWords + removedWords} differences between ${document1.filename} and ${document2.filename}`,
          differences: {
            addedClauses: addedWords,
            removedClauses: removedWords,
            modifiedClauses: Math.round(Math.abs(oldContent.length - newContent.length) / 20),
            details: [
              { type: 'addition', section: 'Document', description: `${addedWords} new terms found` },
              { type: 'removal', section: 'Document', description: `${removedWords} terms removed` },
              { type: 'modification', section: 'Document', description: 'Content has been modified' }
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
        
        return res.json({ 
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
      }
      
      // Get the file paths
      const filePath1 = document1.filePath;
      const filePath2 = document2.filePath;
      
      // Perform the actual PDF comparison
      console.log(`Comparing PDFs: ${filePath1} and ${filePath2}`);
      const comparisonDetails = await comparePdfDocuments(filePath1, filePath2);
      
      // Create a detailed summary of the differences
      let differencesSummary = '';
      
      if (comparisonDetails.addedClauses > 0 || comparisonDetails.removedClauses > 0 || comparisonDetails.modifiedClauses > 0) {
        differencesSummary = `Analysis found ${comparisonDetails.addedClauses + comparisonDetails.removedClauses + comparisonDetails.modifiedClauses} differences between ${document1.filename} and ${document2.filename}:\n\n`;
        
        if (comparisonDetails.addedClauses > 0) {
          differencesSummary += `• Added Content: ${comparisonDetails.addedClauses} section(s) appear in the second document that are not in the first. These additions may grant new rights, impose new obligations, or provide additional coverage.\n\n`;
        }
        
        if (comparisonDetails.removedClauses > 0) {
          differencesSummary += `• Removed Content: ${comparisonDetails.removedClauses} section(s) from the first document were removed. These removals may eliminate previously established rights, obligations, or coverage areas.\n\n`;
        }
        
        if (comparisonDetails.modifiedClauses > 0) {
          differencesSummary += `• Modified Content: ${comparisonDetails.modifiedClauses} section(s) have been altered. These modifications may change the meaning, scope, or effect of the document.\n\n`;
        }
        
        differencesSummary += `IMPORTANT: The changes identified may affect legal rights, financial obligations, or insurance coverage. Please review all differences carefully before making decisions.`;
      } else {
        differencesSummary = `The documents appear to be substantially similar. No significant textual differences were detected between ${document1.filename} and ${document2.filename}.`;
      }
      
      // Store the comparison result
      const comparison = await storage.createFileComparison({
        userId,
        document1Id,
        document2Id,
        differencesSummary,
        differences: comparisonDetails
      });
      
      // Return the comparison result to the client
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
          differencesSummary,
          differences: comparisonDetails
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
      
      // If comparisonId is provided, we might attach the comparison results
      if (comparisonId) {
        console.log('Reference to comparison ID:', comparisonId);
      }
      
      // Import at function scope to avoid module dependency cycles
      const { sendEmail, convertTextToHtml } = await import('./services/email');
      
      // Send email using SendGrid
      const htmlContent = convertTextToHtml(content);
      const emailSent = await sendEmail({
        to: recipient,
        from: 'support@replit.app', // Using a generic Replit address to avoid DNS issues
        subject: subject,
        text: content,
        html: htmlContent
      });
      
      if (emailSent) {
        res.json({ 
          success: true, 
          message: 'Email sent successfully',
          details: {
            recipient,
            subject,
            sentAt: new Date().toISOString()
          }
        });
      } else {
        throw new Error('Failed to send email - internal service error');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
