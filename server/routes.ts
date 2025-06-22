import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { opportunities, clients, insuranceProducts, tags, insertTagSchema, okrTemplates, okrMetrics, insertOkrTemplateSchema, insertOkrMetricSchema } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { db } from './db';
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
  // Tags API endpoints
  app.get('/api/tags', async (req, res) => {
    try {
      const allTags = await db.select().from(tags);
      res.json(allTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  });

  app.post('/api/tags', async (req, res) => {
    try {
      const tagData = insertTagSchema.parse(req.body);
      const [newTag] = await db.insert(tags).values(tagData).returning();
      res.json(newTag);
    } catch (error) {
      console.error('Error creating tag:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(409).json({ error: 'Tag name already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create tag' });
      }
    }
  });

  app.put('/api/tags/:id', async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      const tagData = insertTagSchema.parse(req.body);
      const [updatedTag] = await db
        .update(tags)
        .set({ ...tagData, updatedAt: new Date() })
        .where(eq(tags.id, tagId))
        .returning();
      
      if (!updatedTag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      
      res.json(updatedTag);
    } catch (error) {
      console.error('Error updating tag:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(409).json({ error: 'Tag name already exists' });
      } else {
        res.status(500).json({ error: 'Failed to update tag' });
      }
    }
  });

  app.delete('/api/tags/:id', async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      const [deletedTag] = await db
        .delete(tags)
        .where(eq(tags.id, tagId))
        .returning();
      
      if (!deletedTag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      
      res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
      console.error('Error deleting tag:', error);
      res.status(500).json({ error: 'Failed to delete tag' });
    }
  });

  // Partners Endpoints - MUST BE FIRST to avoid routing conflicts
  app.get('/api/partners', async (req, res) => {
    try {
      console.log('Partners API called');
      // Use direct database query to avoid storage method issues
      const { db } = await import('./db');
      const { customers } = await import('../shared/schema');
      
      const customerRecords = await db.select().from(customers);
      console.log('Customers fetched from DB:', customerRecords.length);
      
      // Get opportunities for each partner to calculate actual statistics
      const partnersWithStats = await Promise.all(customerRecords.map(async (customer: any) => {
        const partnerOpportunities = await db.select().from(opportunities).where(eq(opportunities.partnerId, customer.id));
        
        // Calculate statistics from actual opportunity records
        const totalOpportunities = partnerOpportunities.length;
        const totalValueOpportunities = partnerOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
        const weightedValueOpportunities = partnerOpportunities.reduce((sum, opp) => {
          const value = opp.value || 0;
          const probability = opp.probability || 0;
          return sum + (value * (probability / 100));
        }, 0);
        
        return {
          id: customer.id,
          name: customer.name,
          description: customer.description,
          initials: customer.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
          industry: getIndustryFromDescription(customer.description || ''),
          type: getTypeFromDescription(customer.description || ''),
          size: getSizeFromDescription(customer.description || ''),
          status: customer.ownerId ? 'active' : 'inactive',
          customers: Math.floor(Math.random() * 50) + 10, // Keep as mock for now
          opportunities: totalOpportunities,
          totalValueOpportunities,
          weightedValueOpportunities,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        };
      }));
      
      console.log('Partners with stats:', partnersWithStats.length);
      res.setHeader('Content-Type', 'application/json');
      return res.json(partnersWithStats);
    } catch (error) {
      console.error('Error fetching partners:', error);
      res.status(500).json({ message: 'Failed to fetch partners' });
    }
  });

  // Customers API endpoint - fetch customers (clients) with calculated statistics
  app.get('/api/customers', async (req, res) => {
    try {
      console.log('Customers API called');
      const { db } = await import('./db');
      const { clients } = await import('../shared/schema');
      
      const clientRecords = await db.select().from(clients);
      console.log('Clients fetched from DB:', clientRecords.length);
      
      // Get opportunities for each customer to calculate actual statistics
      const customersWithStats = await Promise.all(clientRecords.map(async (client: any) => {
        const customerOpportunities = await db.select().from(opportunities).where(eq(opportunities.clientId, client.id));
        
        // Calculate statistics from actual opportunity records
        const totalOpportunities = customerOpportunities.length;
        const totalValueOpportunities = customerOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
        const weightedValueOpportunities = customerOpportunities.reduce((sum, opp) => {
          const value = opp.value || 0;
          const probability = opp.probability || 0;
          return sum + (value * (probability / 100));
        }, 0);
        
        return {
          id: client.id,
          name: client.name,
          type: client.type,
          initials: client.initials,
          industry: client.type === 'Commercial Client' ? 'Manufacturing' : 'Individual',
          size: client.type === 'Commercial Client' ? 'enterprise' : 'individual',
          status: 'active',
          products: Math.floor(Math.random() * 10) + 1, // Keep as mock for now
          opportunities: totalOpportunities,
          totalValueOpportunities,
          weightedValueOpportunities,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }));
      
      console.log('Customers with stats:', customersWithStats.length);
      res.setHeader('Content-Type', 'application/json');
      return res.json(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ message: 'Failed to fetch customers' });
    }
  });

  // Opportunities API endpoint - fetch opportunities with calculated statistics
  app.get('/api/opportunities', async (req, res) => {
    try {
      console.log('Opportunities API called');
      const { db } = await import('./db');
      const { opportunities } = await import('../shared/schema');
      
      const opportunityRecords = await db.select().from(opportunities);
      console.log('Opportunities fetched from DB:', opportunityRecords.length);
      
      res.setHeader('Content-Type', 'application/json');
      return res.json(opportunityRecords);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      // Return empty array on error instead of 500 to keep UI working
      res.setHeader('Content-Type', 'application/json');
      return res.json([]);
    }
  });

  // Helper functions to extract partner info from existing data
  function getIndustryFromDescription(description: string): string {
    if (!description) return 'Other';
    const desc = description.toLowerCase();
    if (desc.includes('insurance')) return 'Insurance';
    if (desc.includes('mortgage') || desc.includes('hypotheek')) return 'Financial Services';
    if (desc.includes('financial')) return 'Financial Services';
    if (desc.includes('consulting')) return 'Consulting';
    return 'Other';
  }

  function getTypeFromDescription(description: string): string {
    if (!description) return 'Partner';
    const desc = description.toLowerCase();
    if (desc.includes('broker')) return 'Broker';
    if (desc.includes('agency')) return 'Agency';
    if (desc.includes('advisor')) return 'Advisor';
    if (desc.includes('strategic')) return 'Strategic';
    return 'Partner';
  }

  function getSizeFromDescription(description: string): string {
    if (!description) return 'medium';
    const desc = description.toLowerCase();
    if (desc.includes('global') || desc.includes('enterprise')) return 'large';
    if (desc.includes('specialized') || desc.includes('premier')) return 'small';
    return 'medium';
  }

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
  
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customers' });
    }
  });
  
  app.post('/api/customers', async (req, res) => {
    try {
      // Validate the request body
      const { name, description, ownerId } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
      }
      
      const customer = await storage.createCustomer({
        name,
        description,
        ownerId: ownerId || null
      });
      
      res.status(200).json(customer);
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ message: 'Failed to create customer' });
    }
  });
  
  app.get('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Get team members and partners
      const [teamMembers, partners] = await Promise.all([
        storage.getCustomerTeamMembers(id),
        storage.getCustomerPartners(id)
      ]);
      
      // For each team member, get the user details
      const teamMemberDetails = await Promise.all(
        teamMembers.map(async (member) => {
          const user = await storage.getUser(member.userId);
          return {
            id: member.id,
            user: user ? {
              id: user.id,
              fullName: user.fullName,
              avatarInitials: user.avatarInitials
            } : null
          };
        })
      );
      
      // For each partner, get the client details
      const partnerDetails = await Promise.all(
        partners.map(async (partner) => {
          const client = await storage.getClient(partner.partnerId);
          return {
            id: partner.id,
            partner: client ? {
              id: client.id,
              name: client.name,
              type: client.type,
              initials: client.initials
            } : null
          };
        })
      );
      
      // Get owner details
      const owner = customer.ownerId ? await storage.getUser(customer.ownerId) : null;
      
      // Combine all data
      const customerDetails = {
        ...customer,
        owner: owner ? {
          id: owner.id,
          fullName: owner.fullName,
          avatarInitials: owner.avatarInitials
        } : null,
        teamMembers: teamMemberDetails,
        partners: partnerDetails
      };
      
      res.json(customerDetails);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      res.status(500).json({ message: 'Failed to fetch customer details' });
    }
  });

  // Insurance Products Endpoints
  app.get('/api/insurance-products', async (req, res) => {
    try {
      const products = await storage.getAllInsuranceProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch insurance products' });
    }
  });
  


  // Vendor Endpoints
  app.get('/api/vendors', async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch vendors' });
    }
  });
  
  app.get('/api/vendors/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
      
      res.json(vendor);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      res.status(500).json({ message: 'Failed to fetch vendor details' });
    }
  });
  
  app.post('/api/vendors', async (req, res) => {
    try {
      // Validate the request body
      const { name, description, contactName, contactEmail, contactPhone, ownerId } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
      }
      
      const vendor = await storage.createVendor({
        name,
        description,
        contactName,
        contactEmail,
        contactPhone,
        ownerId: ownerId || null
      });
      
      res.status(201).json(vendor);
    } catch (error) {
      console.error('Error creating vendor:', error);
      res.status(500).json({ message: 'Failed to create vendor' });
    }
  });
  
  // Product Endpoints
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });
  
  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).json({ message: 'Failed to fetch product details' });
    }
  });
  
  app.post('/api/products', async (req, res) => {
    try {
      // Validate the request body
      const { name, description, category, sku, price, vendorId } = req.body;
      
      if (!name || !description || !category || !vendorId) {
        return res.status(400).json({ message: 'Name, description, category, and vendorId are required' });
      }
      
      const product = await storage.createProduct({
        name,
        description,
        category,
        sku,
        price,
        vendorId
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  });
  
  app.get('/api/vendors/:id/products', async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const products = await storage.getVendorProducts(vendorId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      res.status(500).json({ message: 'Failed to fetch vendor products' });
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
      const { document1Id, document2Id, document3Id, document4Id, comparisonMode = 'policy', userId = 1 } = req.body;
      
      if (!document1Id || !document2Id) {
        return res.status(400).json({ message: 'At least two document IDs are required' });
      }
      
      // Get the main documents
      const document1 = await storage.getDocument(Number(document1Id));
      const document2 = await storage.getDocument(Number(document2Id));
      
      if (!document1 || !document2) {
        return res.status(404).json({ message: 'One or both main documents not found' });
      }
      
      // Get optional additional documents for multi-policy comparison
      let document3 = null;
      let document4 = null;
      
      if (document3Id) {
        document3 = await storage.getDocument(Number(document3Id));
        if (!document3) {
          return res.status(404).json({ message: 'Document 3 not found' });
        }
      }
      
      if (document4Id) {
        document4 = await storage.getDocument(Number(document4Id));
        if (!document4) {
          return res.status(404).json({ message: 'Document 4 not found' });
        }
      }
      
      // Check if files paths are available
      if (!document1.filePath || !document2.filePath || 
          (document3 && !document3.filePath) || 
          (document4 && !document4.filePath)) {
        // Fall back to dummy data if the file paths aren't available
        console.warn('File paths not available, using content-based comparison');
        
        // Compare the content stored in the database instead
        const doc1Content = document1.content || '';
        const doc2Content = document2.content || '';
        
        // Do a simple text-based comparison
        const addedWords = doc2Content.split(/\s+/).filter(word => !doc1Content.includes(word)).length;
        const removedWords = doc1Content.split(/\s+/).filter(word => !doc2Content.includes(word)).length;
        
        const comparisonResult = {
          differencesSummary: `Found ${addedWords + removedWords} differences between ${document1.filename} and ${document2.filename}`,
          differences: {
            addedClauses: addedWords,
            removedClauses: removedWords,
            modifiedClauses: Math.round(Math.abs(doc1Content.length - doc2Content.length) / 20),
            details: [
              { type: 'addition', section: 'Document', description: `${addedWords} new terms found` },
              { type: 'removal', section: 'Document', description: `${removedWords} terms removed` },
              { type: 'modification', section: 'Document', description: 'Content has been modified' }
            ]
          }
        };
        
        const comparison = await storage.createFileComparison({
          userId,
          document1Id: document1.id,
          document2Id: document2.id,
          differencesSummary: comparisonResult.differencesSummary,
          differences: comparisonResult.differences
        });
        
        const response = { 
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
            comparisonMode,
            ...comparisonResult
          }
        };
        
        // Add additional documents if available
        if (document3) {
          response.comparison.document3 = {
            id: document3.id,
            name: document3.filename
          };
        }
        
        if (document4) {
          response.comparison.document4 = {
            id: document4.id,
            name: document4.filename
          };
        }
        
        return res.json(response);
      }
      
      // Get the file paths for all documents
      const filePath1 = document1.filePath;
      const filePath2 = document2.filePath;
      
      // Prepare additional file paths if they exist
      const additionalFiles: string[] = [];
      
      if (document3 && document3.filePath) {
        additionalFiles.push(document3.filePath);
      }
      
      if (document4 && document4.filePath) {
        additionalFiles.push(document4.filePath);
      }
      
      // Import PDF comparison service at the function scope to avoid module dependency cycles
      const { comparePdfDocuments } = await import('./services/pdfComparison');
      
      // Perform the actual PDF comparison
      console.log(`Comparing PDFs in ${comparisonMode} mode: ${filePath1} and ${filePath2}${additionalFiles.length > 0 ? ' with additional files' : ''}`);
      const comparisonDetails = await comparePdfDocuments(filePath1, filePath2, {
        mode: comparisonMode as 'policy' | 'template',
        additionalFiles
      });
      
      // Create a detailed summary of the differences based on the comparison mode
      let differencesSummary = '';
      
      if (comparisonMode === 'template') {
        // Template completion summary
        if (comparisonDetails.removedClauses > 0) {
          differencesSummary = `Completion check found ${comparisonDetails.removedClauses} missing fields in the document ${document2.filename} compared to template ${document1.filename}.\n\n`;
          differencesSummary += `• Missing Fields: ${comparisonDetails.removedClauses} field(s) from the template have not been filled in the client document.\n\n`;
          
          if (comparisonDetails.modifiedClauses > 0) {
            differencesSummary += `• Partially Filled: ${comparisonDetails.modifiedClauses} field(s) appear to be partially completed but may need more information.\n\n`;
          }
          
          if (comparisonDetails.addedClauses > 0) {
            differencesSummary += `• Completed Fields: ${comparisonDetails.addedClauses} field(s) have been filled in successfully.\n\n`;
          }
          
          differencesSummary += `IMPORTANT: Please ensure all template fields are properly completed before proceeding.`;
        } else {
          differencesSummary = `All required fields appear to be filled in document ${document2.filename}.\n\n`;
          
          if (comparisonDetails.addedClauses > 0) {
            differencesSummary += `• Successfully completed ${comparisonDetails.addedClauses} field(s).\n\n`;
          }
          
          if (comparisonDetails.modifiedClauses > 0) {
            differencesSummary += `• ${comparisonDetails.modifiedClauses} field(s) were filled but may need review for accuracy.\n\n`;
          }
        }
      } else {
        // Policy comparison summary
        const docCount = 2 + additionalFiles.length;
        const docNames = [document1.filename, document2.filename];
        
        if (document3) docNames.push(document3.filename);
        if (document4) docNames.push(document4.filename);
        
        const docNamesList = docNames.join(', ');
        
        if (comparisonDetails.addedClauses > 0 || comparisonDetails.removedClauses > 0 || comparisonDetails.modifiedClauses > 0) {
          if (docCount > 2) {
            differencesSummary = `Analysis found differences across ${docCount} policies (${docNamesList}):\n\n`;
          } else {
            differencesSummary = `Analysis found ${comparisonDetails.addedClauses + comparisonDetails.removedClauses + comparisonDetails.modifiedClauses} differences between ${document1.filename} and ${document2.filename}:\n\n`;
          }
          
          if (comparisonDetails.addedClauses > 0) {
            if (docCount > 2) {
              differencesSummary += `• Unique Content: ${comparisonDetails.addedClauses} clause(s) appear in only some policies but not others.\n\n`;
            } else {
              differencesSummary += `• Added Content: ${comparisonDetails.addedClauses} section(s) appear in the second document that are not in the first. These additions may grant new rights, impose new obligations, or provide additional coverage.\n\n`;
            }
          }
          
          if (comparisonDetails.removedClauses > 0) {
            if (docCount > 2) {
              differencesSummary += `• Missing Content: ${comparisonDetails.removedClauses} clause(s) that appear in the first policy are absent in some or all other policies.\n\n`;
            } else {
              differencesSummary += `• Removed Content: ${comparisonDetails.removedClauses} section(s) from the first document were removed. These removals may eliminate previously established rights, obligations, or coverage areas.\n\n`;
            }
          }
          
          if (comparisonDetails.modifiedClauses > 0) {
            if (docCount > 2) {
              differencesSummary += `• Common Content: ${comparisonDetails.modifiedClauses} clause(s) appear to be common across multiple policies, with similar language and coverage provisions.\n\n`;
            } else {
              differencesSummary += `• Modified Content: ${comparisonDetails.modifiedClauses} section(s) have been altered. These modifications may change the meaning, scope, or effect of the document.\n\n`;
            }
          }
          
          differencesSummary += `IMPORTANT: The differences identified may affect legal rights, financial obligations, or insurance coverage. Please review all differences carefully before making decisions.`;
        } else {
          if (docCount > 2) {
            differencesSummary = `The ${docCount} policies (${docNamesList}) appear to be substantially similar with no significant unique clauses detected.`;
          } else {
            differencesSummary = `The documents appear to be substantially similar. No significant textual differences were detected between ${document1.filename} and ${document2.filename}.`;
          }
        }
      }
      
      // Store the comparison result
      const comparison = await storage.createFileComparison({
        userId,
        document1Id: document1.id,
        document2Id: document2.id,
        differencesSummary,
        differences: comparisonDetails
      });
      
      // Prepare the response object
      const response = { 
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
          comparisonMode,
          differencesSummary,
          differences: comparisonDetails
        }
      };
      
      // Add additional documents if available
      if (document3) {
        response.comparison.document3 = {
          id: document3.id,
          name: document3.filename
        };
      }
      
      if (document4) {
        response.comparison.document4 = {
          id: document4.id,
          name: document4.filename
        };
      }
      
      // Return the comparison result to the client
      res.json(response);
    } catch (error) {
      console.error('Error comparing files:', error);
      res.status(500).json({ message: 'Failed to compare files' });
    }
  });

  // Email Sending Endpoint
  app.post('/api/email/send', async (req, res) => {
    try {
      const { recipient, subject, content, comparisonId, comparisonMode } = req.body;
      
      if (!recipient || !subject || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Log the comparison mode and ID if provided
      if (comparisonId) {
        console.log(`Reference to comparison ID: ${comparisonId}, Mode: ${comparisonMode || 'not specified'}`);
      }
      
      // Import at function scope to avoid module dependency cycles
      const { sendEmail, convertTextToHtml } = await import('./services/email');
      
      // Adjust the email content and subject based on comparison mode if needed
      let emailSubject = subject;
      if (comparisonMode === 'template') {
        // Add prefix for template emails if not already present
        if (!emailSubject.toLowerCase().includes('template')) {
          emailSubject = 'Template Completion Review: ' + emailSubject;
        }
      }
      
      // Send email using SendGrid
      const htmlContent = convertTextToHtml(content);
      const emailSent = await sendEmail({
        to: recipient,
        from: 'support@replit.app', // Using a generic Replit address to avoid DNS issues
        subject: emailSubject,
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

  // Opportunities API endpoints
  app.get('/api/opportunities', async (req, res) => {
    try {
      const opportunities = await storage.getAllOpportunities();
      
      // Customer and product mapping based on database values
      const clientMapping: {[key: number]: string} = {
        1: "Van Damme BVBA",
        2: "Laura Martens", 
        3: "Green Tech SA"
      };
      
      const productMapping: {[key: number]: string} = {
        1: "Property Insurance",
        3: "Cyber Insurance",
        4: "Auto Insurance", 
        6: "Life Insurance",
        7: "Business Interruption"
      };
      
      // Add client and product names to each opportunity
      const enrichedOpportunities = opportunities.map((opportunity: any) => {
        const clientName = clientMapping[opportunity.clientId] || `Client #${opportunity.clientId}`;
        const productName = productMapping[opportunity.productId] || `Product #${opportunity.productId}`;
        
        return {
          ...opportunity,
          clientName,
          productName
        };
      });
      
      res.json(enrichedOpportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ message: 'Failed to fetch opportunities' });
    }
  });

  // Partners API endpoints
  app.get('/api/partners', async (req, res) => {
    try {
      const partners = await storage.getAllCustomers(); // Partners are stored in customers table
      
      // Transform database records to match the frontend's expected format
      const formattedPartners = partners.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        company: partner.name, // For compatibility with existing frontend
        initials: partner.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase(),
        industry: "Insurance", // Default value, could be enhanced later
        partnerType: "Broker", // Default value, could be enhanced later
        status: "active", // Default value, could be enhanced later
        size: "medium", // Default value, could be enhanced later
        customers: 0, // Could be calculated from relationships
        opportunities: 0, // Could be calculated from relationships
        location: "Various", // Default value, could be enhanced later
        contactEmail: `contact@${partner.name.toLowerCase().replace(/\s+/g, '')}.com`,
        primaryContact: partner.name.split(' ')[0] + " Contact",
        description: partner.description || "Strategic business partner"
      }));
      
      res.json(formattedPartners);
    } catch (error) {
      console.error('Error fetching partners:', error);
      res.status(500).json({ message: 'Failed to fetch partners' });
    }
  });

  app.get('/api/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ message: 'Opportunity not found' });
      }
      res.json(opportunity);
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      res.status(500).json({ message: 'Failed to fetch opportunity' });
    }
  });

  app.post('/api/opportunities', async (req, res) => {
    try {
      const opportunity = await storage.createOpportunity(req.body);
      res.status(201).json(opportunity);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      res.status(500).json({ message: 'Failed to create opportunity' });
    }
  });

  app.put('/api/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.updateOpportunity(id, req.body);
      if (!opportunity) {
        return res.status(404).json({ message: 'Opportunity not found' });
      }
      res.json(opportunity);
    } catch (error) {
      console.error('Error updating opportunity:', error);
      res.status(500).json({ message: 'Failed to update opportunity' });
    }
  });

  app.delete('/api/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteOpportunity(id);
      if (!success) {
        return res.status(404).json({ message: 'Opportunity not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      res.status(500).json({ message: 'Failed to delete opportunity' });
    }
  });

  // Bulk update opportunity status
  app.patch('/api/opportunities/bulk-update-status', async (req, res) => {
    try {
      const { opportunityIds, status } = req.body;
      
      if (!opportunityIds || !Array.isArray(opportunityIds) || opportunityIds.length === 0) {
        return res.status(400).json({ message: 'opportunityIds array is required' });
      }
      
      if (!status) {
        return res.status(400).json({ message: 'status is required' });
      }
      
      // Update each opportunity's status
      const updatedOpportunities = [];
      for (const id of opportunityIds) {
        try {
          const updated = await storage.updateOpportunity(id, { status });
          if (updated) {
            updatedOpportunities.push(updated);
          }
        } catch (error) {
          console.error(`Error updating opportunity ${id}:`, error);
        }
      }
      
      res.json({ 
        message: `Updated ${updatedOpportunities.length} opportunities to "${status}"`,
        updatedCount: updatedOpportunities.length,
        updatedOpportunities
      });
    } catch (error) {
      console.error('Error bulk updating opportunity status:', error);
      res.status(500).json({ message: 'Failed to update opportunity status' });
    }
  });

  // OKR Templates API endpoints
  app.get('/api/okr-templates', async (req, res) => {
    try {
      const templates = await db.select().from(okrTemplates);
      res.json(templates);
    } catch (error) {
      console.error('Error fetching OKR templates:', error);
      res.status(500).json({ error: 'Failed to fetch OKR templates' });
    }
  });

  app.post('/api/okr-templates', async (req, res) => {
    try {
      const templateData = insertOkrTemplateSchema.parse(req.body);
      const [newTemplate] = await db.insert(okrTemplates).values(templateData).returning();
      res.json(newTemplate);
    } catch (error) {
      console.error('Error creating OKR template:', error);
      res.status(500).json({ error: 'Failed to create OKR template' });
    }
  });

  app.get('/api/okr-templates/:id', async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const [template] = await db.select().from(okrTemplates).where(eq(okrTemplates.id, templateId));
      
      if (!template) {
        return res.status(404).json({ error: 'OKR template not found' });
      }
      
      res.json(template);
    } catch (error) {
      console.error('Error fetching OKR template:', error);
      res.status(500).json({ error: 'Failed to fetch OKR template' });
    }
  });

  // OKR Metrics API endpoints
  app.get('/api/okr-metrics', async (req, res) => {
    try {
      const { templateId, tags } = req.query;
      let query = db.select().from(okrMetrics);
      
      if (templateId) {
        query = query.where(eq(okrMetrics.templateId, parseInt(templateId as string)));
      }
      
      if (tags && typeof tags === 'string') {
        const tagArray = tags.split(',');
        // Filter by tags using array overlap
        query = query.where(inArray(okrMetrics.tag, tagArray));
      }
      
      const metrics = await query;
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching OKR metrics:', error);
      res.status(500).json({ error: 'Failed to fetch OKR metrics' });
    }
  });

  app.post('/api/okr-metrics', async (req, res) => {
    try {
      const metricData = insertOkrMetricSchema.parse(req.body);
      const [newMetric] = await db.insert(okrMetrics).values(metricData).returning();
      res.json(newMetric);
    } catch (error) {
      console.error('Error creating OKR metric:', error);
      res.status(500).json({ error: 'Failed to create OKR metric' });
    }
  });

  app.get('/api/okr-metrics/:id', async (req, res) => {
    try {
      const metricId = parseInt(req.params.id);
      const [metric] = await db.select().from(okrMetrics).where(eq(okrMetrics.id, metricId));
      
      if (!metric) {
        return res.status(404).json({ error: 'OKR metric not found' });
      }
      
      res.json(metric);
    } catch (error) {
      console.error('Error fetching OKR metric:', error);
      res.status(500).json({ error: 'Failed to fetch OKR metric' });
    }
  });

  app.put('/api/okr-metrics/:id', async (req, res) => {
    try {
      const metricId = parseInt(req.params.id);
      const metricData = insertOkrMetricSchema.partial().parse(req.body);
      
      const [updatedMetric] = await db
        .update(okrMetrics)
        .set({ ...metricData, updatedAt: new Date() })
        .where(eq(okrMetrics.id, metricId))
        .returning();
      
      if (!updatedMetric) {
        return res.status(404).json({ error: 'OKR metric not found' });
      }
      
      res.json(updatedMetric);
    } catch (error) {
      console.error('Error updating OKR metric:', error);
      res.status(500).json({ error: 'Failed to update OKR metric' });
    }
  });

  app.delete('/api/okr-metrics/:id', async (req, res) => {
    try {
      const metricId = parseInt(req.params.id);
      
      const [deletedMetric] = await db
        .delete(okrMetrics)
        .where(eq(okrMetrics.id, metricId))
        .returning();
      
      if (!deletedMetric) {
        return res.status(404).json({ error: 'OKR metric not found' });
      }
      
      res.json({ success: true, message: 'OKR metric deleted successfully' });
    } catch (error) {
      console.error('Error deleting OKR metric:', error);
      res.status(500).json({ error: 'Failed to delete OKR metric' });
    }
  });

  // Get OKR metrics with their activities (nested structure)
  app.get('/api/okr-metrics/with-activities', async (req, res) => {
    try {
      const allMetrics = await db.select().from(okrMetrics);
      
      // Organize metrics into parent-child relationships
      const metricsMap = new Map();
      const rootMetrics = [];
      
      // First pass: create map of all metrics
      allMetrics.forEach(metric => {
        metricsMap.set(metric.id, { ...metric, activities: [] });
      });
      
      // Second pass: organize parent-child relationships
      allMetrics.forEach(metric => {
        if (metric.parentId) {
          const parent = metricsMap.get(metric.parentId);
          if (parent) {
            parent.activities.push(metricsMap.get(metric.id));
          }
        } else {
          rootMetrics.push(metricsMap.get(metric.id));
        }
      });
      
      res.json(rootMetrics);
    } catch (error) {
      console.error('Error fetching OKR metrics with activities:', error);
      res.status(500).json({ error: 'Failed to fetch OKR metrics with activities' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
