import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  opportunities, 
  clients, 
  insuranceProducts, 
  okrMetrics, 
  okrTags, 
  partners,
  customers,
  savedLists,
  savedViews,
  okrTemplateAssignments,
  contacts,
  entityLogos,
  insertEntityLogoSchema,
  campaigns,
  campaignRecipients,
  campaignFollowUps,
  campaignShares,
  insertCampaignSchema,
  insertCampaignRecipientSchema,
  insertCampaignFollowUpSchema,
  insertCampaignShareSchema
} from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { db, pool } from './db';
import multer from 'multer';
import { copyEnvironmentData } from './initDatabase';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { comparePdfDocuments, extractTextFromPdf } from './services/pdfComparison';

// Aggressive in-memory cache for fast responses
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes for critical endpoints
const CRITICAL_CACHE_TTL = 600000; // 10 minutes for partners/customers

function getCached(key: string) {
  const cached = cache.get(key);
  const ttl = key.includes('partners') || key.includes('customers') ? CRITICAL_CACHE_TTL : CACHE_TTL;
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
  
  // Clear old cache entries periodically
  if (cache.size > 100) {
    const now = Date.now();
    const keysToDelete = [];
    cache.forEach((v, k) => {
      if (now - v.timestamp > CRITICAL_CACHE_TTL) {
        keysToDelete.push(k);
      }
    });
    keysToDelete.forEach(k => cache.delete(k));
  }
}

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
  // All API redirects to De Goudse environment - clean routing
  app.get('/api/contacts', (req, res) => res.redirect('/api/degoudse/contacts'));
  app.post('/api/contacts', (req, res) => res.redirect(307, '/api/degoudse/contacts'));
  app.get('/api/vendors', (req, res) => res.redirect('/api/degoudse/vendors'));
  app.post('/api/vendors', (req, res) => res.redirect(307, '/api/degoudse/vendors'));
  app.get('/api/partners', (req, res) => res.redirect('/api/degoudse/partners'));
  app.get('/api/customers', (req, res) => res.redirect('/api/degoudse/customers'));
  app.get('/api/products', (req, res) => res.redirect('/api/degoudse/products'));
  app.get('/api/okr-metrics', (req, res) => res.redirect('/api/degoudse/okr-metrics'));
  app.get('/api/okr-tags', (req, res) => res.redirect('/api/degoudse/okr-tags'));
  app.get('/api/saved-lists', (req, res) => res.redirect('/api/degoudse/saved-lists' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')));
  app.get('/api/saved-views', (req, res) => res.redirect('/api/degoudse/saved-views' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')));
  app.get('/api/template-assignments/:entityType/:entityId?', (req, res) => res.redirect(`/api/degoudse/template-assignments/${req.params.entityType}${req.params.entityId ? '/' + req.params.entityId : ''}`));
  
  // Partners API - Returns data from authentic myqollabi partners table
  app.get('/api/partners', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT p.*, 
               COUNT(DISTINCT pc.customer_id) as customer_count,
               COUNT(DISTINCT po.opportunity_id) as opportunity_count,
               STRING_AGG(DISTINCT c.name, ', ') as customer_names
        FROM myqollabi.partners p
        LEFT JOIN myqollabi.partner_customers pc ON p.id = pc.partner_id
        LEFT JOIN myqollabi.partner_opportunities po ON p.id = po.partner_id
        LEFT JOIN myqollabi.customers c ON c.id = pc.customer_id
        GROUP BY p.id, p.name, p.description, p.status, p.location, p.contact_email, 
                 p.primary_contact, p.partner_type, p.region, p.assigned_user_ids, 
                 p.linked_opportunity_ids, p.created_at, p.updated_at
        ORDER BY p.id
      `);
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        initials: partner.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
        industry: "Insurance",
        type: partner.partner_type || "Partner", 
        size: "medium",
        status: partner.status,
        customers: partner.customer_count || 0,
        opportunities: partner.opportunity_count || 0,
        location: partner.location,
        contactEmail: partner.contact_email,
        primaryContact: partner.primary_contact,
        // Database fields
        partner_type: partner.partner_type,
        region: partner.region,
        assigned_user_ids: partner.assigned_user_ids,
        linked_opportunity_ids: partner.linked_opportunity_ids,
        createdAt: partner.created_at,
        updatedAt: partner.updated_at,
        customerNames: partner.customer_names || ''
      }));
      
      console.log(`Returning ${partners.length} partners with relationship counts from myqollabi schema`);
      res.json(partners);
    } catch (error) {
      console.error('Error fetching partners:', error);
      res.json([]);
    }
  });

  // Customer API - Returns data from myqollabi customers table
  app.get('/api/customers', async (req, res) => {
    try {
      console.log('Customer API endpoint hit');
      
      const result = await db.execute(sql`
        SELECT c.*, 
               COUNT(DISTINCT pc.partner_id) as partner_count,
               COUNT(DISTINCT co.opportunity_id) as opportunity_count
        FROM myqollabi.customers c
        LEFT JOIN myqollabi.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN myqollabi.customer_opportunities co ON c.id = co.customer_id
        GROUP BY c.id, c.name, c.description, c.contact_name, c.contact_email, 
                 c.contact_phone, c.owner_id, c.assigned_partner_id, c.created_at, c.updated_at
        ORDER BY c.id
      `);
      
      console.log(`Found ${result.rows.length} customers in myqollabi schema`);
      
      const customers = result.rows.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        description: customer.description,
        contact_name: customer.contact_name,
        contact_email: customer.contact_email,
        contact_phone: customer.contact_phone,
        owner_id: customer.owner_id,
        assigned_partner_id: customer.assigned_partner_id,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
        partnerCount: parseInt(customer.partner_count) || 0,
        opportunityCount: parseInt(customer.opportunity_count) || 0
      }));
      
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.json([]);
    }
  });

  // Redirect opportunities to De Goudse environment
  app.get('/api/opportunities', (req, res) => res.redirect('/api/degoudse/opportunities'));



  // Partners API - Returns data from authentic myqollabi partners table
  app.get('/api/partners', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT p.*, 
               COUNT(DISTINCT pc.customer_id) as customer_count,
               COUNT(DISTINCT po.opportunity_id) as opportunity_count,
               STRING_AGG(DISTINCT c.name, ', ') as customer_names
        FROM myqollabi.partners p
        LEFT JOIN myqollabi.partner_customers pc ON p.id = pc.partner_id
        LEFT JOIN myqollabi.partner_opportunities po ON p.id = po.partner_id
        LEFT JOIN myqollabi.customers c ON c.id = pc.customer_id
        GROUP BY p.id, p.name, p.description, p.status, p.location, p.contact_email, 
                 p.primary_contact, p.partner_type, p.region, p.assigned_user_ids, 
                 p.linked_opportunity_ids, p.created_at, p.updated_at
        ORDER BY p.id
      `);
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        initials: partner.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
        industry: "Insurance",
        type: partner.partner_type || "Partner", 
        size: "medium",
        status: partner.status,
        customers: partner.customer_count || 0,
        opportunities: partner.opportunity_count || 0,
        location: partner.location,
        contactEmail: partner.contact_email,
        primaryContact: partner.primary_contact,
        // Database fields
        partner_type: partner.partner_type,
        region: partner.region,
        assigned_user_ids: partner.assigned_user_ids,
        linked_opportunity_ids: partner.linked_opportunity_ids,
        createdAt: partner.created_at,
        updatedAt: partner.updated_at,
        customerNames: partner.customer_names || ''
      }));
      
      console.log(`Returning ${partners.length} partners with relationship counts from myqollabi schema`);
      res.json(partners);
    } catch (error) {
      console.error('Error fetching partners:', error);
      res.json([]);
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
  
  // Opportunities Endpoints - removed duplicate, using the enhanced version below

  // Clients Endpoints
  app.get('/api/clients', async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch clients' });
    }
  });
  
  // Create new partner
  app.post('/api/partners', async (req, res) => {
    try {
      const { 
        name, 
        description, 
        location, 
        contactEmail, 
        primaryContact, 
        partnerType, 
        region, 
        status = 'active' 
      } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
      }
      
      // Insert into myqollabi.partners table
      const result = await db.execute(sql`
        INSERT INTO myqollabi.partners (
          name, description, status, location, contact_email, 
          primary_contact, partner_type, region, assigned_user_ids, 
          linked_opportunity_ids, created_at, updated_at
        ) VALUES (
          ${name}, ${description}, ${status}, ${location || ''}, ${contactEmail || ''}, 
          ${primaryContact || ''}, ${partnerType || 'partner'}, ${region || ''}, 
          '{}', '{}', NOW(), NOW()
        ) RETURNING *
      `);
      
      const partner = result.rows[0];
      res.status(201).json(partner);
    } catch (error) {
      console.error('Error creating partner:', error);
      res.status(500).json({ message: 'Failed to create partner' });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      console.log('Customer creation request body:', req.body);
      
      // Validate the request body with expanded fields
      const { 
        name, 
        description, 
        contactName, 
        contactEmail, 
        contactPhone, 
        ownerId, 
        assignedPartnerId 
      } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
      }
      
      console.log('Executing customer insert query...');
      
      // Insert into myqollabi.customers table with all available fields
      const result = await db.execute(sql`
        INSERT INTO myqollabi.customers (
          name, description, contact_name, contact_email, contact_phone, 
          owner_id, assigned_partner_id, created_at, updated_at
        ) VALUES (
          ${name}, ${description}, ${contactName || null}, ${contactEmail || null}, 
          ${contactPhone || null}, ${ownerId || null}, ${assignedPartnerId || null}, 
          NOW(), NOW()
        ) RETURNING *
      `);
      
      console.log('Customer insert result:', result.rows[0]);
      const customer = result.rows[0];
      res.status(201).json(customer);
    } catch (error) {
      console.error('Detailed error creating customer:', error);
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
      console.log('Product creation request body:', req.body);
      
      // Validate the request body with all product fields
      const { 
        name, 
        description, 
        category, 
        sku, 
        price, 
        vendorId 
      } = req.body;
      
      if (!name || !description || !category || !vendorId) {
        return res.status(400).json({ message: 'Name, description, category, and vendor are required' });
      }
      
      console.log('Executing product insert query...');
      
      // Insert into myqollabi.products table with all available fields
      const result = await db.execute(sql`
        INSERT INTO myqollabi.products (
          name, description, category, sku, price, vendor_id,
          created_at, updated_at
        ) VALUES (
          ${name}, ${description}, ${category}, ${sku || null}, 
          ${price || null}, ${parseInt(vendorId)}, NOW(), NOW()
        ) RETURNING *
      `);
      
      console.log('Product insert result:', result.rows[0]);
      const product = result.rows[0];
      res.status(201).json(product);
    } catch (error) {
      console.error('Detailed error creating product:', error);
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





  // Customers API - Returns data from authentic myqollabi customers table
  app.get('/api/customers', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT c.*, 
               COUNT(DISTINCT o.id) as opportunity_count,
               COUNT(DISTINCT pc.partner_id) as partner_count,
               STRING_AGG(DISTINCT p.name, ', ') as partner_names
        FROM myqollabi.customers c
        LEFT JOIN myqollabi.opportunities o ON o.client_id = c.id
        LEFT JOIN myqollabi.partner_customers pc ON pc.customer_id = c.id
        LEFT JOIN myqollabi.partners p ON p.id = pc.partner_id
        GROUP BY c.id, c.name, c.description, c.owner_id, c.created_at, c.updated_at, 
                 c.contact_name, c.contact_email, c.contact_phone, c.assigned_partner_id
        ORDER BY c.id
      `);
      
      const customers = result.rows.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        description: customer.description,
        initials: customer.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
        ownerId: customer.owner_id,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        contactName: customer.contact_name,
        contactEmail: customer.contact_email,
        contactPhone: customer.contact_phone,
        assignedPartnerId: customer.assigned_partner_id,
        opportunityCount: customer.opportunity_count || 0,
        partnerCount: customer.partner_count || 0,
        partnerNames: customer.partner_names || ''
      }));
      
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  });

  // Get customers for a specific partner using many-to-many relationship
  app.get('/api/partners/:id/customers', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const result = await db.execute(sql`
        SELECT c.*, COUNT(o.id) as opportunity_count
        FROM degoudse.customers c
        INNER JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN degoudse.opportunities o ON o.client_id = c.id
        WHERE pc.partner_id = ${partnerId}
        GROUP BY c.id, c.name, c.description, c.owner_id, c.created_at, c.updated_at, 
                 c.contact_name, c.contact_email, c.contact_phone
        ORDER BY c.id
      `);
      
      const customers = result.rows.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        description: customer.description,
        contactName: customer.contact_name,
        contactEmail: customer.contact_email,
        contactPhone: customer.contact_phone,
        opportunityCount: customer.opportunity_count || 0
      }));
      
      res.json(customers);
    } catch (error) {
      console.error('Error fetching partner customers:', error);
      res.status(500).json({ error: 'Failed to fetch partner customers' });
    }
  });

  // Get opportunities for a specific partner using many-to-many relationship
  app.get('/api/partners/:id/opportunities', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const result = await db.execute(sql`
        SELECT o.*, c.name as client_name
        FROM degoudse.opportunities o
        INNER JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
        LEFT JOIN degoudse.customers c ON o.client_id = c.id
        WHERE po.partner_id = ${partnerId}
        ORDER BY o.id
      `);
      
      const opportunities = result.rows.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        status: opp.status,
        stage: opp.stage,
        estimatedValue: opp.estimated_value,
        clientName: opp.client_name,
        createdAt: opp.created_at,
        updatedAt: opp.updated_at,
        expectedCloseDate: opp.expected_close_date
      }));
      
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching partner opportunities:', error);
      res.status(500).json({ error: 'Failed to fetch partner opportunities' });
    }
  });

  // Get activities for a specific partner
  app.get('/api/:envId/partners/:id/activities', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      
      // Return empty array for now - activities will be handled by timeline
      res.json([]);
    } catch (error) {
      console.error('Error fetching partner activities:', error);
      res.status(500).json({ error: 'Failed to fetch partner activities' });
    }
  });

  // Get timeline for a specific partner
  app.get('/api/:envId/partners/:id/timeline', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      
      // Mock timeline data that matches the expected structure
      const mockTimeline = [
        {
          id: 1,
          activity_type: 'comment',
          title: 'Initial partner review completed',
          content: 'Completed comprehensive review of partner capabilities and market position',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          author_name: 'System',
          visible_to_partner: true
        },
        {
          id: 2,
          activity_type: 'task',
          title: 'Follow up on Q1 targets',
          content: 'Review quarterly performance metrics and discuss improvement strategies',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          author_name: 'Account Manager',
          priority: 'high',
          visible_to_partner: false
        },
        {
          id: 3,
          activity_type: 'attachment',
          title: 'Contract renewal documents',
          content: 'Updated partnership agreement for 2025',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          author_name: 'Legal Team',
          visible_to_partner: true
        }
      ];
      
      res.json(mockTimeline);
    } catch (error) {
      console.error('Error fetching partner timeline:', error);
      res.status(500).json({ error: 'Failed to fetch partner timeline' });
    }
  });

  // Get partners for a specific customer using many-to-many relationship
  app.get('/api/customers/:id/partners', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const result = await db.execute(sql`
        SELECT p.*
        FROM myqollabi.partners p
        INNER JOIN myqollabi.partner_customers pc ON p.id = pc.partner_id
        WHERE pc.customer_id = ${customerId}
        ORDER BY p.id
      `);
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        location: partner.location,
        contactEmail: partner.contact_email,
        primaryContact: partner.primary_contact
      }));
      
      res.json(partners);
    } catch (error) {
      console.error('Error fetching customer partners:', error);
      res.status(500).json({ error: 'Failed to fetch customer partners' });
    }
  });

  // Get partners for a specific opportunity using many-to-many relationship
  app.get('/api/opportunities/:id/partners', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const result = await db.execute(sql`
        SELECT p.*
        FROM myqollabi.partners p
        INNER JOIN myqollabi.partner_opportunities po ON p.id = po.partner_id
        WHERE po.opportunity_id = ${opportunityId}
        ORDER BY p.id
      `);
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        location: partner.location,
        contactEmail: partner.contact_email,
        primaryContact: partner.primary_contact
      }));
      
      res.json(partners);
    } catch (error) {
      console.error('Error fetching opportunity partners:', error);
      res.status(500).json({ error: 'Failed to fetch opportunity partners' });
    }
  });

  app.get('/api/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await db.execute(sql`SELECT * FROM myqollabi.opportunities WHERE id = ${id}`);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Opportunity not found' });
      }

      const opportunity = result.rows[0];
      const formattedOpportunity = {
        id: opportunity.id,
        title: opportunity.title || opportunity.name,
        clientId: opportunity.customer_id,
        clientName: opportunity.client_name,
        productId: 1,
        productName: "Insurance Product",
        probability: opportunity.probability,
        estimatedValue: opportunity.value,
        status: opportunity.status,
        stage: opportunity.stage, 
        type: opportunity.type,
        priority: opportunity.priority,
        description: opportunity.description,
        location: opportunity.location,
        partnerName: opportunity.partner_name,
        lastActivityDate: opportunity.last_activity_date,
        assignedUserId: opportunity.assigned_user_id,
        createdAt: opportunity.created_at,
        updatedAt: opportunity.updated_at,
        expected_close_date: opportunity.expected_close_date,
        delivery_date: opportunity.delivery_date,
        customer_id: opportunity.customer_id,
        partner_id: opportunity.partner_id,
        linked_product_ids: opportunity.linked_product_ids,
        linked_contact_ids: opportunity.linked_contact_ids,
        created_by: opportunity.created_by
      };

      res.json(formattedOpportunity);
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      res.status(500).json({ message: 'Failed to fetch opportunity' });
    }
  });

  app.post('/api/opportunities', async (req, res) => {
    try {
      console.log('Opportunity creation request body:', req.body);
      
      // Validate the request body with expanded fields
      const { 
        title, 
        description, 
        clientId, 
        status = 'active',
        stage = 'qualification',
        type = 'new_business',
        estimatedValue,
        probability,
        location,
        partnerName,
        lastActivityDate,
        linkedContactIds = [],
        createdBy
      } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }
      
      console.log('Executing opportunity insert query...');
      
      // Insert into myqollabi.opportunities table with all available fields
      const result = await db.execute(sql`
        INSERT INTO myqollabi.opportunities (
          title, description, client_id, status, stage, type, 
          estimated_value, probability, location, partner_name, 
          last_activity_date, linked_contact_ids, created_by, 
          created_at, updated_at
        ) VALUES (
          ${title}, ${description}, ${clientId || null}, ${status}, ${stage}, ${type},
          ${estimatedValue || null}, ${probability || null}, ${location || null}, ${partnerName || null},
          ${lastActivityDate || null}, ARRAY[]::integer[], ${createdBy || null},
          NOW(), NOW()
        ) RETURNING *
      `);
      
      console.log('Opportunity insert result:', result.rows[0]);
      const opportunity = result.rows[0];
      res.status(201).json(opportunity);
    } catch (error) {
      console.error('Detailed error creating opportunity:', error);
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

  // Database Status Endpoint for Developer Dashboard
  app.get('/api/database-status', async (req: Request, res: Response) => {
    try {
      // Import and use the schema synchronizer
      const { getEnvironmentCounts } = await import('./schemaSynchronizer');
      const counts = await getEnvironmentCounts();
      res.json(counts);
    } catch (error) {
      console.error('Database status error:', error);
      res.status(500).json({ error: 'Failed to fetch database status' });
    }
  });

  // Schema Synchronization Endpoint
  app.post('/api/schema/sync', async (req: Request, res: Response) => {
    try {
      const { copySchemaFromMyQollabi } = await import('./quickSchemaCopy');
      await copySchemaFromMyQollabi();
      res.json({ success: true, message: 'Schema synchronized successfully' });
    } catch (error) {
      console.error('Schema sync error:', error);
      res.status(500).json({ success: false, message: 'Schema synchronization failed' });
    }
  });

  // Fix De Goudse Relationships Endpoint
  app.post('/api/degoudse/fix-relationships', async (req: Request, res: Response) => {
    try {
      const envPool = pool;
      let relationshipsCreated = 0;
      
      // Get all opportunities and available partners/customers
      const opportunities = await envPool.query(`SELECT id, "clientId", "productId" FROM degoudse.opportunities`);
      const partners = await envPool.query(`SELECT id FROM degoudse.partners ORDER BY id`);
      const customers = await envPool.query(`SELECT id FROM degoudse.customers ORDER BY id`);
      
      if (partners.rows.length === 0 || customers.rows.length === 0) {
        return res.json({ 
          success: false, 
          message: 'No partners or customers available to create relationships' 
        });
      }
      
      // Create strategic relationships based on distribution patterns
      for (let i = 0; i < opportunities.rows.length; i++) {
        const opp = opportunities.rows[i];
        const { id: oppId, clientId, productId } = opp;
        
        // Assign partner based on modular distribution to ensure variety
        const partnerIndex = i % partners.rows.length;
        const partnerId = partners.rows[partnerIndex].id;
        
        // Use existing customer or assign based on distribution
        let finalClientId = clientId;
        if (!finalClientId && customers.rows.length > 0) {
          const customerIndex = i % customers.rows.length;
          finalClientId = customers.rows[customerIndex].id;
        }
        
        // Create partner-customer relationship
        if (partnerId && finalClientId) {
          try {
            await envPool.query(
              `INSERT INTO degoudse.partner_customers (partner_id, customer_id, created_at)
               VALUES ($1, $2, NOW())
               ON CONFLICT (partner_id, customer_id) DO NOTHING`,
              [partnerId, finalClientId]
            );
            relationshipsCreated++;
          } catch (error) {
            console.log(`Skipped partner-customer relationship for opp ${oppId}`);
          }
          
          // Create partner-opportunity relationship
          try {
            await envPool.query(
              `INSERT INTO degoudse.partner_opportunities (partner_id, opportunity_id, created_at)
               VALUES ($1, $2, NOW())
               ON CONFLICT (partner_id, opportunity_id) DO NOTHING`,
              [partnerId, oppId]
            );
            relationshipsCreated++;
          } catch (error) {
            console.log(`Skipped partner-opportunity relationship for opp ${oppId}`);
          }
        }
        
        // Create customer-opportunity relationship
        if (finalClientId) {
          try {
            await envPool.query(
              `INSERT INTO degoudse.customer_opportunities (customer_id, opportunity_id, created_at)
               VALUES ($1, $2, NOW())
               ON CONFLICT (customer_id, opportunity_id) DO NOTHING`,
              [finalClientId, oppId]
            );
            relationshipsCreated++;
          } catch (error) {
            console.log(`Skipped customer-opportunity relationship for opp ${oppId}`);
          }
        }
        
        // Create opportunity-product relationship
        if (productId) {
          try {
            await envPool.query(
              `INSERT INTO degoudse.opportunity_products (opportunity_id, product_id, created_at)
               VALUES ($1, $2, NOW())
               ON CONFLICT (opportunity_id, product_id) DO NOTHING`,
              [oppId, productId]
            );
            relationshipsCreated++;
          } catch (error) {
            console.log(`Skipped opportunity-product relationship for opp ${oppId}`);
          }
        }
      }
      
      res.json({ 
        success: true, 
        message: `Created relationships for ${opportunities.rows.length} opportunities using ${partners.rows.length} partners and ${customers.rows.length} customers`,
        relationshipsCreated,
        opportunitiesProcessed: opportunities.rows.length,
        partnersUsed: partners.rows.length,
        customersUsed: customers.rows.length
      });
    } catch (error) {
      console.error('Relationship fix error:', error);
      res.status(500).json({ success: false, message: 'Failed to fix relationships' });
    }
  });

  // Environment management API endpoints
  app.post('/api/environments/copy', async (req, res) => {
    try {
      const { sourceEnv, targetEnv } = req.body;
      
      if (!sourceEnv || !targetEnv) {
        return res.status(400).json({ 
          success: false, 
          message: 'Source and target environments are required' 
        });
      }
      
      // Copy data from source to target environment
      await copyEnvironmentData(sourceEnv, targetEnv);
      
      res.json({ 
        success: true, 
        message: `Environment copied successfully: ${sourceEnv} → ${targetEnv}` 
      });
    } catch (error) {
      console.error('Environment copy error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to copy environment data' 
      });
    }
  });

  // Users API endpoint for team member selection
  app.get('/api/:envId/users', async (req, res) => {
    try {
      const envId = req.params.envId;
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT id, name, email, role, partner_id, created_at, updated_at
        FROM ${envId}.users 
        ORDER BY name
      `);
      
      const users = result.rows.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        fullName: user.name,
        role: user.role || 'Team Member',
        partnerId: user.partner_id,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Emergency fast partners endpoint - serves immediate response
  app.get('/api/degoudse/partners-fast', async (req, res) => {
    try {
      const envPool = pool;
      const result = await envPool.query(`SELECT id, name, description, status, location, contact_email FROM degoudse.partners ORDER BY id LIMIT 10`);
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        initials: partner.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
        industry: "Insurance",
        type: "Partner",
        size: "medium",
        status: partner.status,
        customers: 0,
        opportunities: 0,
        location: partner.location,
        contactEmail: partner.contact_email
      }));
      
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch partners' });
    }
  });

  // De Goudse environment API routes (using proper database isolation)
  app.get('/api/degoudse/partners', async (req, res) => {
    const cacheKey = 'degoudse_partners';
    const cached = getCached(cacheKey);
    
    if (cached) {
      console.log(`Returning ${cached.length} partners from cache`);
      return res.json(cached);
    }
    
    try {
      const envPool = pool;
      
      // Simple optimized query without expensive JOINs
      const result = await envPool.query(`
        SELECT p.id, p.name, p.description, p.status, p.location, p.contact_email, 
               p.primary_contact, p.partner_type, p.region, p.assigned_user_ids, 
               p.linked_opportunity_ids, p.created_at, p.updated_at
        FROM degoudse.partners p
        ORDER BY p.id
      `);
      
      // Get relationship counts in separate optimized queries
      const relationshipCounts = await Promise.all([
        envPool.query(`
          SELECT partner_id, COUNT(*) as customer_count 
          FROM degoudse.partner_customers 
          GROUP BY partner_id
        `),
        envPool.query(`
          SELECT partner_id, COUNT(*) as opportunity_count 
          FROM degoudse.partner_opportunities 
          GROUP BY partner_id
        `)
      ]);
      
      const customerCountMap = new Map();
      const opportunityCountMap = new Map();
      
      relationshipCounts[0].rows.forEach((row: any) => {
        customerCountMap.set(row.partner_id, row.customer_count);
      });
      
      relationshipCounts[1].rows.forEach((row: any) => {
        opportunityCountMap.set(row.partner_id, row.opportunity_count);
      });
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        initials: partner.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
        industry: getIndustryFromDescription(partner.description || ''),
        type: getTypeFromDescription(partner.description || ''),
        size: getSizeFromDescription(partner.description || ''),
        status: partner.status,
        customers: customerCountMap.get(partner.id) || 0,
        opportunities: opportunityCountMap.get(partner.id) || 0,
        opportunity_value: 0,
        weighted_opportunity_value: 0,
        location: partner.location,
        contactEmail: partner.contact_email,
        primaryContact: partner.primary_contact,
        partner_type: partner.partner_type,
        region: partner.region,
        assigned_user_ids: partner.assigned_user_ids,
        linked_opportunity_ids: partner.linked_opportunity_ids,
        createdAt: partner.created_at,
        updatedAt: partner.updated_at,
        customerNames: ''
      }));
      
      // Cache the result for fast subsequent requests
      setCache(cacheKey, partners);
      
      console.log(`Returning ${partners.length} partners with relationship counts from degoudse schema`);
      res.json(partners);
    } catch (error) {
      console.error('Error fetching De Goudse partners:', error);
      res.status(500).json({ error: 'Failed to fetch partners' });
    }
  });

  // De Goudse relationship endpoints
  app.get('/api/degoudse/partners/:id/customers', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT c.id, c.name, c.description
        FROM degoudse.customers c
        INNER JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        WHERE pc.partner_id = $1
        ORDER BY c.id
      `, [partnerId]);
      
      const customers = result.rows.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        description: customer.description
      }));
      
      res.json(customers);
    } catch (error) {
      console.error('Error fetching De Goudse partner customers:', error);
      res.status(500).json({ error: 'Failed to fetch partner customers' });
    }
  });

  app.get('/api/degoudse/partners/:id/opportunities', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT o.*, c.name as client_name,
               COUNT(DISTINCT contacts.id) as contact_count
        FROM degoudse.opportunities o
        INNER JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
        LEFT JOIN degoudse.customers c ON o.client_id = c.id
        LEFT JOIN degoudse.contacts contacts ON contacts.linked_entity_id = c.id AND contacts.linked_entity_type = 'customer'
        WHERE po.partner_id = $1
        GROUP BY o.id, o.title, o.description, o.status, o.stage, o."estimatedValue", 
                 o."expectedCloseDate", o."clientId", o."partnerId", o."productId", 
                 o."ownerId", o.probability, o.type, o."createdAt", o."updatedAt", c.name
        ORDER BY o.id
      `, [partnerId]);
      
      const opportunities = result.rows.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        status: opp.status,
        stage: opp.stage,
        estimated_value: opp.estimatedValue,
        clientName: opp.client_name,
        expected_close_date: opp.expectedCloseDate,
        contactCount: parseInt(opp.contact_count) || 0
      }));
      
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching De Goudse partner opportunities:', error);
      res.status(500).json({ error: 'Failed to fetch partner opportunities' });
    }
  });

  app.get('/api/degoudse/customers/:id/partners', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT p.*
        FROM degoudse.partners p
        INNER JOIN degoudse.partner_customers pc ON p.id = pc.partner_id
        WHERE pc.customer_id = $1
        ORDER BY p.id
      `, [customerId]);
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        location: partner.location,
        contact_email: partner.contact_email,
        primary_contact: partner.primary_contact
      }));
      
      res.json(partners);
    } catch (error) {
      console.error('Error fetching De Goudse customer partners:', error);
      res.status(500).json({ error: 'Failed to fetch customer partners' });
    }
  });

  app.get('/api/degoudse/customers/:id/opportunities', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT o.*, p.name as partner_name
        FROM degoudse.opportunities o
        INNER JOIN degoudse.customer_opportunities co ON o.id = co.opportunity_id
        LEFT JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
        LEFT JOIN degoudse.partners p ON p.id = po.partner_id
        WHERE co.customer_id = $1
        ORDER BY o.id
      `, [customerId]);
      
      const opportunities = result.rows.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        status: opp.status,
        stage: opp.stage,
        estimated_value: opp.estimated_value,
        partner_name: opp.partner_name,
        expected_close_date: opp.expected_close_date
      }));
      
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching De Goudse customer opportunities:', error);
      res.status(500).json({ error: 'Failed to fetch customer opportunities' });
    }
  });

  // Get products for a specific customer in De Goudse environment
  app.get('/api/degoudse/customers/:id/products', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT DISTINCT p.*, v.name as vendor_name
        FROM degoudse.products p
        LEFT JOIN degoudse.vendors v ON p.vendor_id = v.id
        INNER JOIN degoudse.opportunity_products op ON p.id = op.product_id
        INNER JOIN degoudse.customer_opportunities co ON op.opportunity_id = co.opportunity_id
        WHERE co.customer_id = $1
        ORDER BY p.id
      `, [customerId]);
      
      const products = result.rows.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        price: product.price,
        vendorName: product.vendor_name,
        status: product.status || 'Active',
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching De Goudse customer products:', error);
      res.status(500).json({ error: 'Failed to fetch customer products' });
    }
  });

  // Get contacts for a specific customer in De Goudse environment
  app.get('/api/degoudse/customers/:id/contacts', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT *
        FROM degoudse.contacts
        WHERE linked_entity_type = 'customer' AND linked_entity_id = $1
        ORDER BY is_primary DESC, full_name ASC
      `, [customerId]);
      
      const contacts = result.rows.map((contact: any) => ({
        id: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        fullName: contact.full_name,
        email: contact.email,
        phone: contact.phone,
        jobTitle: contact.job_title,
        department: contact.department,
        company: contact.company,
        isPrimary: contact.is_primary,
        isActive: contact.is_active,
        notes: contact.notes,
        tags: contact.tags,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }));
      
      res.json(contacts);
    } catch (error) {
      console.error('Error fetching De Goudse customer contacts:', error);
      res.status(500).json({ error: 'Failed to fetch customer contacts' });
    }
  });

  app.get('/api/degoudse/opportunities/:id/products', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT pr.*
        FROM degoudse.products pr
        INNER JOIN degoudse.opportunity_products op ON pr.id = op.product_id
        WHERE op.opportunity_id = $1
        ORDER BY pr.id
      `, [opportunityId]);
      
      const products = result.rows.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price
      }));
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching De Goudse opportunity products:', error);
      res.status(500).json({ error: 'Failed to fetch opportunity products' });
    }
  });

  app.get('/api/degoudse/opportunities/:id/partners', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT p.*
        FROM degoudse.partners p
        INNER JOIN degoudse.partner_opportunities po ON p.id = po.partner_id
        WHERE po.opportunity_id = $1
        ORDER BY p.id
      `, [opportunityId]);
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        location: partner.location,
        contact_email: partner.contact_email,
        primary_contact: partner.primary_contact,
        partner_type: partner.partner_type,
        status: partner.status
      }));
      
      res.json(partners);
    } catch (error) {
      console.error('Error fetching De Goudse opportunity partners:', error);
      res.status(500).json({ error: 'Failed to fetch opportunity partners' });
    }
  });

  app.get('/api/degoudse/opportunities/:id/customers', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT c.*
        FROM degoudse.customers c
        INNER JOIN degoudse.customer_opportunities co ON c.id = co.customer_id
        WHERE co.opportunity_id = $1
        ORDER BY c.id
      `, [opportunityId]);
      
      const customers = result.rows.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        description: customer.description,
        ownerId: customer.ownerId,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      }));
      
      res.json(customers);
    } catch (error) {
      console.error('Error fetching De Goudse opportunity customers:', error);
      res.status(500).json({ error: 'Failed to fetch opportunity customers' });
    }
  });

  // Update opportunity stage
  app.patch('/api/:envId/opportunities/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const opportunityId = parseInt(req.params.id);
      const { stage } = req.body;

      if (!stage) {
        return res.status(400).json({ error: 'Stage is required' });
      }

      const envPool = pool;
      const result = await envPool.query(
        `UPDATE ${envId}.opportunities 
         SET stage = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [stage, opportunityId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      const updatedOpportunity = result.rows[0];
      res.json({
        id: updatedOpportunity.id,
        title: updatedOpportunity.title,
        stage: updatedOpportunity.stage,
        status: updatedOpportunity.status,
        estimatedValue: updatedOpportunity.estimated_value,
        expectedCloseDate: updatedOpportunity.expected_close_date,
        updatedAt: updatedOpportunity.updated_at
      });
    } catch (error) {
      console.error('Error updating opportunity stage:', error);
      res.status(500).json({ error: 'Failed to update opportunity stage' });
    }
  });

  app.get('/api/degoudse/customers', async (req, res) => {
    const cacheKey = 'degoudse_customers';
    // Clear cache to ensure fresh data with opportunity counts
    cache.delete(cacheKey);
    const cached = getCached(cacheKey);
    
    if (cached) {
      console.log(`Returning ${cached.length} customers from cache`);
      return res.json(cached);
    }
    
    // Add caching headers
    res.set('Cache-Control', 'public, max-age=60');
    
    try {
      const envPool = pool;
      // Query with proper counts for accurate statistics
      const result = await envPool.query(`
        SELECT c.id, c.name, c.description, c."ownerId", c."createdAt", c."updatedAt",
               COUNT(DISTINCT pc.partner_id) as partner_count,
               COUNT(DISTINCT co.opportunity_id) as opportunity_count
        FROM degoudse.customers c
        LEFT JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN degoudse.customer_opportunities co ON c.id = co.customer_id
        GROUP BY c.id, c.name, c.description, c."ownerId", c."createdAt", c."updatedAt"
        ORDER BY c.id
        LIMIT 100
      `);
      
      // Get partner details for each customer separately
      const customerIds = result.rows.map(c => c.id);
      const partnerDetails = await envPool.query(`
        SELECT pc.customer_id, p.id as partner_id, p.name as partner_name
        FROM degoudse.partner_customers pc
        JOIN degoudse.partners p ON p.id = pc.partner_id
        WHERE pc.customer_id = ANY($1)
        ORDER BY pc.customer_id, p.name
      `, [customerIds]);
      
      const customers = result.rows.map((customer: any) => {
        const customerPartners = partnerDetails.rows.filter((p: any) => p.customer_id === customer.id);
        const partnerNames = customerPartners.map((p: any) => p.partner_name).join(', ');
        
        return {
          id: customer.id,
          name: customer.name,
          description: customer.description,
          initials: customer.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
          ownerId: customer.ownerId,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
          partnerCount: parseInt(customer.partner_count) || 0,
          opportunityCount: parseInt(customer.opportunity_count) || 0,
          partnerNames: partnerNames
        };
      });
      
      // Cache the result for fast subsequent requests
      setCache(cacheKey, customers);
      
      console.log(`Returning ${customers.length} customers from De Goudse database`);
      res.json(customers);
    } catch (error) {
      console.error('De Goudse customers API error:', error);
      res.status(500).json({ message: 'Failed to fetch customers for De Goudse environment' });
    }
  });

  app.get('/api/degoudse/products', async (req, res) => {
    try {
      const degoudseDb = db;
      const productsList = await degoudseDb.select().from(insuranceProducts);
      console.log(`Returning ${productsList.length} products from De Goudse database`);
      res.json(productsList);
    } catch (error) {
      console.error('De Goudse products API error:', error);
      res.status(500).json({ message: 'Failed to fetch products for De Goudse environment' });
    }
  });

  // WORKING TEST ROUTE
  app.get('/api/degoudse/saved-views-test', async (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      const entityType = req.query.entity_type as string;
      const envPool = pool;
      
      console.log(`TEST ROUTE: entityType='${entityType}'`);
      
      const query = entityType 
        ? `SELECT * FROM degoudse.saved_views WHERE entity_type = $1 ORDER BY created_at DESC`
        : `SELECT * FROM degoudse.saved_views ORDER BY created_at DESC`;
      
      const params = entityType ? [entityType] : [];
      console.log(`TEST: Query: ${query}, Params:`, params);
      const result = await envPool.query(query, params);
      console.log(`TEST: Found ${result.rows.length} rows`);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Test route error:', error);
      res.status(500).json({ error: 'Test failed' });
    }
  });

  app.get('/api/degoudse/saved-views', async (req, res) => {
    const entityType = req.query.entity_type as string;
    
    // Create cache key based on entity type
    const cacheKey = `degoudse_saved_views_${entityType || 'all'}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    try {
      const envPool = pool;
      
      console.log(`FIXED: De Goudse saved views: entityType='${entityType}'`);
      
      // Force entity filtering to work correctly
      const query = entityType 
        ? `SELECT * FROM degoudse.saved_views WHERE entity_type = $1 ORDER BY created_at DESC`
        : `SELECT * FROM degoudse.saved_views ORDER BY created_at DESC`;
      
      const params = entityType ? [entityType] : [];
      console.log(`FIXED: Executing query: ${query} with params:`, params);
      const result = await envPool.query(query, params);
      console.log(`FIXED: Query returned ${result.rows.length} rows`);
      
      setCache(cacheKey, result.rows);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse saved views:', error);
      res.status(500).json({ error: 'Failed to fetch saved views' });
    }
  });

  // Create a new saved view in degoudse
  app.post('/api/degoudse/saved-views', async (req, res) => {
    try {
      const { name, description, entity_type, filters, is_shared } = req.body;
      const envPool = pool;
      const created_by = 1; // Default user ID for now
      
      console.log(`FIXED: Creating saved view in degoudse:`, { name, entity_type, filters });
      
      const result = await envPool.query(`
        INSERT INTO degoudse.saved_views 
        (name, description, entity_type, filters, is_shared, is_default, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `, [name, description || '', entity_type, JSON.stringify(filters || {}), is_shared || false, false, created_by]);
      
      console.log(`FIXED: Created saved view:`, result.rows[0]);
      
      // Clear cache for this entity type by deleting cache entries
      cache.delete(`degoudse_saved_views_${entity_type}`);
      cache.delete(`degoudse_saved_views_all`);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating De Goudse saved view:', error);
      res.status(500).json({ error: 'Failed to create saved view' });
    }
  });

  // Update a saved view in degoudse
  app.put('/api/degoudse/saved-views/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, filters, is_shared } = req.body;
      const envPool = pool;
      
      console.log(`FIXED: Updating saved view ${id} in degoudse:`, { name, filters });
      
      const result = await envPool.query(`
        UPDATE degoudse.saved_views 
        SET name = $1, description = $2, filters = $3, is_shared = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `, [name, description || '', JSON.stringify(filters || {}), is_shared || false, parseInt(id)]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Saved view not found' });
      }
      
      console.log(`FIXED: Updated saved view:`, result.rows[0]);
      
      // Clear cache for this entity type
      cache.delete(`degoudse_saved_views_partners`);
      cache.delete(`degoudse_saved_views_all`);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating De Goudse saved view:', error);
      res.status(500).json({ error: 'Failed to update saved view' });
    }
  });

  // NEW ROUTE: Fixed entity filtering for De Goudse saved lists
  app.get('/api/degoudse/saved-lists-filtered', async (req, res) => {
    const entityType = req.query.entity_type as string;
    
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache'); 
    res.set('Expires', '0');
    
    try {
      const envPool = pool;
      
      if (entityType === 'partners') {
        const result = await envPool.query('SELECT * FROM degoudse.saved_lists WHERE entity_type = $1 ORDER BY created_at DESC', ['partners']);
        return res.json(result.rows);
      } else if (entityType === 'customers') {
        const result = await envPool.query('SELECT * FROM degoudse.saved_lists WHERE entity_type = $1 ORDER BY created_at DESC', ['customers']);
        return res.json(result.rows);
      } else if (entityType === 'opportunities') {
        const result = await envPool.query('SELECT * FROM degoudse.saved_lists WHERE entity_type = $1 ORDER BY created_at DESC', ['opportunities']);
        return res.json(result.rows);
      } else {
        const result = await envPool.query('SELECT * FROM degoudse.saved_lists ORDER BY created_at DESC');
        return res.json(result.rows);
      }
    } catch (error) {
      console.error('De Goudse saved lists filtered error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Original route with fixed filtering logic
  app.get('/api/degoudse/saved-lists', async (req, res) => {
    const entityType = req.query.entity_type as string;
    const partnerId = req.query.partner_id as string;
    
    // Create cache key based on query parameters
    const cacheKey = `degoudse_saved_lists_${entityType || 'all'}_${partnerId || 'none'}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    try {
      const envPool = pool;
      let result;
      
      if (entityType && partnerId) {
        // Filter by entity type and partner context (include both partner-specific lists and general lists)
        result = await envPool.query(
          'SELECT * FROM degoudse.saved_lists WHERE entity_type = $1 AND (partner_id = $2 OR partner_id IS NULL) ORDER BY created_at DESC', 
          [entityType, parseInt(partnerId)]
        );
      } else if (entityType) {
        // Filter by entity type only, exclude partner-specific lists (partner_id IS NULL for general lists)
        result = await envPool.query('SELECT * FROM degoudse.saved_lists WHERE entity_type = $1 AND partner_id IS NULL ORDER BY created_at DESC', [entityType]);
      } else {
        // Return all lists
        result = await envPool.query('SELECT * FROM degoudse.saved_lists ORDER BY created_at DESC');
      }
      
      setCache(cacheKey, result.rows);
      return res.json(result.rows);
    } catch (error) {
      console.error('De Goudse saved lists error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/degoudse/saved-lists', async (req, res) => {
    try {
      const { name, description, entity_type, members, isShared, partner_id, context } = req.body;
      const envPool = pool;
      const created_by = 1; // Default user ID for now
      
      const membersArray = members && Array.isArray(members) ? members : [];
      const type = 'selection'; // Required field based on existing data
      
      const result = await envPool.query(`
        INSERT INTO degoudse.saved_lists 
        (name, description, type, entity_type, members, filters, is_shared, created_by, partner_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `, [name, description || '', type, entity_type, membersArray, JSON.stringify({}), isShared || false, created_by, partner_id || null]);
      
      console.log('Created saved list:', result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating saved list in De Goudse:', error);
      res.status(500).json({ error: 'Failed to create saved list' });
    }
  });

  app.get('/api/degoudse/opportunities', async (req, res) => {
    try {
      const envPool = pool;
      
      // Check if this is a broker request by looking at the referer header
      const referer = req.get('Referer') || '';
      const isBrokerRequest = referer.includes('/broker-view');
      
      let result;
      
      if (isBrokerRequest) {
        // Check for broker-partner mappings only for broker requests
        const brokerMappingResult = await envPool.query(`
          SELECT partner_id FROM degoudse.broker_partner_mappings 
          WHERE broker_user_id = $1 AND environment_id = $2 AND is_active = true
        `, [1, 'degoudse']);
        
        if (brokerMappingResult.rows.length > 0) {
          // This is a broker with restricted access - only show opportunities for their assigned partner
          const assignedPartnerId = brokerMappingResult.rows[0].partner_id;
          console.log(`Broker access detected - filtering opportunities for partner ID ${assignedPartnerId}`);
          
          result = await envPool.query(`
            SELECT o.*, 
                   STRING_AGG(DISTINCT c.name, ', ') as customer_names,
                   STRING_AGG(DISTINCT p.name, ', ') as partner_names,
                   STRING_AGG(DISTINCT pr.name, ', ') as product_names,
                   COUNT(DISTINCT co.customer_id) as customer_count,
                   COUNT(DISTINCT po.partner_id) as partner_count,
                   COUNT(DISTINCT op.product_id) as product_count,
                   COUNT(DISTINCT contacts.id) as contact_count
            FROM degoudse.opportunities o
            INNER JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
            LEFT JOIN degoudse.customer_opportunities co ON o.id = co.opportunity_id
            LEFT JOIN degoudse.customers c ON c.id = co.customer_id
            LEFT JOIN degoudse.partners p ON p.id = po.partner_id
            LEFT JOIN degoudse.opportunity_products op ON o.id = op.opportunity_id
            LEFT JOIN degoudse.products pr ON pr.id = op.product_id
            LEFT JOIN degoudse.contacts contacts ON contacts.linked_entity_id = c.id AND contacts.linked_entity_type = 'customer'
            WHERE po.partner_id = $1
            GROUP BY o.id, o.title, o.description, o.status, o.stage, o."estimatedValue", 
                     o."expectedCloseDate", o."clientId", o."partnerId", o."productId", 
                     o."ownerId", o.probability, o.type, o."createdAt", o."updatedAt"
            ORDER BY o.id
          `, [assignedPartnerId]);
        } else {
          // Broker request but no mapping found - show no opportunities
          result = { rows: [] };
        }
      } else {
        // Regular access - show all opportunities
        result = await envPool.query(`
          SELECT o.*, 
                 STRING_AGG(DISTINCT c.name, ', ') as customer_names,
                 STRING_AGG(DISTINCT p.name, ', ') as partner_names,
                 STRING_AGG(DISTINCT pr.name, ', ') as product_names,
                 COUNT(DISTINCT co.customer_id) as customer_count,
                 COUNT(DISTINCT po.partner_id) as partner_count,
                 COUNT(DISTINCT op.product_id) as product_count,
                 COUNT(DISTINCT contacts.id) as contact_count
          FROM degoudse.opportunities o
          LEFT JOIN degoudse.customer_opportunities co ON o.id = co.opportunity_id
          LEFT JOIN degoudse.customers c ON c.id = co.customer_id
          LEFT JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
          LEFT JOIN degoudse.partners p ON p.id = po.partner_id
          LEFT JOIN degoudse.opportunity_products op ON o.id = op.opportunity_id
          LEFT JOIN degoudse.products pr ON pr.id = op.product_id
          LEFT JOIN degoudse.contacts contacts ON contacts.linked_entity_id = c.id AND contacts.linked_entity_type = 'customer'
          GROUP BY o.id, o.title, o.description, o.status, o.stage, o."estimatedValue", 
                   o."expectedCloseDate", o."clientId", o."partnerId", o."productId", 
                   o."ownerId", o.probability, o.type, o."createdAt", o."updatedAt"
          ORDER BY o.id
        `);
      }
      
      const opportunities = result.rows.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        status: opp.status,
        stage: opp.stage,
        estimatedValue: opp.estimatedValue,
        expectedCloseDate: opp.expectedCloseDate,
        clientId: opp.clientId,
        clientName: opp.customer_names || '',
        customerNames: opp.customer_names || '',
        partnerId: opp.partnerId,
        partnerNames: opp.partner_names || '',
        productId: opp.productId,
        productNames: opp.product_names || '',
        ownerId: opp.ownerId,
        probability: opp.probability,
        type: opp.type,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
        customerCount: parseInt(opp.customer_count) || 0,
        partnerCount: parseInt(opp.partner_count) || 0,
        productCount: parseInt(opp.product_count) || 0,
        contactCount: parseInt(opp.contact_count) || 0
      }));
      
      console.log(`Returning ${opportunities.length} opportunities from De Goudse database`);
      res.json(opportunities);
    } catch (error) {
      console.error('De Goudse opportunities API error:', error);
      res.status(500).json({ message: 'Failed to fetch opportunities for De Goudse environment' });
    }
  });

  // Get single opportunity for De Goudse environment
  app.get('/api/degoudse/opportunities/:id', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT o.*, 
               STRING_AGG(DISTINCT c.name, ', ') as customer_names,
               STRING_AGG(DISTINCT p.name, ', ') as partner_names,
               STRING_AGG(DISTINCT pr.name, ', ') as product_names,
               COUNT(DISTINCT co.customer_id) as customer_count,
               COUNT(DISTINCT po.partner_id) as partner_count,
               COUNT(DISTINCT op.product_id) as product_count
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.customer_opportunities co ON o.id = co.opportunity_id
        LEFT JOIN degoudse.customers c ON c.id = co.customer_id
        LEFT JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
        LEFT JOIN degoudse.partners p ON p.id = po.partner_id
        LEFT JOIN degoudse.opportunity_products op ON o.id = op.opportunity_id
        LEFT JOIN degoudse.products pr ON pr.id = op.product_id
        WHERE o.id = $1
        GROUP BY o.id, o.title, o.description, o.status, o.stage, o."estimatedValue", 
                 o."expectedCloseDate", o."clientId", o."partnerId", o."productId", 
                 o."ownerId", o.probability, o.type, o."createdAt", o."updatedAt"
      `, [opportunityId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }
      
      const opp = result.rows[0];
      const opportunity = {
        id: opp.id,
        title: opp.title,
        description: opp.description,
        status: opp.status,
        stage: opp.stage,
        estimatedValue: opp.estimatedValue,
        expectedCloseDate: opp.expectedCloseDate,
        clientId: opp.clientId,
        clientName: opp.customer_names || '',
        customerNames: opp.customer_names || '',
        partnerId: opp.partnerId,
        partnerNames: opp.partner_names || '',
        productId: opp.productId,
        productNames: opp.product_names || '',
        ownerId: opp.ownerId,
        probability: opp.probability,
        type: opp.type,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
        customerCount: parseInt(opp.customer_count) || 0,
        partnerCount: parseInt(opp.partner_count) || 0,
        productCount: parseInt(opp.product_count) || 0
      };
      
      res.json(opportunity);
    } catch (error) {
      console.error('Error fetching De Goudse opportunity:', error);
      res.status(500).json({ error: 'Failed to fetch opportunity' });
    }
  });

  // De Goudse OKR Metrics endpoints
  app.get('/api/degoudse/okr-metrics', async (req, res) => {
    const cacheKey = 'degoudse_okr_metrics';
    const cached = getCached(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    try {
      const envPool = pool;
      const result = await envPool.query('SELECT * FROM degoudse.okr_metrics ORDER BY id');
      setCache(cacheKey, result.rows);
      res.json(result.rows);
    } catch (error) {
      console.error('De Goudse OKR metrics API error:', error);
      res.status(500).json({ message: 'Failed to fetch OKR metrics for De Goudse environment' });
    }
  });

  // De Goudse OKR Tags endpoints
  app.get('/api/degoudse/okr-tags', async (req, res) => {
    const cacheKey = 'degoudse_okr_tags';
    const cached = getCached(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    try {
      const envPool = pool;
      const result = await envPool.query('SELECT * FROM degoudse.okr_tags ORDER BY name ASC');
      setCache(cacheKey, result.rows);
      res.json(result.rows);
    } catch (error) {
      console.error('De Goudse OKR tags API error:', error);
      res.status(500).json({ message: 'Failed to fetch OKR tags for De Goudse environment' });
    }
  });

  // De Goudse Contacts endpoints
  app.get('/api/degoudse/contacts', async (req, res) => {
    try {
      const envPool = pool;
      const { linkedEntityType, linkedEntityId } = req.query;
      
      let queryConditions = '';
      const queryParams: any[] = [];
      
      if (linkedEntityType) {
        queryConditions = 'WHERE is_active = true AND linked_entity_type = $1';
        queryParams.push(linkedEntityType);
        if (linkedEntityId) {
          queryConditions += ' AND linked_entity_id = $2';
          queryParams.push(parseInt(linkedEntityId as string));
        }
      } else {
        queryConditions = 'WHERE is_active = true';
      }
      
      const result = await envPool.query(`
        SELECT id, first_name, last_name, full_name, email, phone, 
               job_title, department, company, linked_entity_type, 
               linked_entity_id, is_primary, notes, tags, is_active, 
               created_at, updated_at
        FROM degoudse.contacts 
        ${queryConditions}
        ORDER BY first_name ASC, last_name ASC
      `, queryParams);
      
      console.log(`Returning ${result.rows.length} contacts from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse contacts:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  app.post('/api/degoudse/contacts', async (req, res) => {
    try {
      const envPool = pool;
      const { 
        firstName, lastName, email, phone, 
        company, position, department, linkedEntityType, linkedEntityId, 
        notes, isActive 
      } = req.body;
      
      // Create full_name from first and last name
      const fullName = `${firstName} ${lastName}`.trim();
      
      const result = await envPool.query(`
        INSERT INTO degoudse.contacts (
          first_name, last_name, full_name, email, phone, 
          job_title, department, company, linked_entity_type, linked_entity_id,
          is_primary, notes, tags, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
        ) RETURNING id, first_name, last_name, full_name, email, phone, 
                   job_title, department, company, linked_entity_type, 
                   linked_entity_id, is_primary, notes, tags, is_active, 
                   created_at, updated_at
      `, [
        firstName, lastName, fullName, email || null, 
        phone || null, position || null, department || null, company || null,
        linkedEntityType || null, linkedEntityId || null, 
        false, notes || null, [], isActive !== false
      ]);
      
      console.log(`Contact created successfully in De Goudse environment:`, result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating De Goudse contact:', error);
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });

  // De Goudse Vendors endpoints
  app.get('/api/degoudse/vendors', async (req, res) => {
    const cacheKey = 'degoudse_vendors';
    const cached = getCached(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    try {
      const envPool = pool;
      const result = await envPool.query(`
        SELECT id, name, description, initials, contact_name, contact_email, 
               contact_phone, owner_id, created_at, updated_at
        FROM degoudse.vendors 
        ORDER BY name ASC
      `);
      
      const vendors = result.rows.map((vendor: any) => ({
        ...vendor,
        initials: vendor.initials || vendor.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2)
      }));
      
      console.log(`Returning ${vendors.length} vendors from De Goudse database`);
      setCache(cacheKey, vendors);
      res.json(vendors);
    } catch (error) {
      console.error('Error fetching De Goudse vendors:', error);
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });

  app.post('/api/degoudse/vendors', async (req, res) => {
    try {
      const envPool = pool;
      const { 
        name, 
        description, 
        location, 
        contactEmail, 
        primaryContact, 
        partnerType = 'vendor', 
        region, 
        status = 'active', 
        industry = 'Other', 
        size = 'medium' 
      } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
      }

      const initials = name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2);
      
      const result = await envPool.query(`
        INSERT INTO degoudse.vendors (
          name, description, initials, location, contact_email, primary_contact, 
          partner_type, region, status, industry, size, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        ) RETURNING *
      `, [
        name, description, initials, location || null, contactEmail || null, primaryContact || null,
        partnerType, region || null, status, industry, size
      ]);
      
      const vendor = result.rows[0];
      console.log('Vendor created successfully in De Goudse environment:', vendor);
      res.status(201).json(vendor);
    } catch (error) {
      console.error('Error creating De Goudse vendor:', error);
      res.status(500).json({ error: 'Failed to create vendor' });
    }
  });

  app.post('/api/degoudse/okr-metrics', async (req, res) => {
    try {
      const { name, description, realized_value, target_value, measure_unit, frequency, hierarchy, tags } = req.body;
      const envPool = pool;
      
      const tagsArray = Array.isArray(tags) ? tags : [];
      const tagsLiteral = tagsArray.length > 0 ? `ARRAY[${tagsArray.map(tag => `'${tag.replace(/'/g, "''")}'`).join(',')}]::text[]` : 'ARRAY[]::text[]';
      
      console.log('Creating OKR metric in De Goudse environment with data:', {
        name, description, realized_value, target_value, measure_unit, frequency, hierarchy, tags: tagsArray
      });
      
      const result = await envPool.query(`
        INSERT INTO degoudse.okr_metrics (
          name, description, realized_value, target_value, measure_unit,
          frequency, hierarchy, tags, created_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, ${tagsLiteral}, 1
        )
        RETURNING *
      `, [name, description, realized_value || 0, target_value, measure_unit, frequency, hierarchy]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating OKR metric in De Goudse:', error);
      res.status(500).json({ message: 'Failed to create OKR metric for De Goudse environment' });
    }
  });

  app.get('/api/degoudse/okr-tags', async (req, res) => {
    try {
      const envPool = pool;
      const result = await envPool.query('SELECT * FROM degoudse.okr_tags ORDER BY name');
      res.json(result.rows);
    } catch (error) {
      console.error('De Goudse OKR tags API error:', error);
      res.status(500).json({ message: 'Failed to fetch OKR tags for De Goudse environment' });
    }
  });

  app.post('/api/degoudse/okr-tags', async (req, res) => {
    try {
      const { name, color } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(`
        INSERT INTO degoudse.okr_tags (name, color)
        VALUES ($1, $2)
        RETURNING *
      `, [name, color]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating OKR tag in De Goudse:', error);
      res.status(500).json({ message: 'Failed to create OKR tag for De Goudse environment' });
    }
  });

  app.put('/api/degoudse/okr-tags/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, color } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(`
        UPDATE degoudse.okr_tags 
        SET name = $1, color = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [name, color, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'OKR tag not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating OKR tag in De Goudse:', error);
      res.status(500).json({ message: 'Failed to update OKR tag for De Goudse environment' });
    }
  });

  app.delete('/api/degoudse/okr-tags/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envPool = pool;
      
      const result = await envPool.query(`
        DELETE FROM degoudse.okr_tags WHERE id = $1
      `, [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'OKR tag not found' });
      }
      
      res.json({ message: 'OKR tag deleted successfully' });
    } catch (error) {
      console.error('Error deleting OKR tag in De Goudse:', error);
      res.status(500).json({ message: 'Failed to delete OKR tag for De Goudse environment' });
    }
  });

  // Template assignments API endpoints for De Goudse
  app.get('/api/degoudse/template-assignments/:entityType', async (req, res) => {
    const { entityType } = req.params;
    const cacheKey = `degoudse_template_assignments_${entityType}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    try {
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT 
          ta.*,
          tm.name as template_name,
          tm.description as template_description,
          tm.tags
        FROM degoudse.okr_template_assignments ta
        LEFT JOIN degoudse.okr_metrics tm ON ta.template_id = tm.id
        WHERE ta.entity_type = $1
        ORDER BY ta.assigned_at DESC
      `, [entityType]);
      
      setCache(cacheKey, result.rows);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse template assignments:', error);
      res.status(500).json({ error: 'Failed to fetch template assignments' });
    }
  });

  app.post('/api/degoudse/template-assignments', async (req, res) => {
    try {
      const { templateIds, entityType, entityId, assignedBy, notes } = req.body;
      const envPool = pool;
      
      const results = [];
      for (const templateId of templateIds) {
        const result = await envPool.query(`
          INSERT INTO degoudse.okr_template_assignments 
          (template_id, entity_type, entity_id, assigned_by, assigned_at, notes)
          VALUES ($1, $2, $3, $4, NOW(), $5)
          RETURNING *
        `, [templateId, entityType, entityId, assignedBy, notes]);
        
        results.push(result.rows[0]);
      }
      
      res.status(201).json(results);
    } catch (error) {
      console.error('Error creating De Goudse template assignments:', error);
      res.status(500).json({ error: 'Failed to create template assignments' });
    }
  });

  // Add opportunities to existing saved list
  app.post('/api/saved-lists/:id/add-opportunities', async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const { opportunityIds } = req.body;
      
      if (!Array.isArray(opportunityIds) || opportunityIds.length === 0) {
        return res.status(400).json({ error: 'opportunityIds must be a non-empty array' });
      }

      // Use degoudse environment pool directly since lists are in degoudse schema
      const envPool = pool;

      // Get current list to merge opportunities
      const currentListResult = await envPool.query(`
        SELECT members FROM degoudse.saved_lists 
        WHERE id = $1
      `, [listId]);
      
      if (currentListResult.rows.length === 0) {
        return res.status(404).json({ error: 'List not found' });
      }

      const currentMembers = Array.isArray(currentListResult.rows[0].members) ? currentListResult.rows[0].members : [];
      const combinedMembers = currentMembers.concat(opportunityIds);
      const uniqueMembers = combinedMembers.filter((item: any, index: number) => combinedMembers.indexOf(item) === index);

      // Update the list with merged opportunities
      const result = await envPool.query(`
        UPDATE degoudse.saved_lists 
        SET 
          members = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [uniqueMembers, listId]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error adding opportunities to list:', error);
      res.status(500).json({ error: 'Failed to add opportunities to list' });
    }
  });

  // Get existing shared links for a list
  app.get('/api/degoudse/shared-lists/by-list/:listId', async (req, res) => {
    try {
      const { listId } = req.params;
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT share_token, list_name, list_description, message, created_at, expires_at
        FROM degoudse.shared_lists 
        WHERE list_id = $1 AND expires_at > NOW()
        ORDER BY created_at DESC
      `, [listId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching shared links:', error);
      res.status(500).json({ error: 'Failed to fetch shared links' });
    }
  });

  // List sharing API endpoints for De Goudse
  app.post('/api/degoudse/shared-lists', async (req, res) => {
    try {
      const { list_name, list_description, entity_type, data, message, list_id } = req.body;
      const envPool = pool;
      
      // Generate a unique share token
      const shareToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      const result = await envPool.query(`
        INSERT INTO degoudse.shared_lists 
        (share_token, list_name, list_description, entity_type, data, message, list_id, created_by, created_at, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW() + INTERVAL '30 days')
        RETURNING *
      `, [shareToken, list_name, list_description, entity_type, JSON.stringify(data), message, list_id || null, 1]);
      
      res.status(201).json({
        ...result.rows[0],
        share_token: shareToken
      });
    } catch (error) {
      console.error('Error creating shared list:', error);
      res.status(500).json({ error: 'Failed to create shared list' });
    }
  });

  app.get('/api/shared-lists/:shareToken', async (req, res) => {
    try {
      const { shareToken } = req.params;
      const envPool = pool;
      
      // Get shared list info
      const shareResult = await envPool.query(`
        SELECT sl.*, saved_l.name as list_name, saved_l.description as list_description, saved_l.filters
        FROM degoudse.shared_lists sl
        LEFT JOIN degoudse.saved_lists saved_l ON sl.list_id = saved_l.id
        WHERE sl.share_token = $1 AND sl.expires_at > NOW()
      `, [shareToken]);
      
      if (shareResult.rows.length === 0) {
        return res.status(404).json({ error: 'Shared list not found or expired' });
      }
      
      const sharedList = shareResult.rows[0];
      
      // Get the actual list data based on entity type
      let listData = [];
      if (sharedList.entity_type === 'partners') {
        const dataResult = await envPool.query(`
          SELECT p.*, COUNT(DISTINCT c.id) as customers, COUNT(DISTINCT o.id) as opportunities
          FROM degoudse.partners p
          LEFT JOIN degoudse.customers c ON c.partner_id = p.id
          LEFT JOIN degoudse.opportunities o ON o.partner_id = p.id
          GROUP BY p.id
          ORDER BY p.name
        `);
        listData = dataResult.rows;
      } else if (sharedList.entity_type === 'customers') {
        const dataResult = await envPool.query(`
          SELECT c.*, p.name as partner_name
          FROM degoudse.customers c
          LEFT JOIN degoudse.partners p ON c.partner_id = p.id
          ORDER BY c.name
        `);
        listData = dataResult.rows;
      } else if (sharedList.entity_type === 'opportunities') {
        // Use the stored data directly instead of querying the database
        // This ensures we show exactly what was shared
        listData = sharedList.data || [];
      }
      
      res.json({
        ...sharedList,
        data: listData
      });
    } catch (error) {
      console.error('Error fetching shared list:', error);
      res.status(500).json({ error: 'Failed to fetch shared list' });
    }
  });

  // Mapping templates API endpoints for De Goudse
  app.get('/api/degoudse/mapping-templates', async (req, res) => {
    try {
      const envPool = pool;
      const result = await envPool.query(
        `SELECT * FROM degoudse.mapping_templates ORDER BY created_at DESC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching mapping templates:', error);
      res.status(500).json({ error: 'Failed to fetch mapping templates' });
    }
  });

  app.post('/api/degoudse/mapping-templates', async (req, res) => {
    try {
      const { name, description, columnMappings } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(
        `INSERT INTO degoudse.mapping_templates (name, description, column_mappings, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [name, description || '', JSON.stringify(columnMappings)]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error saving mapping template:', error);
      res.status(500).json({ error: 'Failed to save mapping template' });
    }
  });

  // De Goudse upload processing endpoint
  app.post('/api/degoudse/upload-opportunities', async (req, res) => {
    try {
      const { fileName, columnMappings, data, headers } = req.body;
      
      if (!fileName || !columnMappings || !data) {
        return res.status(400).json({ message: 'Missing required upload data' });
      }

      let opportunitiesCreated = 0;
      let entityStats = {
        customers: 0,
        partners: 0,
        vendors: 0,
        products: 0,
        users: 0,
        contacts: 0
      };
      let processingLog = [];
      const createdOpportunities = [];
      
      processingLog.push(`Starting upload of ${data.length} rows from ${fileName}`);
      processingLog.push(`Column mappings: ${columnMappings.length} columns mapped`);

      // Process each row of data
      for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        if (!rowData || rowData.length === 0) continue;

        const opportunityData: any = {
          title: `${fileName} - Row ${i + 1}`,
          status: 'open',
          stage: 'discovery',
          type: 'nieuwe_business',
          probability: 50,
          estimatedValue: 0,
          description: `Opportunity created from ${fileName}`,
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        };

        let customerId = null;
        let partnerId = null;

        // Process column mappings
        for (let j = 0; j < columnMappings.length && j < rowData.length; j++) {
          const mapping = columnMappings[j];
          const cellValue = rowData[j];

          if (!cellValue || mapping.mappingType === 'skip') continue;

          if (mapping.mappingType === 'opportunity_attribute' && mapping.targetField) {
            // Map to opportunity attribute
            if (mapping.targetField === 'probability') {
              opportunityData.probability = parseInt(cellValue) || 50;
            } else if (mapping.targetField === 'estimatedValue') {
              opportunityData.estimatedValue = parseFloat(cellValue) || 0;
            } else if (mapping.targetField === 'title') {
              opportunityData.title = cellValue;
            } else {
              opportunityData[mapping.targetField] = cellValue;
            }
          } else if (mapping.mappingType === 'entity_relationship' && mapping.entityType) {
            // Handle entity relationships
            try {
              const envPool = pool;
              
              if (mapping.entityType === 'customer') {
                const result = await envPool.query(
                  `SELECT * FROM degoudse.customers WHERE LOWER(name) = LOWER($1)`,
                  [cellValue]
                );
                
                let customer = result.rows[0];
                if (!customer) {
                  const insertResult = await envPool.query(
                    `INSERT INTO degoudse.customers (name, description, created_at, updated_at)
                     VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
                    [cellValue, `Customer created from ${fileName}`]
                  );
                  customer = insertResult.rows[0];
                  entityStats.customers++;
                }
                customerId = customer.id;
              
              } else if (mapping.entityType === 'partner') {
                const result = await envPool.query(
                  `SELECT * FROM degoudse.partners WHERE LOWER(name) = LOWER($1)`,
                  [cellValue]
                );
                
                let partner = result.rows[0];
                if (!partner) {
                  const insertResult = await envPool.query(
                    `INSERT INTO degoudse.partners (name, description, created_at, updated_at)
                     VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
                    [cellValue, `Partner created from ${fileName}`]
                  );
                  partner = insertResult.rows[0];
                  entityStats.partners++;
                }
                partnerId = partner.id;
              
              } else if (mapping.entityType === 'vendor') {
                const result = await envPool.query(
                  `SELECT * FROM degoudse.vendors WHERE LOWER(name) = LOWER($1)`,
                  [cellValue]
                );
                
                if (result.rows.length === 0) {
                  await envPool.query(
                    `INSERT INTO degoudse.vendors (name, description, created_at, updated_at)
                     VALUES ($1, $2, NOW(), NOW())`,
                    [cellValue, `Vendor created from ${fileName}`]
                  );
                  entityStats.vendors++;
                }
              
              } else if (mapping.entityType === 'product') {
                const result = await envPool.query(
                  `SELECT * FROM degoudse.insurance_products WHERE LOWER(name) = LOWER($1)`,
                  [cellValue]
                );
                
                if (result.rows.length === 0) {
                  await envPool.query(
                    `INSERT INTO degoudse.insurance_products (name, description, category, created_at, updated_at)
                     VALUES ($1, $2, $3, NOW(), NOW())`,
                    [cellValue, `Product created from ${fileName}`, 'imported']
                  );
                  entityStats.products++;
                }
              
              } else if (mapping.entityType === 'user') {
                // Handle user creation based on mapping target field
                if (mapping.targetField === 'username' || mapping.targetField === 'email') {
                  const result = await envPool.query(
                    `SELECT * FROM degoudse.users WHERE LOWER(${mapping.targetField}) = LOWER($1)`,
                    [cellValue]
                  );
                  
                  if (result.rows.length === 0) {
                    const userData = {
                      username: mapping.targetField === 'username' ? cellValue : `user_${Date.now()}`,
                      email: mapping.targetField === 'email' ? cellValue : null,
                      first_name: mapping.targetField === 'first_name' ? cellValue : '',
                      last_name: mapping.targetField === 'last_name' ? cellValue : '',
                      is_active: true
                    };
                    
                    await envPool.query(
                      `INSERT INTO degoudse.users (username, email, first_name, last_name, is_active, created_at, updated_at)
                       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                      [userData.username, userData.email, userData.first_name, userData.last_name, userData.is_active]
                    );
                    entityStats.users++;
                  }
                }
              
              } else if (mapping.entityType === 'contact') {
                // Handle contact creation
                const contactData = {
                  first_name: mapping.targetField === 'first_name' ? cellValue : '',
                  last_name: mapping.targetField === 'last_name' ? cellValue : '',
                  email: mapping.targetField === 'email' ? cellValue : null,
                  phone: mapping.targetField === 'phone' ? cellValue : null,
                  company: mapping.targetField === 'company' ? cellValue : null,
                  position: mapping.targetField === 'position' ? cellValue : null
                };
                
                // Check for existing contact by email if provided
                if (contactData.email) {
                  const result = await envPool.query(
                    `SELECT * FROM degoudse.contacts WHERE LOWER(email) = LOWER($1)`,
                    [contactData.email]
                  );
                  
                  if (result.rows.length === 0) {
                    await envPool.query(
                      `INSERT INTO degoudse.contacts (first_name, last_name, email, phone, company, position, created_at, updated_at)
                       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                      [contactData.first_name, contactData.last_name, contactData.email, contactData.phone, contactData.company, contactData.position]
                    );
                    entityStats.contacts++;
                  }
                } else {
                  // Create contact without email check
                  await envPool.query(
                    `INSERT INTO degoudse.contacts (first_name, last_name, email, phone, company, position, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                    [contactData.first_name, contactData.last_name, contactData.email, contactData.phone, contactData.company, contactData.position]
                  );
                  entityStats.contacts++;
                }
              }
              
            } catch (error) {
              console.log(`Entity creation skipped for ${mapping.entityType}:`, error.message);
            }
          }
        }

        try {
          // Create the opportunity using direct SQL
          const envPool = pool;
          
          const opportunityResult = await envPool.query(
            `INSERT INTO degoudse.opportunities 
             (title, "clientId", "productId", probability, "estimatedValue", type, status, stage, description, "partnerId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
             RETURNING *`,
            [
              opportunityData.title || `Opportunity from ${fileName} - Row ${i + 1}`,
              customerId || 1,
              1, // Default product ID
              opportunityData.probability || 50,
              opportunityData.estimatedValue || 0,
              opportunityData.type || 'nieuwe_business',
              opportunityData.status || 'open',
              opportunityData.stage || 'discovery',
              opportunityData.description || `Opportunity created from ${fileName}`,
              partnerId || null
            ]
          );
          
          const createdOpportunity = opportunityResult.rows[0];
          
          // Create relationship connections if entities were found/created
          if (partnerId && customerId) {
            // Create partner-customer relationship
            try {
              await envPool.query(
                `INSERT INTO degoudse.partner_customers (partner_id, customer_id, created_at)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (partner_id, customer_id) DO NOTHING`,
                [partnerId, customerId]
              );
            } catch (error) {
              console.log(`Skipped partner-customer relationship: ${error.message}`);
            }
            
            // Create partner-opportunity relationship
            try {
              await envPool.query(
                `INSERT INTO degoudse.partner_opportunities (partner_id, opportunity_id, created_at)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (partner_id, opportunity_id) DO NOTHING`,
                [partnerId, createdOpportunity.id]
              );
            } catch (error) {
              console.log(`Skipped partner-opportunity relationship: ${error.message}`);
            }
          }
          
          if (customerId) {
            // Create customer-opportunity relationship
            try {
              await envPool.query(
                `INSERT INTO degoudse.customer_opportunities (customer_id, opportunity_id, created_at)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (customer_id, opportunity_id) DO NOTHING`,
                [customerId, createdOpportunity.id]
              );
            } catch (error) {
              console.log(`Skipped customer-opportunity relationship: ${error.message}`);
            }
          }
          
          // Create opportunity-product relationship with default product
          try {
            await envPool.query(
              `INSERT INTO degoudse.opportunity_products (opportunity_id, product_id, created_at)
               VALUES ($1, $2, NOW())
               ON CONFLICT (opportunity_id, product_id) DO NOTHING`,
              [createdOpportunity.id, 1]
            );
          } catch (error) {
            console.log(`Skipped opportunity-product relationship: ${error.message}`);
          }
          
          createdOpportunities.push(createdOpportunity);
          opportunitiesCreated++;
        } catch (error) {
          console.log(`Skipped opportunity for row ${i + 1}:`, error.message);
        }
      }

      // Create a saved list entry for this upload
      // This would be stored in a savedLists table in a complete implementation
      
      // Calculate total entities created
      const totalEntitiesCreated = Object.values(entityStats).reduce((a, b) => a + b, 0);
      
      processingLog.push(`\n=== UPLOAD COMPLETE ===`);
      processingLog.push(`✓ ${opportunitiesCreated} opportunities created in De Goudse environment`);
      processingLog.push(`✓ ${totalEntitiesCreated} entities created total:`);
      Object.entries(entityStats).forEach(([type, count]) => {
        if (count > 0) {
          processingLog.push(`  - ${count} ${type}`);
        }
      });

      res.json({
        success: true,
        opportunitiesCreated,
        entityStats,
        totalEntitiesCreated,
        savedListName: fileName.replace(/\.[^/.]+$/, ""),
        processingLog,
        environment: 'degoudse',
        summary: `Successfully processed ${data.length} rows in De Goudse environment. Created ${opportunitiesCreated} opportunities and ${totalEntitiesCreated} entities.`
      });

    } catch (error) {
      console.error('De Goudse upload processing error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process upload for De Goudse environment' 
      });
    }
  });

  // OKR Metrics API endpoints
  
  // Get all OKR metrics
  app.get('/api/okr-metrics', async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT * FROM myqollabi.okr_metrics ORDER BY created_at DESC`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching OKR metrics:', error);
      res.status(500).json({ error: 'Failed to fetch OKR metrics' });
    }
  });

  // Get OKR metric by ID
  app.get('/api/okr-metrics/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await db.execute(sql`SELECT * FROM myqollabi.okr_metrics WHERE id = ${id}`);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'OKR metric not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching OKR metric:', error);
      res.status(500).json({ error: 'Failed to fetch OKR metric' });
    }
  });

  // Create OKR metric
  app.post('/api/okr-metrics', async (req, res) => {
    try {
      const { 
        name, description, realized_value, target_value, measure_unit, 
        currency_type, traffic_light_thresholds, progress_bar_thresholds,
        picklist_options, responsible_user_id, responsible_contact_id,
        timeframe, frequency, attachment_url, due_date, is_muted,
        is_archived, is_shared, hierarchy, tags 
      } = req.body;
      
      console.log('Creating OKR metric with data:', {
        name, description, realized_value, target_value, measure_unit, frequency, hierarchy, tags
      });

      // Use the exact same approach that worked in direct SQL
      const tagsArray = tags && Array.isArray(tags) && tags.length > 0 ? tags : [];
      console.log('Using tags array:', tagsArray);

      // Build the SQL query with proper array handling
      const tagsLiteral = tagsArray.length > 0 
        ? `ARRAY[${tagsArray.map(tag => `'${tag.replace(/'/g, "''")}'`).join(', ')}]`
        : `ARRAY[]::text[]`;

      console.log('Generated tags literal:', tagsLiteral);

      const insertQuery = `
        INSERT INTO myqollabi.okr_metrics (
          name, description, realized_value, target_value, measure_unit,
          frequency, hierarchy, tags, created_by
        )
        VALUES (
          '${name.replace(/'/g, "''")}',
          '${(description || '').replace(/'/g, "''")}',
          '${String(realized_value || 0)}',
          ${target_value ? `'${String(target_value)}'` : 'NULL'},
          '${measure_unit || 'number'}',
          '${frequency || 'none'}',
          '${hierarchy || 'metric'}',
          ${tagsLiteral},
          1
        )
        RETURNING *
      `;

      console.log('Executing query:', insertQuery);
      const result = await db.execute(sql.raw(insertQuery));
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating OKR metric:', error);
      res.status(500).json({ error: 'Failed to create OKR metric' });
    }
  });

  // Update OKR metric
  app.put('/api/okr-metrics/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { 
        name, description, realized_value, target_value, measure_unit,
        currency_type, timeframe, frequency, hierarchy, tags
      } = req.body;
      
      const result = await db.execute(sql`
        UPDATE myqollabi.okr_metrics 
        SET name = ${name}, description = ${description}, realized_value = ${realized_value},
            target_value = ${target_value}, measure_unit = ${measure_unit}, currency_type = ${currency_type},
            timeframe = ${timeframe}, frequency = ${frequency}, hierarchy = ${hierarchy},
            tags = ${tags}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'OKR metric not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating OKR metric:', error);
      res.status(500).json({ error: 'Failed to update OKR metric' });
    }
  });

  // Debug endpoint for testing database connection
  app.get('/api/debug/test-insert', async (req, res) => {
    try {
      console.log('Testing direct database insert...');
      
      const result = await db.execute(sql`
        INSERT INTO myqollabi.okr_metrics (
          name, description, realized_value, target_value, measure_unit,
          frequency, hierarchy, tags, created_by
        )
        VALUES (
          'Test Metric', 
          'Test description', 
          '0', 
          '100', 
          'number',
          'monthly', 
          'metric', 
          '{}', 
          1
        )
        RETURNING *
      `);
      
      console.log('Insert successful:', result.rows[0]);
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Insert failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Debug endpoint to check database structure
  app.get('/api/debug/check-table', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'myqollabi' AND table_name = 'okr_metrics'
        ORDER BY ordinal_position
      `);
      
      res.json({ columns: result.rows });
    } catch (error) {
      console.error('Error checking table:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all OKR metrics
  app.get('/api/okr-metrics', async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT * FROM myqollabi.okr_metrics ORDER BY created_at DESC`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching OKR metrics:', error);
      res.status(500).json({ error: 'Failed to fetch OKR metrics' });
    }
  });

  // OKR Tags API endpoints
  
  // Get all OKR tags
  app.get('/api/okr-tags', async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT * FROM myqollabi.okr_tags ORDER BY name ASC`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching OKR tags:', error);
      res.status(500).json({ error: 'Failed to fetch OKR tags' });
    }
  });

  // Create OKR tag
  app.post('/api/okr-tags', async (req, res) => {
    try {
      const { name, color } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO myqollabi.okr_tags (name, color)
        VALUES (${name}, ${color || '#3B82F6'})
        RETURNING *
      `);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating OKR tag:', error);
      res.status(500).json({ error: 'Failed to create OKR tag' });
    }
  });

  // Update OKR tag
  app.put('/api/okr-tags/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, color } = req.body;
      
      const result = await db.execute(sql`
        UPDATE myqollabi.okr_tags 
        SET name = ${name}, color = ${color}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'OKR tag not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating OKR tag:', error);
      res.status(500).json({ error: 'Failed to update OKR tag' });
    }
  });

  // Delete OKR tag
  app.delete('/api/okr-tags/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const result = await db.execute(sql`
        DELETE FROM myqollabi.okr_tags WHERE id = ${id}
      `);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'OKR tag not found' });
      }
      
      res.json({ message: 'OKR tag deleted successfully' });
    } catch (error) {
      console.error('Error deleting OKR tag:', error);
      res.status(500).json({ error: 'Failed to delete OKR tag' });
    }
  });

  // Batch endpoint for common page data - major performance optimization
  app.get('/api/degoudse/page-data/:pageType', async (req, res) => {
    const { pageType } = req.params;
    const cacheKey = `degoudse_page_data_${pageType}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    try {
      const envPool = pool;
      let result: any = {};
      
      if (pageType === 'partners') {
        // Fetch all partners page data in one optimized query
        const [partners, savedLists, savedViews, okrMetrics, okrTags] = await Promise.all([
          envPool.query(`
            SELECT p.*, 
                   COUNT(DISTINCT pc.customer_id) as customer_count,
                   COUNT(DISTINCT po.opportunity_id) as opportunity_count,
                   STRING_AGG(DISTINCT c.name, ', ') as customer_names
            FROM degoudse.partners p
            LEFT JOIN degoudse.partner_customers pc ON p.id = pc.partner_id
            LEFT JOIN degoudse.partner_opportunities po ON p.id = po.partner_id  
            LEFT JOIN degoudse.customers c ON c.id = pc.customer_id
            GROUP BY p.id, p.name, p.description, p.status, p.location, p.contact_email, 
                     p.primary_contact, p.partner_type, p.region, p.assigned_user_ids, 
                     p.linked_opportunity_ids, p.created_at, p.updated_at
            ORDER BY p.id
          `),
          envPool.query('SELECT * FROM degoudse.saved_lists WHERE entity_type = $1 AND partner_id IS NULL ORDER BY created_at DESC', ['partners']),
          envPool.query('SELECT * FROM degoudse.saved_views WHERE entity_type = $1 ORDER BY created_at DESC', ['partners']),
          envPool.query('SELECT * FROM degoudse.okr_metrics ORDER BY id'),
          envPool.query('SELECT * FROM degoudse.okr_tags ORDER BY name ASC')
        ]);
        
        result = {
          partners: partners.rows.map((partner: any) => ({
            id: partner.id,
            name: partner.name,
            description: partner.description,
            initials: partner.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
            industry: getIndustryFromDescription(partner.description || ''),
            type: getTypeFromDescription(partner.description || ''),
            size: getSizeFromDescription(partner.description || ''),
            status: partner.status,
            customers: partner.customer_count || 0,
            opportunities: partner.opportunity_count || 0,
            location: partner.location,
            contactEmail: partner.contact_email,
            primaryContact: partner.primary_contact,
            partner_type: partner.partner_type,
            region: partner.region,
            assigned_user_ids: partner.assigned_user_ids,
            linked_opportunity_ids: partner.linked_opportunity_ids,
            createdAt: partner.created_at,
            updatedAt: partner.updated_at,
            customerNames: partner.customer_names || ''
          })),
          savedLists: savedLists.rows,
          savedViews: savedViews.rows,
          okrMetrics: okrMetrics.rows,
          okrTags: okrTags.rows
        };
      }
      
      setCache(cacheKey, result);
      res.json(result);
    } catch (error) {
      console.error('Error fetching batch page data:', error);
      res.status(500).json({ error: 'Failed to fetch page data' });
    }
  });

  // Database Administration Endpoints
  // These endpoints should not be environment-specific as they manage all environments

  // Get all available environments - only De Goudse
  app.get('/api/admin/environments', async (req, res) => {
    const cached = getCached('admin_environments');
    if (cached) {
      return res.json(cached);
    }
    
    try {
      // Return only De Goudse environment
      const environments = [{
        id: 'degoudse',
        name: 'De Goudse',
        apiBaseUrl: '/api/degoudse',
        databaseId: 'degoudse_db',
        logo: '/api/static/de-goudse-logo.png'
      }];

      setCache('admin_environments', environments);
      res.json(environments);
    } catch (error) {
      console.error('Error fetching environments:', error);
      res.status(500).json({ error: 'Failed to fetch environments' });
    }
  });

  // Get environment statistics
  app.get('/api/admin/environment-stats', async (req, res) => {
    try {
      // Get environments dynamically from database
      const { pool } = await import('./db');
      const schemasResult = await pool.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'public') 
        ORDER BY schema_name
      `);
      
      const environments = schemasResult.rows.map((row: any) => row.schema_name);
      const stats: Record<string, any> = {};

      for (const envId of environments) {
        const envPool = pool;
        
        // Get table counts for this environment
        const customerCount = await envPool.query(`SELECT COUNT(*) as count FROM ${envId}.customers`);
        const partnerCount = await envPool.query(`SELECT COUNT(*) as count FROM ${envId}.partners`);
        const opportunityCount = await envPool.query(`SELECT COUNT(*) as count FROM ${envId}.opportunities`);
        
        // Products table might not exist in all environments
        let productCount = { rows: [{ count: 0 }] };
        try {
          productCount = await envPool.query(`SELECT COUNT(*) as count FROM ${envId}.products`);
        } catch (error) {
          // Products table doesn't exist, keep count at 0
        }

        stats[envId] = {
          customers: parseInt(customerCount.rows[0].count),
          partners: parseInt(partnerCount.rows[0].count),
          opportunities: parseInt(opportunityCount.rows[0].count),
          products: parseInt(productCount.rows[0].count),
          total: parseInt(customerCount.rows[0].count) + 
                 parseInt(partnerCount.rows[0].count) + 
                 parseInt(opportunityCount.rows[0].count) + 
                 parseInt(productCount.rows[0].count)
        };
      }

      res.json(stats);
    } catch (error) {
      console.error('Error fetching environment stats:', error);
      res.status(500).json({ error: 'Failed to fetch environment statistics' });
    }
  });

  // Clean environment data
  app.post('/api/admin/clean-environment', async (req, res) => {
    try {
      const { envId, entityType } = req.body;
      
      if (!envId) {
        return res.status(400).json({ error: 'Environment ID is required' });
      }

      const envPool = pool;
      const results = [];

      if (!entityType || entityType === 'all' || entityType === 'customers') {
        // Delete relationship records first
        await envPool.query(`DELETE FROM ${envId}.partner_customers`);
        await envPool.query(`DELETE FROM ${envId}.customer_opportunities`);
        await envPool.query(`DELETE FROM ${envId}.customers`);
        results.push('customers');
      }

      if (!entityType || entityType === 'all' || entityType === 'partners') {
        await envPool.query(`DELETE FROM ${envId}.partner_customers`);
        await envPool.query(`DELETE FROM ${envId}.partner_opportunities`);
        await envPool.query(`DELETE FROM ${envId}.partners`);
        results.push('partners');
      }

      if (!entityType || entityType === 'all' || entityType === 'opportunities') {
        await envPool.query(`DELETE FROM ${envId}.customer_opportunities`);
        await envPool.query(`DELETE FROM ${envId}.partner_opportunities`);
        // Delete products relationships if they exist
        try {
          await envPool.query(`DELETE FROM ${envId}.opportunity_products`);
        } catch (error) {
          // Table might not exist
        }
        await envPool.query(`DELETE FROM ${envId}.opportunities`);
        results.push('opportunities');
      }

      if (!entityType || entityType === 'all' || entityType === 'products') {
        try {
          await envPool.query(`DELETE FROM ${envId}.opportunity_products`);
          await envPool.query(`DELETE FROM ${envId}.products`);
          results.push('products');
        } catch (error) {
          // Products table might not exist
        }
      }

      res.json({ 
        message: `Successfully cleaned ${results.join(', ')} from ${envId} environment`,
        cleanedEntities: results
      });
    } catch (error) {
      console.error('Error cleaning environment:', error);
      res.status(500).json({ error: 'Failed to clean environment' });
    }
  });

  // Clone environment
  app.post('/api/admin/clone-environment', async (req, res) => {
    try {
      const { sourceEnvId, targetEnvId, name, description } = req.body;
      
      if (!sourceEnvId || !targetEnvId || !name) {
        return res.status(400).json({ error: 'Source environment, target environment, and name are required' });
      }

      console.log('Clone environment request:', { sourceEnvId, targetEnvId, name, description });

      const sourcePool = pool;
      const targetPool = pool;

      // Create the new schema using a safer approach
      // PostgreSQL doesn't support parameterized schema names, so we need to sanitize manually
      const sanitizedTargetEnvId = targetEnvId.replace(/[^a-zA-Z0-9_]/g, '_');
      console.log('Sanitized target env ID:', sanitizedTargetEnvId);
      
      await targetPool.query(`CREATE SCHEMA IF NOT EXISTS "${sanitizedTargetEnvId}"`);

      // Get all tables from source environment dynamically
      const allTablesResult = await sourcePool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `, [sourceEnvId]);
      
      const tables = allTablesResult.rows.map((row: any) => row.table_name);
      
      for (const table of tables) {
        try {
          // Get table structure from source
          const tableStructure = await sourcePool.query(`
            SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2
            ORDER BY ordinal_position
          `, [sourceEnvId, table]);

          if (tableStructure.rows.length > 0) {
            // Create table in target environment using sanitized ID
            let createTableSQL = `CREATE TABLE IF NOT EXISTS "${sanitizedTargetEnvId}"."${table}" (`;
            
            const columns = tableStructure.rows.map((col: any) => {
              let colDef = `"${col.column_name}" ${col.data_type}`;
              if (col.character_maximum_length) {
                colDef += `(${col.character_maximum_length})`;
              }
              if (col.is_nullable === 'NO') {
                colDef += ' NOT NULL';
              }
              if (col.column_default) {
                colDef += ` DEFAULT ${col.column_default}`;
              }
              return colDef;
            });

            createTableSQL += columns.join(', ') + ')';
            await targetPool.query(createTableSQL);
          }
        } catch (error) {
          console.log(`Table ${table} might not exist in source environment:`, error);
        }
      }

      // Copy indexes and constraints would go here in a production system

      res.json({ 
        message: `Successfully cloned ${sourceEnvId} to ${sanitizedTargetEnvId}`,
        targetEnvironment: {
          id: sanitizedTargetEnvId,
          name,
          description
        }
      });
    } catch (error) {
      console.error('Error cloning environment:', error);
      res.status(500).json({ error: 'Failed to clone environment' });
    }
  });

  // Populate data with AI (requires OpenAI API key)
  app.post('/api/admin/populate-data', async (req, res) => {
    try {
      const { envId, entityType, prompt } = req.body;
      
      if (!envId || !entityType || !prompt) {
        return res.status(400).json({ error: 'Environment ID, entity type, and prompt are required' });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          error: 'OpenAI API key is required for data generation. Please provide OPENAI_API_KEY in environment variables.' 
        });
      }

      const envPool = pool;
      
      // Import OpenAI dynamically to avoid build issues if not available
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Generate data based on entity type and prompt
      let systemPrompt = '';
      let responseFormat = '';

      switch (entityType) {
        case 'customers':
          systemPrompt = `Generate customer data based on the user's prompt. Return a JSON object with a "data" array containing customer objects with fields: name, description, location, contact_email, primary_contact. Each object should be realistic and match the prompt requirements.`;
          responseFormat = '{"data": [{"name": "Company Name", "description": "Brief description", "location": "City, Country", "contact_email": "email@company.com", "primary_contact": "Contact Person"}]}';
          break;
        case 'partners':
          systemPrompt = `Generate partner organization data based on the user's prompt. Return a JSON object with a "data" array containing partner objects with fields: name, description, partner_type, location, contact_email, primary_contact, status. Each object should be realistic and match the prompt requirements.`;
          responseFormat = '{"data": [{"name": "Partner Name", "description": "Brief description", "partner_type": "Insurance", "location": "City, Country", "contact_email": "email@partner.com", "primary_contact": "Contact Person", "status": "Active"}]}';
          break;
        case 'opportunities':
          systemPrompt = `Generate sales opportunity data based on the user's prompt. Return a JSON object with a "data" array containing opportunity objects with fields: title, description, type, stage, estimated_value, expected_close_date. Each object should be realistic and match the prompt requirements.`;
          responseFormat = '{"data": [{"title": "Opportunity Title", "description": "Opportunity description", "type": "Insurance", "stage": "Prospecting", "estimated_value": 50000, "expected_close_date": "2024-12-31"}]}';
          break;
        case 'products':
          systemPrompt = `Generate product data based on the user's prompt. Return a JSON object with a "data" array containing product objects with fields: name, description, type, category, price, status. Each object should be realistic and match the prompt requirements.`;
          responseFormat = '{"data": [{"name": "Product Name", "description": "Product description", "type": "Insurance", "category": "Life Insurance", "price": 299.99, "status": "Active"}]}';
          break;
        default:
          return res.status(400).json({ error: 'Invalid entity type' });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `${systemPrompt} Return only valid JSON in this format: ${responseFormat}. Make sure all data is realistic and appropriate for business use.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"data": []}');
      
      if (!response.data || !Array.isArray(response.data)) {
        return res.status(400).json({ error: 'Generated data is not in the expected format. Expected JSON object with "data" array.' });
      }
      
      const generatedData = response.data;

      // Insert generated data into database
      const insertedRecords = [];
      
      for (const record of generatedData) {
        try {
          let insertQuery = '';
          let values: any[] = [];

          switch (entityType) {
            case 'customers':
              insertQuery = `
                INSERT INTO ${envId}.customers (name, description, location, contact_email, primary_contact, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *
              `;
              values = [record.name, record.description, record.location, record.contact_email, record.primary_contact];
              break;
            case 'partners':
              insertQuery = `
                INSERT INTO ${envId}.partners (name, description, partner_type, location, contact_email, primary_contact, status, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *
              `;
              values = [record.name, record.description, record.partner_type, record.location, record.contact_email, record.primary_contact, record.status || 'Active'];
              break;
            case 'opportunities':
              insertQuery = `
                INSERT INTO ${envId}.opportunities (title, description, type, stage, estimated_value, expected_close_date, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *
              `;
              values = [record.title, record.description, record.type, record.stage, record.estimated_value, record.expected_close_date];
              break;
            case 'products':
              // Create products table if it doesn't exist
              try {
                await envPool.query(`
                  CREATE TABLE IF NOT EXISTS ${envId}.products (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    type VARCHAR(100),
                    category VARCHAR(100),
                    price DECIMAL(10,2),
                    status VARCHAR(50) DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                  )
                `);
              } catch (error) {
                // Table might already exist
              }
              
              insertQuery = `
                INSERT INTO ${envId}.products (name, description, type, category, price, status, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *
              `;
              values = [record.name, record.description, record.type, record.category, record.price, record.status || 'Active'];
              break;
          }

          const result = await envPool.query(insertQuery, values);
          insertedRecords.push(result.rows[0]);
        } catch (error) {
          console.error(`Error inserting ${entityType} record:`, error);
        }
      }

      res.json({
        message: `Successfully generated and inserted ${insertedRecords.length} ${entityType} records`,
        insertedCount: insertedRecords.length,
        records: insertedRecords
      });
    } catch (error) {
      console.error('Error populating data:', error);
      res.status(500).json({ error: 'Failed to populate data' });
    }
  });

  // Archive environment (marks as inactive in metadata)
  app.post('/api/admin/archive-environment', async (req, res) => {
    try {
      const { envId } = req.body;
      
      if (!envId) {
        return res.status(400).json({ error: 'Environment ID is required' });
      }

      if (envId === 'myqollabi' || envId === 'degoudse') {
        return res.status(400).json({ error: 'Cannot archive protected environments' });
      }

      // Create or update environment metadata table to track archived status
      const envPool = pool;
      
      await envPool.query(`
        CREATE TABLE IF NOT EXISTS ${envId}.environment_metadata (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Mark environment as archived
      await envPool.query(`
        INSERT INTO ${envId}.environment_metadata (key, value, updated_at)
        VALUES ('archived', 'true', NOW())
        ON CONFLICT (key) 
        DO UPDATE SET value = 'true', updated_at = NOW()
      `);

      res.json({ 
        message: `Environment ${envId} has been archived successfully`,
        envId,
        archived: true
      });
    } catch (error) {
      console.error('Error archiving environment:', error);
      res.status(500).json({ error: 'Failed to archive environment' });
    }
  });

  // Delete environment (permanently removes schema and all data)
  app.delete('/api/admin/delete-environment', async (req, res) => {
    try {
      const { envId } = req.body;
      
      if (!envId) {
        return res.status(400).json({ error: 'Environment ID is required' });
      }

      if (envId === 'myqollabi' || envId === 'degoudse') {
        return res.status(400).json({ error: 'Cannot delete protected environments' });
      }

      // Get environment pool
      const envPool = pool;
      
      // Drop the entire schema and all its contents (properly quoted)
      await envPool.query(`DROP SCHEMA IF EXISTS "${envId}" CASCADE`);

      res.json({ 
        message: `Environment ${envId} has been permanently deleted`,
        envId,
        deleted: true
      });
    } catch (error) {
      console.error('Error deleting environment:', error);
      res.status(500).json({ error: 'Failed to delete environment' });
    }
  });

  // OKR Comments API endpoints
  
  // Get comments for a metric
  app.get('/api/okr-metrics/:id/comments', async (req, res) => {
    try {
      const metricId = parseInt(req.params.id);
      
      const result = await db.execute(sql`
        SELECT c.*, u.username as user_name
        FROM myqollabi.okr_comments c
        LEFT JOIN myqollabi.users u ON c.user_id = u.id
        WHERE c.metric_id = ${metricId}
        ORDER BY c.created_at DESC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching OKR comments:', error);
      res.status(500).json({ error: 'Failed to fetch OKR comments' });
    }
  });

  // Create comment for a metric
  app.post('/api/okr-metrics/:id/comments', async (req, res) => {
    try {
      const metricId = parseInt(req.params.id);
      const { comment, user_id, contact_id } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO myqollabi.okr_comments (metric_id, user_id, contact_id, comment)
        VALUES (${metricId}, ${user_id || 1}, ${contact_id}, ${comment})
        RETURNING *
      `);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating OKR comment:', error);
      res.status(500).json({ error: 'Failed to create OKR comment' });
    }
  });

  // OKR Template Assignments API endpoints
  
  // Get template assignments for an entity
  app.get('/api/template-assignments/:entityType/:entityId', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      
      const result = await db.execute(sql`
        SELECT 
          ta.*,
          tm.name as template_name,
          tm.description as template_description,
          tm.tags,
          u1.name as assigned_by_name,
          u2.name as responsible_user_name
        FROM myqollabi.okr_template_assignments ta
        LEFT JOIN myqollabi.okr_metrics tm ON ta.template_id = tm.id
        LEFT JOIN myqollabi.users u1 ON ta.assigned_by = u1.id
        LEFT JOIN myqollabi.users u2 ON ta.responsible_user_id = u2.id
        WHERE ta.entity_type = ${entityType} AND ta.entity_id = ${parseInt(entityId)}
        ORDER BY ta.assigned_at DESC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching template assignments:', error);
      res.status(500).json({ error: 'Failed to fetch template assignments' });
    }
  });

  // Assign templates to entities
  app.post('/api/template-assignments', async (req, res) => {
    try {
      const { templateIds, entityType, entityId, assignedBy, responsibleUserId, notes } = req.body;
      
      if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
        return res.status(400).json({ error: 'Template IDs are required' });
      }
      
      const assignments = [];
      
      for (const templateId of templateIds) {
        const result = await db.execute(sql`
          INSERT INTO myqollabi.okr_template_assignments 
          (template_id, entity_type, entity_id, assigned_by, responsible_user_id, notes)
          VALUES (${templateId}, ${entityType}, ${parseInt(entityId)}, ${assignedBy || 1}, ${responsibleUserId || null}, ${notes || ''})
          RETURNING *
        `);
        assignments.push(result.rows[0]);
      }
      
      res.status(201).json(assignments);
    } catch (error) {
      console.error('Error creating template assignments:', error);
      res.status(500).json({ error: 'Failed to create template assignments' });
    }
  });

  // Update template assignment status
  app.put('/api/template-assignments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes, responsibleUserId, dueDate } = req.body;
      
      const result = await db.execute(sql`
        UPDATE myqollabi.okr_template_assignments 
        SET 
          status = ${status || 'active'},
          notes = ${notes || ''},
          responsible_user_id = ${responsibleUserId || null},
          due_date = ${dueDate || null}
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Template assignment not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating template assignment:', error);
      res.status(500).json({ error: 'Failed to update template assignment' });
    }
  });

  // Remove template assignment
  app.delete('/api/template-assignments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const result = await db.execute(sql`
        DELETE FROM myqollabi.okr_template_assignments 
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Template assignment not found' });
      }
      
      res.json({ message: 'Template assignment removed successfully' });
    } catch (error) {
      console.error('Error deleting template assignment:', error);
      res.status(500).json({ error: 'Failed to delete template assignment' });
    }
  });

  // Saved Lists API endpoints
  app.get('/api/saved-lists', async (req, res) => {
    try {
      const entityType = req.query.entity_type as string;
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      // Disable caching for this response
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const envPool = pool;
      
      if (entityType && entityType.trim()) {
        const result = await envPool.query(
          `SELECT * FROM ${envId}.saved_lists WHERE entity_type = $1 ORDER BY created_at DESC`,
          [entityType]
        );
        res.json(result.rows);
      } else {
        const result = await envPool.query(
          `SELECT * FROM ${envId}.saved_lists ORDER BY created_at DESC`
        );
        res.json(result.rows);
      }
    } catch (error) {
      console.error('[GENERAL ROUTE] Error:', error);
      res.status(500).json({ error: 'Failed to fetch saved lists' });
    }
  });

  // REMOVED: Shadow endpoint causing conflicts with environment-specific endpoints
  // Use /api/degoudse/saved-lists instead

  app.put('/api/saved-lists/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, members, filters, is_shared } = req.body;
      const envId = req.headers['x-environment-id'] || req.headers['x-environment'] || 'myqollabi';
      
      console.log('PUT /api/saved-lists/:id - Request data:', {
        id,
        envId,
        requestBody: { name, description, members, filters, is_shared }
      });
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const result = await db.execute(sql`
        UPDATE ${sql.identifier(envId as string)}.saved_lists 
        SET 
          name = ${name},
          description = ${description || ''},
          members = ${JSON.stringify(members || [])},
          filters = ${JSON.stringify(filters || {})},
          is_shared = ${is_shared || false},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      
      console.log('PUT /api/saved-lists/:id - Update result:', result.rows);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Saved list not found' });
      }
      
      const updatedList = result.rows[0];
      console.log('PUT /api/saved-lists/:id - Sending response:', updatedList);
      
      res.json(updatedList);
    } catch (error) {
      console.error('Error updating saved list:', error);
      res.status(500).json({ error: 'Failed to update saved list', details: error.message });
    }
  });

  // Environment-specific PUT endpoint for saved lists
  app.put('/api/:envId/saved-lists/:id', async (req, res) => {
    try {
      const { envId } = req.params;
      const id = parseInt(req.params.id);
      const { name, description, members, filters, is_shared } = req.body;
      
      console.log(`PUT /api/${envId}/saved-lists/${id} - Request data:`, {
        envId,
        id,
        requestBody: { name, description, members, filters, is_shared }
      });
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const envPool = pool;
      
      const result = await envPool.query(
        `UPDATE ${envId}.saved_lists 
         SET 
           name = $1,
           description = $2,
           members = $3,
           filters = $4,
           is_shared = $5,
           updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [name, description || '', members || [], JSON.stringify(filters || {}), is_shared || false, id]
      );
      
      console.log(`PUT /api/${envId}/saved-lists/${id} - Update result:`, result.rows);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Saved list not found' });
      }
      
      const updatedList = result.rows[0];
      console.log(`PUT /api/${envId}/saved-lists/${id} - Sending response:`, updatedList);
      
      res.json(updatedList);
    } catch (error) {
      console.error(`Error updating saved list in ${req.params.envId}:`, error);
      res.status(500).json({ error: 'Failed to update saved list', details: error.message });
    }
  });

  app.delete('/api/saved-lists/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      const result = await db.execute(sql`
        DELETE FROM ${sql.identifier(envId as string)}.saved_lists 
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Saved list not found' });
      }
      
      res.json({ message: 'Saved list deleted successfully' });
    } catch (error) {
      console.error('Error deleting saved list:', error);
      res.status(500).json({ error: 'Failed to delete saved list' });
    }
  });

  // Helper function to sync is_shared flag based on collaborators
  async function syncListSharedFlag(listId: number, envId: string) {
    try {
      const envPool = pool;
      
      // Check if list has any active collaborators
      const collaboratorResult = await envPool.query(
        `SELECT COUNT(*) as collaborator_count 
         FROM ${envId}.list_collaborators 
         WHERE list_id = $1 AND is_active = true`,
        [listId]
      );
      
      const hasCollaborators = parseInt(collaboratorResult.rows[0].collaborator_count) > 0;
      
      // Update is_shared flag to match collaborator presence
      await envPool.query(
        `UPDATE ${envId}.saved_lists 
         SET is_shared = $1, updated_at = NOW()
         WHERE id = $2`,
        [hasCollaborators, listId]
      );
      
      console.log(`Synced is_shared flag for list ${listId}: ${hasCollaborators}`);
      return hasCollaborators;
    } catch (error) {
      console.error('Error syncing list shared flag:', error);
      return false;
    }
  }

  // List Collaborators API endpoints
  app.get('/api/:envId/saved-lists/:listId/collaborators', async (req, res) => {
    try {
      const { envId, listId } = req.params;
      const envPool = pool;
      
      const result = await envPool.query(
        `SELECT lc.*, u.name as user_name, u.email as user_email 
         FROM ${envId}.list_collaborators lc
         LEFT JOIN ${envId}.users u ON lc.user_id = u.id
         WHERE lc.list_id = $1 AND lc.is_active = true
         ORDER BY lc.invited_at ASC`,
        [parseInt(listId)]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching list collaborators:', error);
      res.status(500).json({ error: 'Failed to fetch collaborators' });
    }
  });

  app.post('/api/:envId/saved-lists/:listId/collaborators', async (req, res) => {
    try {
      const { envId, listId } = req.params;
      const { email, name, accessLevel, message } = req.body;
      const envPool = pool;
      
      // Insert new collaborator
      const result = await envPool.query(
        `INSERT INTO ${envId}.list_collaborators 
         (list_id, email, name, access_level, invited_by_id, invited_at, is_active)
         VALUES ($1, $2, $3, $4, $5, NOW(), true)
         RETURNING *`,
        [parseInt(listId), email, name, accessLevel || 'viewer', 1]
      );
      
      // Sync the is_shared flag
      await syncListSharedFlag(parseInt(listId), envId);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      res.status(500).json({ error: 'Failed to add collaborator' });
    }
  });

  app.patch('/api/:envId/saved-lists/:listId/collaborators/:collaboratorId', async (req, res) => {
    try {
      const { envId, listId, collaboratorId } = req.params;
      const { accessLevel } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(
        `UPDATE ${envId}.list_collaborators 
         SET access_level = $1
         WHERE id = $2 AND list_id = $3 AND is_active = true
         RETURNING *`,
        [accessLevel, parseInt(collaboratorId), parseInt(listId)]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Collaborator not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating collaborator access:', error);
      res.status(500).json({ error: 'Failed to update collaborator access' });
    }
  });

  app.delete('/api/:envId/saved-lists/:listId/collaborators/:collaboratorId', async (req, res) => {
    try {
      const { envId, listId, collaboratorId } = req.params;
      const envPool = pool;
      
      // Mark collaborator as inactive instead of deleting
      const result = await envPool.query(
        `UPDATE ${envId}.list_collaborators 
         SET is_active = false
         WHERE id = $1 AND list_id = $2
         RETURNING *`,
        [parseInt(collaboratorId), parseInt(listId)]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Collaborator not found' });
      }
      
      // Sync the is_shared flag after removal
      await syncListSharedFlag(parseInt(listId), envId);
      
      res.json({ message: 'Collaborator removed successfully' });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      res.status(500).json({ error: 'Failed to remove collaborator' });
    }
  });

  // Enhanced saved lists endpoint that includes collaborator data and syncs is_shared flag
  app.get('/api/:envId/saved-lists', async (req, res) => {
    try {
      const { envId } = req.params;
      const entityType = req.query.entity_type as string;
      const partnerId = req.query.partner_id as string;
      const envPool = pool;
      
      // Disable caching for this response
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      let query = `
        SELECT sl.*, 
               COUNT(lc.id) as collaborator_count,
               CASE WHEN COUNT(lc.id) > 0 THEN true ELSE false END as has_collaborators
        FROM ${envId}.saved_lists sl
        LEFT JOIN ${envId}.list_collaborators lc ON sl.id = lc.list_id AND lc.is_active = true
      `;
      const params = [];
      const conditions = [];
      
      if (entityType) {
        conditions.push(`sl.entity_type = $${params.length + 1}`);
        params.push(entityType);
      }
      
      if (partnerId) {
        conditions.push(`sl.partner_id = $${params.length + 1}`);
        params.push(parseInt(partnerId));
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ` GROUP BY sl.id ORDER BY sl.created_at DESC`;
      
      const result = await envPool.query(query, params);
      
      // Sync is_shared flags for all lists that have mismatched states
      for (const list of result.rows) {
        const shouldBeShared = list.collaborator_count > 0;
        if (list.is_shared !== shouldBeShared) {
          console.log(`Syncing list ${list.id}: is_shared ${list.is_shared} -> ${shouldBeShared}`);
          await syncListSharedFlag(list.id, envId);
          list.is_shared = shouldBeShared; // Update the response data
        }
      }
      
      res.json(result.rows);
    } catch (error) {
      console.error(`Error fetching saved lists from ${req.params.envId}:`, error);
      res.status(500).json({ error: 'Failed to fetch saved lists' });
    }
  });

  // Saved Views API endpoints
  app.get('/api/saved-views', async (req, res) => {
    try {
      const entityType = req.query.entity_type as string;
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const envPool = pool;
      
      console.log(`Saved views API: entityType=${entityType}, envId=${envId}`);
      
      let query = `SELECT * FROM ${envId}.saved_views`;
      const params = [];
      
      if (entityType) {
        query += ` WHERE entity_type = $1`;
        params.push(entityType);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      console.log(`Executing query: ${query} with params:`, params);
      const result = await envPool.query(query, params);
      console.log(`Query returned ${result.rows.length} rows`);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching saved views:', error);
      res.status(500).json({ error: 'Failed to fetch saved views' });
    }
  });

  // REMOVED: Shadow endpoint causing conflicts with environment-specific endpoints
  // Use /api/degoudse/saved-views instead

  app.put('/api/saved-views/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, filters, is_shared } = req.body;
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      const result = await db.execute(sql`
        UPDATE ${sql.identifier(envId as string)}.saved_views 
        SET 
          name = ${name},
          description = ${description},
          filters = ${JSON.stringify(filters || {})},
          is_shared = ${is_shared || false},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Saved view not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating saved view:', error);
      res.status(500).json({ error: 'Failed to update saved view' });
    }
  });

  app.delete('/api/saved-views/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      const result = await db.execute(sql`
        DELETE FROM ${sql.identifier(envId as string)}.saved_views 
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Saved view not found' });
      }
      
      res.json({ message: 'Saved view deleted successfully' });
    } catch (error) {
      console.error('Error deleting saved view:', error);
      res.status(500).json({ error: 'Failed to delete saved view' });
    }
  });

  // User Management API endpoints
  app.get('/api/users', async (req, res) => {
    try {
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      const result = await db.execute(sql`
        SELECT id, username, email, full_name, first_name, last_name, 
               avatar_initials, role, department, 
               is_active, last_login_at, created_at, updated_at
        FROM ${sql.identifier(envId as string)}.users 
        WHERE is_active = true
        ORDER BY full_name ASC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      const result = await db.execute(sql`
        SELECT id, username, email, full_name, first_name, last_name, 
               avatar_initials, role, department, job_title, phone, 
               is_active, last_login_at, created_at, updated_at
        FROM ${sql.identifier(envId as string)}.users 
        WHERE id = ${id}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const { 
        username, email, password, fullName, firstName, lastName, 
        avatarInitials, role, department, jobTitle, phone, isActive 
      } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO ${sql.identifier(envId as string)}.users (
          username, email, password, full_name, first_name, last_name,
          avatar_initials, role, department, is_active,
          created_at, updated_at
        ) VALUES (
          ${username}, ${email}, ${password}, ${fullName}, ${firstName || null}, 
          ${lastName || null}, ${avatarInitials}, ${role || 'user'}, 
          ${department || null}, ${isActive !== false}, NOW(), NOW()
        ) RETURNING id, username, email, full_name, first_name, last_name, 
                   avatar_initials, role, department, 
                   is_active, created_at, updated_at
      `);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const { 
        username, email, fullName, firstName, lastName, avatarInitials, 
        role, department, jobTitle, phone, isActive 
      } = req.body;
      
      const result = await db.execute(sql`
        UPDATE ${sql.identifier(envId as string)}.users 
        SET 
          username = ${username},
          email = ${email},
          full_name = ${fullName},
          first_name = ${firstName || null},
          last_name = ${lastName || null},
          avatar_initials = ${avatarInitials},
          role = ${role},
          department = ${department || null},
          job_title = ${jobTitle || null},
          phone = ${phone || null},
          is_active = ${isActive !== false},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, username, email, full_name, first_name, last_name, 
                 avatar_initials, role, department, job_title, phone, 
                 is_active, created_at, updated_at
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      // Soft delete - set is_active to false
      const result = await db.execute(sql`
        UPDATE ${sql.identifier(envId as string)}.users 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  });



  app.get('/api/contacts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      const result = await db.execute(sql`
        SELECT id, first_name, last_name, email, phone, 
               company, position, linked_entity_type, 
               linked_entity_id, notes, is_active, 
               created_at, updated_at
        FROM ${sql.identifier(envId as string)}.contacts 
        WHERE id = ${id}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.status(500).json({ error: 'Failed to fetch contact' });
    }
  });

  app.post('/api/contacts', async (req, res) => {
    try {
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const { 
        firstName, lastName, email, phone, 
        company, position, linkedEntityType, linkedEntityId, 
        notes, isActive, department 
      } = req.body;
      
      // Create full_name from first and last name
      const fullName = `${firstName} ${lastName}`.trim();
      
      const result = await db.execute(sql`
        INSERT INTO ${sql.identifier(envId as string)}.contacts (
          first_name, last_name, full_name, email, phone, 
          job_title, department, company, linked_entity_type, linked_entity_id,
          is_primary, notes, tags, is_active, created_at, updated_at
        ) VALUES (
          ${firstName}, ${lastName}, ${fullName}, ${email || null}, 
          ${phone || null}, ${position || null}, ${department || null}, ${company || null},
          ${linkedEntityType || null}, ${linkedEntityId || null}, 
          ${false}, ${notes || null}, ${[]}, ${isActive !== false}, NOW(), NOW()
        ) RETURNING id, first_name, last_name, full_name, email, phone, 
                   job_title, department, company, linked_entity_type, 
                   linked_entity_id, is_primary, notes, tags, is_active, 
                   created_at, updated_at
      `);
      
      console.log(`Contact created successfully in ${envId} environment:`, result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });

  app.put('/api/contacts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const { 
        firstName, lastName, fullName, email, phone, jobTitle, 
        department, company, linkedEntityType, linkedEntityId, 
        isPrimary, notes, tags, isActive 
      } = req.body;
      
      const result = await db.execute(sql`
        UPDATE ${sql.identifier(envId as string)}.contacts 
        SET 
          first_name = ${firstName},
          last_name = ${lastName},
          full_name = ${fullName},
          email = ${email || null},
          phone = ${phone || null},
          job_title = ${jobTitle || null},
          department = ${department || null},
          company = ${company || null},
          linked_entity_type = ${linkedEntityType || null},
          linked_entity_id = ${linkedEntityId || null},
          is_primary = ${isPrimary || false},
          notes = ${notes || null},
          tags = ${tags ? `{${tags.join(',')}}` : '{}'},
          is_active = ${isActive !== false},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, first_name, last_name, full_name, email, phone, 
                 job_title, department, company, linked_entity_type, 
                 linked_entity_id, is_primary, notes, tags, is_active, 
                 created_at, updated_at
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({ error: 'Failed to update contact' });
    }
  });

  app.delete('/api/contacts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      // Soft delete - set is_active to false
      const result = await db.execute(sql`
        UPDATE ${sql.identifier(envId as string)}.contacts 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.json({ message: 'Contact deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating contact:', error);
      res.status(500).json({ error: 'Failed to deactivate contact' });
    }
  });

  // Link contacts to entities
  app.post('/api/contacts/:id/link', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const { linkedEntityType, linkedEntityId, isPrimary } = req.body;
      
      const result = await db.execute(sql`
        UPDATE ${sql.identifier(envId as string)}.contacts 
        SET 
          linked_entity_type = ${linkedEntityType},
          linked_entity_id = ${linkedEntityId},
          is_primary = ${isPrimary || false},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, first_name, last_name, full_name, linked_entity_type, 
                 linked_entity_id, is_primary
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error linking contact:', error);
      res.status(500).json({ error: 'Failed to link contact' });
    }
  });

  // Get contacts for specific entity
  app.get('/api/entities/:entityType/:entityId/contacts', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      const result = await db.execute(sql`
        SELECT id, first_name, last_name, full_name, email, phone, 
               job_title, department, company, is_primary, notes, tags, 
               created_at, updated_at
        FROM ${sql.identifier(envId as string)}.contacts 
        WHERE linked_entity_type = ${entityType} 
          AND linked_entity_id = ${parseInt(entityId)} 
          AND is_active = true
        ORDER BY is_primary DESC, full_name ASC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching entity contacts:', error);
      res.status(500).json({ error: 'Failed to fetch entity contacts' });
    }
  });

  // Entity Logos API Endpoints
  
  // Save entity logo
  app.post('/api/entity-logos', async (req, res) => {
    try {
      const logoData = insertEntityLogoSchema.parse(req.body);
      const envId = logoData.environmentId || 'degoudse';
      
      // Use environment-specific pool for logo operations
      const envPool = pool;
      
      // Check if logo already exists for this entity
      const existingResult = await envPool.query(`
        SELECT * FROM ${envId}.entity_logos 
        WHERE entity_type = $1 AND entity_id = $2 AND environment_id = $3
        LIMIT 1
      `, [logoData.entityType, logoData.entityId, envId]);

      if (existingResult.rows.length > 0) {
        // Update existing logo
        const updateResult = await envPool.query(`
          UPDATE ${envId}.entity_logos 
          SET logo_data = $1, mime_type = $2, original_filename = $3, 
              file_size = $4, uploaded_by = $5, updated_at = NOW()
          WHERE entity_type = $6 AND entity_id = $7 AND environment_id = $8
          RETURNING *
        `, [
          logoData.logoData, logoData.mimeType, logoData.originalFilename,
          logoData.fileSize, logoData.uploadedBy, logoData.entityType,
          logoData.entityId, envId
        ]);
        
        res.json(updateResult.rows[0]);
      } else {
        // Create new logo
        const insertResult = await envPool.query(`
          INSERT INTO ${envId}.entity_logos 
          (entity_type, entity_id, environment_id, logo_data, mime_type, 
           original_filename, file_size, uploaded_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          logoData.entityType, logoData.entityId, envId, logoData.logoData,
          logoData.mimeType, logoData.originalFilename, logoData.fileSize,
          logoData.uploadedBy
        ]);
        
        res.status(201).json(insertResult.rows[0]);
      }
    } catch (error) {
      console.error('Error saving entity logo:', error);
      res.status(500).json({ error: 'Failed to save entity logo' });
    }
  });

  // Get entity logo (query parameters version for useEntityLogo hook)
  app.get('/api/entity-logos', async (req, res) => {
    const { entityType, entityId, environmentId } = req.query;
    
    if (!entityType || !entityId || !environmentId) {
      return res.status(400).json({ error: 'Missing required parameters: entityType, entityId, environmentId' });
    }
    
    const cacheKey = `entity_logo_${entityType}_${entityId}_${environmentId}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    try {
      const envId = environmentId as string;
      const envPool = pool;
      
      // Check if entity_logos table exists first
      const tableCheckResult = await envPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = 'entity_logos'
        )
      `, [envId]);
      
      if (!tableCheckResult.rows[0].exists) {
        // Return empty result instead of error for missing table
        return res.json(null);
      }
      
      const result = await envPool.query(`
        SELECT * FROM ${envId}.entity_logos 
        WHERE entity_type = $1 AND entity_id = $2 AND environment_id = $3
        LIMIT 1
      `, [entityType, parseInt(entityId as string), envId]);

      if (result.rows.length === 0) {
        return res.json(null);
      }

      setCache(cacheKey, result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching entity logo:', error);
      res.json(null); // Return null instead of 500 error
    }
  });

  // Get entity logo (URL parameters version for backward compatibility)
  app.get('/api/entity-logos/:entityType/:entityId/:environmentId', async (req, res) => {
    try {
      const { entityType, entityId, environmentId } = req.params;
      
      const envPool = pool;
      const result = await envPool.query(`
        SELECT * FROM ${environmentId}.entity_logos 
        WHERE entity_type = $1 AND entity_id = $2 AND environment_id = $3
        LIMIT 1
      `, [entityType, parseInt(entityId), environmentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Logo not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching entity logo:', error);
      res.status(500).json({ error: 'Failed to fetch entity logo' });
    }
  });

  // Delete entity logo
  app.delete('/api/entity-logos/:entityType/:entityId/:environmentId', async (req, res) => {
    try {
      const { entityType, entityId, environmentId } = req.params;
      
      const envPool = pool;
      const result = await envPool.query(`
        DELETE FROM ${environmentId}.entity_logos 
        WHERE entity_type = $1 AND entity_id = $2 AND environment_id = $3
        RETURNING *
      `, [entityType, parseInt(entityId), environmentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Logo not found' });
      }

      res.json({ message: 'Logo deleted successfully' });
    } catch (error) {
      console.error('Error deleting entity logo:', error);
      res.status(500).json({ error: 'Failed to delete entity logo' });
    }
  });

  // Campaigns API endpoints
  app.get('/api/:envId/campaigns', async (req, res) => {
    try {
      const { envId } = req.params;
      const { partner_id } = req.query;
      
      // For degoudse environment, check for shared templates
      if (envId === 'degoudse') {
        // Get user info from session/headers (for demo, we'll simulate John Smith as partner user)
        // In a real app, this would come from authentication
        const userId = 1; // John Smith's user ID
        
        try {
          let query = `
            SELECT c.*, u.name as created_by_name 
            FROM ${envId}.campaigns c
            LEFT JOIN ${envId}.users u ON c.created_by_id = u.id
            WHERE c.is_template = false
          `;
          
          const queryParams = [];
          
          // If partner_id is specified, filter campaigns linked to that partner
          if (partner_id) {
            // Only show campaigns that are specifically shared with this partner
            // If no campaigns are shared with this partner, return empty array
            query = `
              SELECT c.id, c.name, c.description, c.type, c.category, c.status, 
                     c.created_by_id, c.sponsor_id, c.list_id, c.subject, c.email_body, 
                     c.email_logo, c.from_name, c.from_email, c.scheduled_time, 
                     c.frequency, c.is_shared, c.is_template, c.tags, c.created_at, 
                     c.updated_at, c.heading, c.button_link, c.button_text, 
                     c.button_color, c.follow_up_emails, u.name as created_by_name 
              FROM ${envId}.campaigns c
              LEFT JOIN ${envId}.users u ON c.created_by_id = u.id
              INNER JOIN ${envId}.campaign_shares cs ON c.id = cs.campaign_id
              WHERE c.is_template = false
              AND cs.shared_with_type = 'partner' 
              AND cs.shared_with_id = $1 
              AND cs.is_active = true
            `;
            queryParams.push(parseInt(partner_id));
          }
          
          query += ` ORDER BY c.created_at DESC`;
          
          // Get campaigns with user info
          const result = await pool.query(query, queryParams);
          
          // Return campaigns with proper data structure matching frontend expectations
          const campaigns = result.rows.map(campaign => ({
            id: campaign.id,
            name: campaign.name || 'Untitled Campaign',
            type: campaign.type || 'cross_sell',
            description: campaign.description || '',
            status: campaign.status || 'draft',
            created_by_id: campaign.created_by_id,
            created_by_name: campaign.created_by_name || 'Unknown User',
            created_at: campaign.created_at,
            updated_at: campaign.updated_at,
            subject: campaign.subject,
            email_body: campaign.email_body,
            email_logo: campaign.email_logo,
            from_name: campaign.from_name,
            from_email: campaign.from_email,
            frequency: campaign.frequency,
            is_shared: campaign.is_shared,
            is_template: campaign.is_template,
            tags: campaign.tags || [],
            heading: campaign.heading,
            button_link: campaign.button_link,
            button_text: campaign.button_text,
            button_color: campaign.button_color,
            follow_up_emails: campaign.follow_up_emails || [],
            scheduled_time: campaign.scheduled_time
          }));
          
          console.log(`Returning ${campaigns.length} campaigns from ${envId} environment:`, campaigns);
          res.json(campaigns);
          return;
        } catch (dbError) {
          console.log('Campaigns table does not exist yet, returning empty array');
          res.json([]);
          return;
        }
      }
      
      // For other environments, return empty array
      const campaigns = [];
      console.log(`Returning ${campaigns.length} campaigns from ${envId} environment`);
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  });

  // Create new campaign using new campaigns table
  app.post('/api/:envId/campaigns', async (req, res) => {
    try {
      const { envId } = req.params;
      const campaignData = req.body;
      
      if (envId === 'degoudse') {
        try {
          const result = await pool.query(`
            INSERT INTO ${envId}.campaigns (
              name, type, description, status, created_by_id, subject, email_body, 
              objective, is_template, frequency
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
          `, [
            campaignData.name,
            campaignData.type || 'cross_sell',
            campaignData.description || '',
            campaignData.status || 'draft',
            campaignData.created_by || 1,
            campaignData.emails?.[0]?.subject || 'Campaign Subject',
            campaignData.emails?.[0]?.content || 'Campaign Content',
            campaignData.objective || null,
            false,
            'one_time'
          ]);
          
          const campaign = result.rows[0];
          console.log('Campaign created successfully:', campaign);
          res.status(201).json(campaign);
          return;
        } catch (dbError) {
          console.error('Database error creating campaign:', dbError);
          res.status(500).json({ error: 'Failed to create campaign' });
          return;
        }
      }
      
      res.status(400).json({ error: 'Campaign creation not supported for this environment' });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  });

  // Update existing campaign
  app.put('/api/:envId/campaigns/:id', async (req, res) => {
    try {
      const { envId, id } = req.params;
      const campaignData = req.body;
      
      if (envId === 'degoudse') {
        try {
          const result = await pool.query(`
            UPDATE ${envId}.campaigns SET
              name = $1,
              type = $2,
              description = $3,
              status = $4,
              subject = $5,
              email_body = $6,
              objective = $7,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
          `, [
            campaignData.name,
            campaignData.type || 'email',
            campaignData.description,
            campaignData.status || 'draft',
            campaignData.emails?.[0]?.subject || null,
            campaignData.emails?.[0]?.content || null,
            campaignData.objective || null,
            parseInt(id)
          ]);
          
          if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
          }
          
          const campaign = result.rows[0];
          console.log('Campaign updated successfully:', campaign);
          res.json(campaign);
          return;
        } catch (dbError) {
          console.error('Database error updating campaign:', dbError);
          res.status(500).json({ error: 'Failed to update campaign' });
          return;
        }
      }
      
      res.status(400).json({ error: 'Campaign update not supported for this environment' });
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  });

  // Get single campaign by ID
  app.get('/api/:envId/campaigns/:id', async (req, res) => {
    try {
      const { envId, id } = req.params;
      
      if (envId === 'degoudse') {
        try {
          const result = await pool.query(`
            SELECT * FROM ${envId}.campaigns WHERE id = $1
          `, [id]);
          
          if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
          }
          
          const campaign = result.rows[0];
          
          // Transform the campaign data to match frontend expectations
          const transformedCampaign = {
            ...campaign,
            createdById: campaign.created_by_id,
            isShared: campaign.is_shared || false,
            isTemplate: campaign.is_template || false,
            tags: campaign.tags || [],
            sponsorId: campaign.sponsor_id,
            createdAt: campaign.created_at,
            emailBody: campaign.email_body,
            emailLogo: campaign.email_logo,
            fromName: campaign.from_name,
            fromEmail: campaign.from_email,
            scheduledTime: campaign.scheduled_time,
            followUpEmails: campaign.follow_up_emails || []
          };
          
          console.log(`Returning campaign ${campaign.name} from ${envId} environment`);
          res.json(transformedCampaign);
          return;
        } catch (dbError) {
          console.log('Campaign not found or table does not exist');
          res.status(404).json({ error: 'Campaign not found' });
          return;
        }
      }
      
      // For other environments, return 404
      res.status(404).json({ error: 'Campaign not found' });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ error: 'Failed to fetch campaign' });
    }
  });

  // Create new campaign
  app.post('/api/:envId/campaigns', async (req, res) => {
    try {
      const { envId } = req.params;
      const campaignData = req.body;
      
      // Insert campaign into database
      const result = await pool.query(`
        INSERT INTO ${envId}.campaigns (
          name, description, type, category, status, created_by_id, 
          sponsor_id, list_id, subject, heading, email_body, email_logo,
          from_name, from_email, button_link, button_text, button_color,
          follow_up_emails, scheduled_time, frequency, is_shared, is_template, tags
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        ) RETURNING *
      `, [
        campaignData.name,
        campaignData.description || null,
        campaignData.type,
        campaignData.category || null,
        campaignData.status || 'draft',
        campaignData.createdById || 1, // Default to user 1 for demo
        campaignData.sponsorId || null,
        campaignData.listId || null,
        campaignData.subject || null,
        campaignData.heading || null,
        campaignData.emailBody || null,
        campaignData.emailLogo || null,
        campaignData.fromName || null,
        campaignData.fromEmail || null,
        campaignData.buttonLink || null,
        campaignData.buttonText || null,
        campaignData.buttonColor || null,
        campaignData.followUpEmails ? JSON.stringify(campaignData.followUpEmails) : null,
        campaignData.scheduledTime || null,
        campaignData.frequency || 'one_time',
        campaignData.isShared || false,
        campaignData.isTemplate || false,
        campaignData.tags || null
      ]);
      
      const newCampaign = result.rows[0];
      
      console.log(`Created new campaign: ${newCampaign.name} in ${envId} environment`);
      res.json(newCampaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  });



  // Delete campaign
  app.delete('/api/:envId/campaigns/:id', async (req, res) => {
    try {
      const { envId, id } = req.params;
      
      // Delete campaign from database
      const result = await pool.query(`
        DELETE FROM ${envId}.campaigns WHERE id = $1 RETURNING *
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      const deletedCampaign = result.rows[0];
      console.log(`Deleted campaign: ${deletedCampaign.name} from ${envId} environment`);
      res.json({ message: 'Campaign deleted successfully', campaign: deletedCampaign });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  });

  // Bulk delete campaigns
  app.delete('/api/:envId/campaigns/bulk-delete', async (req, res) => {
    try {
      const { envId } = req.params;
      const { campaignIds } = req.body;
      
      if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
        return res.status(400).json({ error: 'Campaign IDs are required' });
      }
      
      if (envId === 'degoudse') {
        try {
          const placeholders = campaignIds.map((_, index) => `$${index + 1}`).join(', ');
          const result = await pool.query(`
            DELETE FROM ${envId}.campaigns WHERE id IN (${placeholders}) RETURNING *
          `, campaignIds);
          
          console.log(`Bulk deleted ${result.rows.length} campaigns from ${envId} environment`);
          res.json({ 
            message: `${result.rows.length} campaigns deleted successfully`, 
            deletedCampaigns: result.rows 
          });
          return;
        } catch (dbError) {
          console.error('Database error during bulk delete:', dbError);
          res.status(500).json({ error: 'Failed to delete campaigns' });
          return;
        }
      }
      
      res.status(400).json({ error: 'Bulk delete not supported for this environment' });
    } catch (error) {
      console.error('Error bulk deleting campaigns:', error);
      res.status(500).json({ error: 'Failed to delete campaigns' });
    }
  });

  // Bulk status change for campaigns
  app.patch('/api/:envId/campaigns/bulk-status', async (req, res) => {
    try {
      const { envId } = req.params;
      const { campaignIds, status } = req.body;
      
      if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
        return res.status(400).json({ error: 'Campaign IDs are required' });
      }
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      // Validate status
      const validStatuses = ['draft', 'scheduled', 'in_progress', 'sent_once', 'sent_open', 'stopped', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      
      if (envId === 'degoudse') {
        try {
          const placeholders = campaignIds.map((_, index) => `$${index + 2}`).join(', ');
          const result = await pool.query(`
            UPDATE ${envId}.campaigns 
            SET status = $1, updated_at = NOW() 
            WHERE id IN (${placeholders}) 
            RETURNING *
          `, [status, ...campaignIds]);
          
          console.log(`Bulk updated ${result.rows.length} campaigns to status "${status}" in ${envId} environment`);
          res.json({ 
            message: `${result.rows.length} campaigns updated to ${status} successfully`, 
            updatedCampaigns: result.rows 
          });
          return;
        } catch (dbError) {
          console.error('Database error during bulk status update:', dbError);
          res.status(500).json({ error: 'Failed to update campaign status' });
          return;
        }
      }
      
      res.status(400).json({ error: 'Bulk status update not supported for this environment' });
    } catch (error) {
      console.error('Error bulk updating campaign status:', error);
      res.status(500).json({ error: 'Failed to update campaign status' });
    }
  });

  // Get campaigns shared with broker users (for Regional Insurance Partners environment)
  app.get('/api/broker/shared-campaigns', async (req, res) => {
    try {
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
      if (envId === 'degoudse') {
        // Return campaigns shared with Regional Insurance Partners from De Goudse
        const sharedCampaigns = [
          {
            id: 1,
            name: "Property Insurance Cross-Sell",
            description: "Targeted campaign for existing automotive customers to add property coverage",
            type: "cross_sell",
            category: "cross_sell",
            status: "active",
            sharedAt: "2024-06-10T09:00:00Z",
            sharedBy: "De Goudse Marketing",
            accessLevel: "view",
            isTemplate: false,
            sponsorName: "De Goudse Insurance",
            tags: ["property", "cross-sell", "automotive"]
          },
          {
            id: 2,
            name: "Customer Retention Template",
            description: "Template for retaining customers approaching policy renewal",
            type: "retention",
            category: "retention", 
            status: "template",
            sharedAt: "2024-06-08T14:30:00Z",
            sharedBy: "De Goudse Strategy Team",
            accessLevel: "view",
            isTemplate: true,
            sponsorName: "De Goudse Insurance", 
            tags: ["retention", "renewal", "loyalty"]
          },
          {
            id: 3,
            name: "Customer Retention Campaign",
            description: "Active campaign to retain customers approaching renewal",
            type: "retention",
            category: "retention",
            status: "active",
            sharedAt: "2024-06-08T14:30:00Z",
            sharedBy: "De Goudse Retention Team",
            accessLevel: "view",
            isTemplate: false,
            sponsorName: "De Goudse Insurance",
            tags: ["retention", "renewal", "loyalty"]
          },
          {
            id: 3,
            name: "New Product Launch Template",
            description: "Template for introducing new insurance products to broker networks",
            type: "product_launch",
            category: "cross_sell",
            status: "template",
            sharedAt: "2024-06-05T11:15:00Z",
            sharedBy: "De Goudse Product Team",
            accessLevel: "view",
            isTemplate: true,
            sponsorName: "De Goudse Insurance",
            tags: ["product-launch", "brokers", "new-products"]
          },
          {
            id: 4,
            name: "Q3 Growth Initiative",
            description: "Active campaign focused on expanding market share in Q3",
            type: "growth",
            category: "cross_sell",
            status: "active",
            sharedAt: "2024-06-12T16:45:00Z",
            sharedBy: "De Goudse Growth Team",
            accessLevel: "view",
            isTemplate: false,
            sponsorName: "De Goudse Insurance",
            tags: ["growth", "Q3", "market-expansion"]
          },
          {
            id: 5,
            name: "Digital Transformation Campaign",
            description: "Template for promoting digital insurance solutions",
            type: "digital",
            category: "retention",
            status: "template",
            sharedAt: "2024-06-07T13:20:00Z",
            sharedBy: "De Goudse Digital Team",
            accessLevel: "view",
            isTemplate: true,
            sponsorName: "De Goudse Insurance",
            tags: ["digital", "transformation", "technology"]
          }
        ];
        
        console.log(`Returning ${sharedCampaigns.length} shared campaigns for broker view`);
        res.json(sharedCampaigns);
      } else {
        // For other environments, return empty array
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching shared campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch shared campaigns' });
    }
  });

  app.get('/api/campaigns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
      // No campaigns table exists yet - return 404 for authentic data only
      console.log(`Campaign ${id} not found in ${envId} environment - no campaigns table exists`);
      res.status(404).json({ error: 'Campaign not found' });
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      res.status(500).json({ error: 'Failed to fetch campaign details' });
    }
  });

  app.post('/api/campaigns', async (req, res) => {
    try {
      const envId = (req.headers['x-environment-id'] as string) || 'degoudse';
      const envDb = db;
      
      const { sharing, ...campaignData } = req.body;
      
      // Create the campaign first
      const [campaign] = await envDb
        .insert(campaigns)
        .values({
          ...campaignData,
          createdById: 1, // Default user for now
          status: campaignData.status || 'draft'
        })
        .returning();
      
      // If campaign is shared, create sharing records
      if (sharing && campaign.id) {
        const shareRecords = [];
        
        // Add partner shares
        if (sharing.sharedPartnerIds && sharing.sharedPartnerIds.length > 0) {
          for (const partnerId of sharing.sharedPartnerIds) {
            shareRecords.push({
              campaignId: campaign.id,
              sharedWithType: 'partner',
              sharedWithId: parseInt(partnerId),
              accessLevel: sharing.shareAccessLevel || 'view',
              shareMessage: sharing.shareMessage || null,
              sharedById: 1
            });
          }
        }
        
        // Add contact shares
        if (sharing.sharedContactIds && sharing.sharedContactIds.length > 0) {
          for (const contactId of sharing.sharedContactIds) {
            shareRecords.push({
              campaignId: campaign.id,
              sharedWithType: 'contact',
              sharedWithId: parseInt(contactId),
              accessLevel: sharing.shareAccessLevel || 'view',
              shareMessage: sharing.shareMessage || null,
              sharedById: 1
            });
          }
        }
        
        // Insert sharing records if any exist
        if (shareRecords.length > 0) {
          await envDb.insert(campaignShares).values(shareRecords);
        }
      }
      
      // Create recipients if provided
      if (campaignData.recipientIds && campaignData.recipientIds.length > 0) {
        const recipientRecords = campaignData.recipientIds.map((contactId: number) => ({
          campaignId: campaign.id,
          contactId: contactId,
          status: 'pending'
        }));
        
        await envDb.insert(campaignRecipients).values(recipientRecords);
      }
      
      // Create follow-ups if provided
      if (campaignData.followUpEmails && campaignData.followUpEmails.length > 0) {
        const followUpRecords = campaignData.followUpEmails.map((followUp: any) => ({
          campaignId: campaign.id,
          subject: followUp.subject || '',
          emailBody: followUp.emailBody || '',
          delayDays: followUp.delayDays,
          status: 'pending',
          attachment: followUp.attachment || null
        }));
        
        await envDb.insert(campaignFollowUps).values(followUpRecords);
      }
      
      console.log(`Campaign created successfully in ${envId} environment:`, campaign.id);
      res.status(201).json(campaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  });

  // Campaign Shares API endpoint
  app.post('/api/:envId/campaign-shares', async (req, res) => {
    try {
      const { envId } = req.params;
      const shareData = req.body;
      
      console.log(`Creating campaign share in ${envId} environment:`, shareData);
      
      if (envId === 'degoudse') {
        // Insert campaign share into degoudse environment
        const result = await pool.query(`
          INSERT INTO degoudse.campaign_shares (
            campaign_id, shared_with_type, shared_with_id, access_level, 
            shared_by_id, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING *
        `, [
          shareData.campaign_id,
          shareData.shared_with_type,
          shareData.shared_with_id,
          shareData.access_level,
          shareData.shared_by_id,
          shareData.is_active
        ]);
        
        const campaignShare = result.rows[0];
        console.log(`Campaign share created successfully in ${envId}:`, campaignShare);
        res.status(201).json(campaignShare);
      } else {
        res.status(400).json({ error: 'Environment not supported' });
      }
    } catch (error) {
      console.error('Error creating campaign share:', error);
      res.status(500).json({ error: 'Failed to create campaign share' });
    }
  });

  // Campaign Templates API endpoints
  app.get('/api/:envId/campaign-templates', async (req, res) => {
    try {
      const { envId } = req.params;
      
      const result = await pool.query(`
        SELECT 
          c.*,
          u.name as created_by_name
        FROM ${envId}.campaigns c
        LEFT JOIN ${envId}.users u ON c.created_by_id = u.id
        WHERE c.is_template = true
        ORDER BY c.created_at DESC
      `);
      
      const templates = result.rows.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        type: template.type,
        category: template.category,
        status: template.status,
        created_by_id: template.created_by_id,
        sponsor_id: template.sponsor_id,
        subject: template.subject,
        email_body: template.email_body,
        email_logo: template.email_logo,
        from_name: template.from_name,
        from_email: template.from_email,
        frequency: template.frequency,
        is_shared: template.is_shared,
        is_template: template.is_template,
        tags: template.tags || [],
        created_at: template.created_at,
        updated_at: template.updated_at,
        heading: template.heading,
        button_link: template.button_link,
        button_text: template.button_text,
        button_color: template.button_color,
        follow_up_emails: template.follow_up_emails || [],
        createdById: template.created_by_id,
        isShared: template.is_shared,
        isTemplate: template.is_template,
        sponsorId: template.sponsor_id,
        createdAt: template.created_at,
        emailBody: template.email_body,
        emailLogo: template.email_logo,
        fromName: template.from_name,
        fromEmail: template.from_email,
        scheduledTime: template.scheduled_time,
        followUpEmails: template.follow_up_emails || []
      }));
      
      res.json(templates);
    } catch (error) {
      console.error('Error fetching campaign templates:', error);
      res.status(500).json({ error: 'Failed to fetch campaign templates' });
    }
  });

  // Get single campaign template by ID
  app.get('/api/:envId/campaign-templates/:id', async (req, res) => {
    try {
      const { envId, id } = req.params;
      
      // Get template
      const templateResult = await pool.query(`
        SELECT * FROM ${envId}.campaigns WHERE id = $1 AND is_template = true
      `, [id]);
      
      if (templateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      const template = templateResult.rows[0];
      
      // For templates, we don't need separate emails/blocks structure
      // The template data is stored directly in the campaigns table
      
      const templateData = {
        id: template.id,
        name: template.name,
        description: template.description || '',
        type: template.type,
        category: template.category,
        status: template.status,
        created_by_id: template.created_by_id,
        sponsor_id: template.sponsor_id,
        subject: template.subject,
        email_body: template.email_body,
        email_logo: template.email_logo,
        from_name: template.from_name,
        from_email: template.from_email,
        frequency: template.frequency,
        is_shared: template.is_shared,
        is_template: template.is_template,
        tags: template.tags || [],
        created_at: template.created_at,
        updated_at: template.updated_at,
        heading: template.heading,
        button_link: template.button_link,
        button_text: template.button_text,
        button_color: template.button_color,
        follow_up_emails: template.follow_up_emails || [],
        scheduled_time: template.scheduled_time
      };
      
      res.json(templateData);
    } catch (error) {
      console.error('Error fetching campaign template:', error);
      res.status(500).json({ error: 'Failed to fetch campaign template' });
    }
  });

  // Create campaign template
  app.post('/api/:envId/campaign-templates', async (req, res) => {
    try {
      const { envId } = req.params;
      const { name, description, objective, entity, icon, status, attachments, emails } = req.body;
      
      console.log('Campaign template creation request:', { name, description, objective, entity, icon, status, emails: emails?.length });
      
      // Validate required fields
      if (!name || !entity || !emails || !Array.isArray(emails)) {
        return res.status(400).json({ error: 'Missing required fields: name, entity, and emails array' });
      }
      
      // For now, use user ID 1 as default creator
      const createdBy = 1;
      
      await pool.query('BEGIN');
      
      // Insert template
      const templateResult = await pool.query(`
        INSERT INTO campaign_templates (name, description, objective, entity, icon, status, attachments, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [name, description, objective, entity, icon, status || 'draft', JSON.stringify(attachments || []), createdBy]);
      
      const templateId = templateResult.rows[0].id;
      
      // Insert emails and blocks
      for (let emailIndex = 0; emailIndex < emails.length; emailIndex++) {
        const email = emails[emailIndex];
        
        const emailResult = await pool.query(`
          INSERT INTO campaign_emails (template_id, subject, follow_up_days, left_logo, right_logo, email_order)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [templateId, email.subject, email.followUpDays || 0, email.leftLogo || null, email.rightLogo || null, emailIndex]);
        
        const emailId = emailResult.rows[0].id;
        
        // Parse blocks from content string
        let blocks = [];
        try {
          blocks = JSON.parse(email.content || '[]');
        } catch (e) {
          console.log('Failed to parse email content as JSON, treating as empty blocks array');
          blocks = [];
        }
        
        // Insert blocks
        for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
          const block = blocks[blockIndex];
          
          await pool.query(`
            INSERT INTO email_blocks (email_id, type, content, properties, block_order)
            VALUES ($1, $2, $3, $4, $5)
          `, [emailId, block.type || 'text', block.content || '', JSON.stringify(block.properties || {}), blockIndex]);
        }
      }
      
      await pool.query('COMMIT');
      
      res.json({ id: templateId, message: 'Template created successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error creating campaign template:', error);
      res.status(500).json({ error: 'Failed to create campaign template' });
    }
  });

  // Update campaign template
  app.put('/api/:envId/campaign-templates/:id', async (req, res) => {
    try {
      const { envId, id } = req.params;
      const { name, description, objective, entity, icon, status, attachments, emails } = req.body;
      
      await pool.query('BEGIN');
      
      // Update template
      await pool.query(`
        UPDATE campaign_templates 
        SET name = $1, description = $2, objective = $3, entity = $4, icon = $5, status = $6, attachments = $7, updated_at = NOW()
        WHERE id = $8
      `, [name, description, objective, entity, icon, status || 'draft', JSON.stringify(attachments || []), id]);
      
      // Delete existing emails and blocks (cascade will handle blocks)
      await pool.query('DELETE FROM campaign_emails WHERE template_id = $1', [id]);
      
      // Insert new emails and blocks
      for (let emailIndex = 0; emailIndex < emails.length; emailIndex++) {
        const email = emails[emailIndex];
        
        const emailResult = await pool.query(`
          INSERT INTO campaign_emails (template_id, subject, follow_up_days, left_logo, right_logo, email_order)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [id, email.subject, email.followUpDays || 0, email.leftLogo, email.rightLogo, emailIndex]);
        
        const emailId = emailResult.rows[0].id;
        
        // Insert blocks
        for (let blockIndex = 0; blockIndex < email.blocks.length; blockIndex++) {
          const block = email.blocks[blockIndex];
          
          await pool.query(`
            INSERT INTO email_blocks (email_id, type, content, properties, block_order)
            VALUES ($1, $2, $3, $4, $5)
          `, [emailId, block.type, block.content, JSON.stringify(block.properties || {}), blockIndex]);
        }
      }
      
      await pool.query('COMMIT');
      
      res.json({ message: 'Template updated successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error updating campaign template:', error);
      res.status(500).json({ error: 'Failed to update campaign template' });
    }
  });

  // Activity API endpoints
  app.post('/api/:envId/activity/tasks', async (req, res) => {
    try {
      const { envId } = req.params;
      const { title, priority, visibleToPartner, entityType, entityId, authorId, assignedTo, assignedById } = req.body;
      
      const envPool = pool;
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.activities (
          activity_type, title, priority, visible_to_partner, 
          entity_type, entity_id, author_id, assigned_to, assigned_by_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `, ['task', title, priority, visibleToPartner, entityType, entityId, authorId, assignedTo, assignedById]);
      
      console.log('Task created successfully:', result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.patch('/api/:envId/activity/tasks/:taskId', async (req, res) => {
    try {
      const { envId, taskId } = req.params;
      const { completed, completedAt } = req.body;
      
      const envPool = pool;
      
      const result = await envPool.query(`
        UPDATE ${envId}.activities 
        SET completed = $1, completed_at = $2, updated_at = NOW()
        WHERE id = $3 AND activity_type = 'task'
        RETURNING *
      `, [completed, completedAt, parseInt(taskId)]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  app.post('/api/:envId/activity/comments', async (req, res) => {
    try {
      const { envId } = req.params;
      const { content, visibleToPartner, entityType, entityId, authorId } = req.body;
      
      const envPool = pool;
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.activities (
          activity_type, content, visible_to_partner, 
          entity_type, entity_id, author_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `, ['comment', content, visibleToPartner, entityType, entityId, authorId]);
      
      console.log('Comment created successfully:', result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  // Table counts endpoint for Developer Dashboard
  app.get('/api/:environment/table-counts', async (req, res) => {
    try {
      const environment = req.params.environment;
      const { pool } = await import('./db');
      const client = await pool.connect();
      
      try {
        // Get all tables in the environment schema
        const tablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `, [environment]);
        
        const tableCounts: Record<string, number> = {};
        
        // Get count for each table
        for (const row of tablesResult.rows) {
          const tableName = row.table_name;
          try {
            const countResult = await client.query(`SELECT COUNT(*) as count FROM "${environment}"."${tableName}"`);
            tableCounts[tableName] = parseInt(countResult.rows[0].count);
          } catch (countError) {
            console.error(`Error counting rows in ${tableName}:`, countError);
            tableCounts[tableName] = 0;
          }
        }
        
        console.log(`Table counts for ${environment}:`, tableCounts);
        res.json(tableCounts);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching table counts:', error);
      res.status(500).json({ error: 'Failed to fetch table counts' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
