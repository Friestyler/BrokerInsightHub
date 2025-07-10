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
  insertCampaignShareSchema,
  productCategories,
  products,
  productTemplates,
  vendors,
  insertProductCategorySchema,
  insertProductSchema,
  insertProductTemplateSchema,
  activityReactions,
  insertActivityReactionSchema,
  type ProductCategory,
  type Product,
  type ProductTemplate,
  type InsertProductTemplate,
  type Vendor,
  type ActivityReaction,
  type InsertActivityReaction
} from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { db, pool, getEnvironmentPool, getEnvironmentDb } from './db';
import multer from 'multer';
import { copyEnvironmentData } from './initDatabase';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { comparePdfDocuments, extractTextFromPdf } from './services/pdfComparison';
import { discoverEntitySchemas, getAvailableEnvironments, isSupportedEntityType } from './services/schemaDiscoveryService';
import { UploadSettingsService } from './services/uploadSettingsService';
import { insertUploadSettingSchema, insertTransformationScriptSchema, insertUploadTemplateSchema } from '@shared/schema';



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

function clearCache() {
  cache.clear();
  console.log('Server cache cleared');
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

// Separate multer configuration for CSV files (transformation scripts)
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // Limit file size to 50MB for CSV files
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV files with various MIME types and extensions
    const csvMimeTypes = [
      'text/csv',
      'application/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'text/x-csv'
    ];
    
    const isCsvFile = csvMimeTypes.includes(file.mimetype) || 
                     file.originalname.toLowerCase().endsWith('.csv') ||
                     file.originalname.toLowerCase().endsWith('.txt');
    
    console.log('File filter check:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      isCsvFile
    });
    
    if (isCsvFile) {
      cb(null, true);
    } else {
      cb(new Error(`File type not supported for transformation. Received: ${file.mimetype}, filename: ${file.originalname}`));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Add environment middleware for environment-specific routes
  const { environmentMiddleware } = await import('./middleware/environmentMiddleware');
  app.use('/api/:environmentId', environmentMiddleware);
  
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
        LEFT JOIN myqollabi.partner_opportunities po ON p.id = po.partnerId
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
        ownerId: customer.ownerId,
        assignedPartnerId: customer.assignedPartnerId,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        partnerCount: parseInt(customer.partner_count) || 0,
        opportunityCount: parseInt(customer.opportunity_count) || 0
      }));
      
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.json([]);
    }
  });

  // Direct opportunities handler - avoid redirect issues
  app.get('/api/opportunities', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT o.id, o.title, o.clientId, o.productId, o.probability, o.estimatedValue, o.type, o.status, o.stage, o.ownerId, o.description, o.partnerId, o.createdAt, o.updatedAt, o.expectedCloseDate, 
               STRING_AGG(DISTINCT c.name, ', ') as customer_names,
               STRING_AGG(DISTINCT p.name, ', ') as partner_names,
               STRING_AGG(DISTINCT pr.name, ', ') as product_names,
               COUNT(DISTINCT co.customer_id) as customer_count,
               COUNT(DISTINCT o.partner_id) as partner_count,
               COUNT(DISTINCT op.product_id) as product_count
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.customer_opportunities co ON o.id = co.opportunity_id
        LEFT JOIN degoudse.customers c ON c.id = co.customer_id
        LEFT JOIN degoudse.partners p ON p.id = o.partner_id
        LEFT JOIN degoudse.opportunity_products op ON o.id = op.opportunity_id
        LEFT JOIN degoudse.products pr ON pr.id = op.product_id
        GROUP BY o.id, o.title, o.description, o.status, o.stage, o."estimatedValue", 
                 o."expectedCloseDate", o."clientId", o."partnerId", o."productId", 
                 o."ownerId", o.probability, o.type, o."createdAt", o."updatedAt"
        ORDER BY o.id
      `);
      console.log(`Returning ${result.rows.length} opportunities from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
  });



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
        LEFT JOIN myqollabi.partner_opportunities po ON p.id = po.partnerId
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
          linked_opportunity_ids, createdAt, updatedAt
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
          ownerId, assignedPartnerId, createdAt, updatedAt
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
        LEFT JOIN myqollabi.opportunities o ON o.clientId = c.id
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
        LEFT JOIN degoudse.opportunities o ON o.clientId = c.id
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
        SELECT o.id, o.title, o.client_id, o.product_id, o.probability, o.estimated_value, o.type, o.status, o.stage, o.owner_id, o.description, o.partner_id, o.created_at, o.updated_at, o.expected_close_date, c.name as client_name
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.customers c ON o.client_id = c.id
        WHERE o.partner_id = ${partnerId}
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

  // Get activities for a specific partner (including related opportunity activities)
  app.get('/api/:envId/partners/:id/activities', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      const envPool = getEnvironmentPool(envId);
      
      // Fetch tasks for this partner AND related opportunity tasks
      const tasksResult = await envPool.query(`
        SELECT t.*, u.name as assigned_to_name, 
               CASE WHEN t.entity_type = 'opportunity' THEN o.title ELSE NULL END as opportunity_title
        FROM ${envId}.activity_tasks t
        LEFT JOIN ${envId}.users u ON t.assigned_to = u.id
        LEFT JOIN ${envId}.opportunities o ON t.entity_id = o.id AND t.entity_type = 'opportunity'
        WHERE (t.entity_type = 'partner' AND t.partner_id = $1)
           OR (t.entity_type = 'opportunity' AND t.entity_id IN (
               SELECT o2.id FROM ${envId}.opportunities o2 WHERE o2.partner_id = $1
           ))
        ORDER BY t.created_at DESC
      `, [partnerId]);
      
      // Fetch comments for this partner AND related opportunity comments
      const commentsResult = await envPool.query(`
        SELECT c.*, u.name as author_name
        FROM ${envId}.activity_comments c
        LEFT JOIN ${envId}.users u ON c.user_id = u.id
        WHERE c.partner_id = $1
        ORDER BY c.created_at DESC
      `, [partnerId]);
      
      // Fetch attachments for this partner
      const attachmentsResult = await envPool.query(`
        SELECT a.*, u.name as author_name
        FROM ${envId}.activity_attachments a
        LEFT JOIN ${envId}.users u ON a.uploaded_by_id = u.id
        WHERE a.partner_id = $1
        ORDER BY a.created_at DESC
      `, [partnerId]);
      
      res.json({
        tasks: tasksResult.rows,
        comments: commentsResult.rows,
        attachments: attachmentsResult.rows
      });
    } catch (error) {
      console.error('Error fetching partner activities:', error);
      res.status(500).json({ error: 'Failed to fetch partner activities' });
    }
  });

  // Get activities for a specific customer (including related opportunity activities)
  app.get('/api/:envId/customers/:id/activities', async (req, res) => {
    try {
      const envId = req.params.envId;
      const customerId = parseInt(req.params.id);
      const envPool = getEnvironmentPool(envId);
      
      // Fetch tasks for this customer AND related opportunity tasks
      const tasksResult = await envPool.query(`
        SELECT t.*, u.name as assigned_to_name, 
               CASE WHEN t.entity_type = 'opportunity' THEN o.title ELSE NULL END as opportunity_title
        FROM ${envId}.activity_tasks t
        LEFT JOIN ${envId}.users u ON t.assigned_to = u.id
        LEFT JOIN ${envId}.opportunities o ON t.entity_id = o.id AND t.entity_type = 'opportunity'
        WHERE (t.entity_type = 'customer' AND t.entity_id = $1)
           OR (t.entity_type = 'opportunity' AND t.entity_id IN (
               SELECT o2.id FROM ${envId}.opportunities o2 
               JOIN ${envId}.customer_opportunities co ON o2.id = co.opportunity_id 
               WHERE co.customer_id = $1
           ))
        ORDER BY t.created_at DESC
      `, [customerId]);
      
      // Fetch comments for this customer AND related opportunity comments
      const commentsResult = await envPool.query(`
        SELECT c.*, u.name as author_name
        FROM ${envId}.activity_comments c
        LEFT JOIN ${envId}.users u ON c.user_id = u.id
        WHERE c.entity_type = 'customer' AND c.entity_id = $1
        ORDER BY c.created_at DESC
      `, [customerId]);
      
      // Fetch attachments for this customer (attachments are only partner-based currently)
      const attachmentsResult = await envPool.query(`
        SELECT a.*, u.name as author_name
        FROM ${envId}.activity_attachments a
        LEFT JOIN ${envId}.users u ON a.uploaded_by_id = u.id
        LEFT JOIN ${envId}.opportunities o ON o.partner_id = a.partner_id
        JOIN ${envId}.customer_opportunities co ON o.id = co.opportunity_id
        WHERE co.customer_id = $1
        ORDER BY a.created_at DESC
      `, [customerId]);
      
      res.json({
        tasks: tasksResult.rows,
        comments: commentsResult.rows,
        attachments: attachmentsResult.rows
      });
    } catch (error) {
      console.error('Error fetching customer activities:', error);
      res.status(500).json({ error: 'Failed to fetch customer activities' });
    }
  });

  // Get unified activities from all entities (for platform activity hub)
  app.get('/api/:envId/unified-activities', async (req, res) => {
    try {
      const envId = req.params.envId;
      const envPool = getEnvironmentPool(envId);
      
      // Fetch tasks from activity_tasks table
      const tasksQuery = `
        SELECT 
          t.id,
          'task' as activity_type,
          t.title,
          COALESCE(t.description, t.title) as content,
          t.priority,
          t.completed,
          t.assigned_to,
          t.entity_type,
          t.entity_id,
          t.visible_to_partner,
          t.created_at,
          t.updated_at,
          CASE 
            WHEN t.entity_type = 'partner' THEN p.name
            WHEN t.entity_type = 'opportunity' THEN o.title  
            WHEN t.entity_type = 'customer' THEN c.name
            ELSE NULL
          END as entity_name
        FROM ${envId}.activity_tasks t
        LEFT JOIN ${envId}.partners p ON t.entity_type = 'partner' AND t.entity_id = p.id
        LEFT JOIN ${envId}.opportunities o ON t.entity_type = 'opportunity' AND t.entity_id = o.id  
        LEFT JOIN ${envId}.customers c ON t.entity_type = 'customer' AND t.entity_id = c.id
      `;

      // Fetch comments from activity_comments table
      const commentsQuery = `
        SELECT 
          c.id,
          'comment' as activity_type,
          c.content as title,
          c.content,
          null as priority,
          false as completed,
          c.user_id as assigned_to,
          c.entity_type,
          c.entity_id,
          c.visible_to_partner,
          c.created_at,
          c.updated_at,
          CASE 
            WHEN c.entity_type = 'partner' THEN p.name
            WHEN c.entity_type = 'opportunity' THEN o.title  
            WHEN c.entity_type = 'customer' THEN cu.name
            ELSE NULL
          END as entity_name
        FROM ${envId}.activity_comments c
        LEFT JOIN ${envId}.partners p ON c.entity_type = 'partner' AND c.entity_id = p.id
        LEFT JOIN ${envId}.opportunities o ON c.entity_type = 'opportunity' AND c.entity_id = o.id  
        LEFT JOIN ${envId}.customers cu ON c.entity_type = 'customer' AND c.entity_id = cu.id
      `;

      console.log('Executing tasks query...');
      const tasksResult = await envPool.query(tasksQuery);
      console.log(`Tasks found: ${tasksResult.rows.length}`);

      console.log('Executing comments query...');
      const commentsResult = await envPool.query(commentsQuery);
      console.log(`Comments found: ${commentsResult.rows.length}`);

      // Combine and sort all activities
      const allActivities = [
        ...tasksResult.rows,
        ...commentsResult.rows
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 200);

      const activities = allActivities.map((activity: any) => ({
        id: activity.id,
        activity_type: activity.activity_type,
        title: activity.title,
        content: activity.content,
        priority: activity.priority,
        completed: activity.completed,
        visible_to_partner: activity.visible_to_partner,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        entity_name: activity.entity_name,
        assigned_to: activity.assigned_to,
        user_id: activity.assigned_to,
        author_id: activity.assigned_to,
        created_at: activity.created_at,
        updated_at: activity.updated_at,
        reactions: []
      }));
      
      console.log(`Unified activities found: ${activities.length} (${tasksResult.rows.length} tasks, ${commentsResult.rows.length} comments)`);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching unified activities:', error);
      res.status(500).json({ error: 'Failed to fetch unified activities' });
    }
  });

  // Create a new activity for a partner (comments, tasks)
  app.post('/api/:envId/partners/:id/activities', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      const { type, content, source_entity_type, source_entity_id, source_entity_name, visible_to_partner, assigned_to } = req.body;
      
      const envPool = getEnvironmentPool(envId);
      
      if (type === 'comment') {
        // Create comment activity
        const result = await envPool.query(`
          INSERT INTO ${envId}.activities 
          (activity_type, content, visible_to_partner, entity_type, entity_id, source_entity_type, source_entity_id, source_entity_name, assigned_to, created_at, updated_at)
          VALUES ($1, $2, $3, 'partner', $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `, [type, content, visible_to_partner || false, partnerId, source_entity_type || null, source_entity_id || null, source_entity_name || null, assigned_to || null]);
        
        console.log(`Created ${type} activity for partner ${partnerId} from ${source_entity_type || 'direct'}`);
        res.status(201).json(result.rows[0]);
      } else if (type === 'task') {
        // Create task activity
        const result = await envPool.query(`
          INSERT INTO ${envId}.activities 
          (activity_type, title, content, priority, completed, visible_to_partner, entity_type, entity_id, source_entity_type, source_entity_id, source_entity_name, assigned_to, created_at, updated_at)
          VALUES ($1, $2, $3, $4, false, $5, 'partner', $6, $7, $8, $9, $10, NOW(), NOW())
          RETURNING *
        `, [type, content, content, 'medium', visible_to_partner || false, partnerId, source_entity_type || null, source_entity_id || null, source_entity_name || null, assigned_to || null]);
        
        console.log(`Created ${type} activity for partner ${partnerId} from ${source_entity_type || 'direct'}`);
        res.status(201).json(result.rows[0]);
      } else {
        res.status(400).json({ error: 'Invalid activity type. Must be "comment" or "task".' });
      }
    } catch (error) {
      console.error('Error creating partner activity:', error);
      res.status(500).json({ error: 'Failed to create partner activity' });
    }
  });

  // Get timeline for a specific partner
  app.get('/api/:envId/partners/:id/timeline', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      
      // Fetch all timeline activities from database with user information
      const timelineQuery = sql`
        SELECT 
          t.id, 
          'task' as activity_type, 
          t.title, 
          t.title as content, 
          t.description,
          t.priority,
          t.completed,
          t.visible_to_partner,
          t.assigned_to as assigned_to,
          t.created_at,
          t.updated_at,
          u.name as author_name
        FROM ${sql.identifier(envId)}.activity_tasks t
        LEFT JOIN ${sql.identifier(envId)}.users u ON t.assigned_to = u.id
        WHERE t.partner_id = ${partnerId}
        
        UNION ALL
        
        SELECT 
          c.id, 
          'comment' as activity_type, 
          'Comment' as title, 
          c.content, 
          null as description,
          null as priority,
          null as completed,
          c.visible_to_partner,
          c.user_id as assigned_to,
          c.created_at,
          c.updated_at,
          u.name as author_name
        FROM ${sql.identifier(envId)}.activity_comments c
        LEFT JOIN ${sql.identifier(envId)}.users u ON c.user_id = u.id
        WHERE c.partner_id = ${partnerId}
        
        UNION ALL
        
        SELECT 
          a.id, 
          'attachment' as activity_type, 
          'Document' as title, 
          a.filename as content, 
          null as description,
          null as priority,
          null as completed,
          a.visible_to_partner,
          a.uploaded_by_id as assigned_to,
          a.created_at,
          null as updated_at,
          u.name as author_name
        FROM ${sql.identifier(envId)}.activity_attachments a
        LEFT JOIN ${sql.identifier(envId)}.users u ON a.uploaded_by_id = u.id
        WHERE a.partner_id = ${partnerId}
        
        ORDER BY created_at DESC
      `;
      
      const timelineResult = await db.execute(timelineQuery);
      
      // Transform the results to match expected frontend format
      const timeline = timelineResult.rows.map((item: any) => ({
        id: item.id,
        activity_type: item.activity_type,
        title: item.title,
        content: item.content,
        description: item.description,
        priority: item.priority,
        completed: item.completed,
        visible_to_partner: item.visible_to_partner,
        assigned_to: item.assigned_to,
        created_at: item.created_at,
        updated_at: item.updated_at,
        author_name: item.author_name || 'Unknown User'
      }));
      
      res.json(timeline);
    } catch (error) {
      console.error('Error fetching partner timeline:', error);
      res.status(500).json({ error: 'Failed to fetch partner timeline' });
    }
  });

  // Create activity (task or comment) for a specific customer
  app.post('/api/:envId/customers/:id/activities', async (req, res) => {
    try {
      const envId = req.params.envId;
      const customerId = parseInt(req.params.id);
      const { type, content, title, priority, visible_to_partner, assigned_to } = req.body;
      
      const envPool = getEnvironmentPool(envId);
      
      if (type === 'comment') {
        // Create comment activity
        const result = await envPool.query(`
          INSERT INTO ${envId}.activity_comments 
          (content, visible_to_partner, entity_type, entity_id, user_id, created_at, updated_at)
          VALUES ($1, $2, 'customer', $3, $4, NOW(), NOW())
          RETURNING *
        `, [content, visible_to_partner || false, customerId, assigned_to || null]);
        
        console.log(`Created comment activity for customer ${customerId}`);
        res.status(201).json(result.rows[0]);
      } else if (type === 'task') {
        // Create task activity
        const result = await envPool.query(`
          INSERT INTO ${envId}.activity_tasks 
          (title, description, priority, completed, visible_to_partner, entity_type, entity_id, assigned_to, created_at, updated_at)
          VALUES ($1, $2, $3, false, $4, 'customer', $5, $6, NOW(), NOW())
          RETURNING *
        `, [title || content, content, priority || 'medium', visible_to_partner || false, customerId, assigned_to || null]);
        
        console.log(`Created task activity for customer ${customerId}`);
        res.status(201).json(result.rows[0]);
      } else {
        res.status(400).json({ error: 'Invalid activity type. Must be "comment" or "task".' });
      }
    } catch (error) {
      console.error('Error creating customer activity:', error);
      res.status(500).json({ error: 'Failed to create customer activity' });
    }
  });

  // Get timeline for a specific customer
  app.get('/api/:envId/customers/:id/timeline', async (req, res) => {
    try {
      const envId = req.params.envId;
      const customerId = parseInt(req.params.id);
      
      // Fetch all timeline activities from database with user information
      const timelineQuery = sql`
        SELECT 
          t.id, 
          'task' as activity_type, 
          t.title, 
          t.title as content, 
          t.description,
          t.priority,
          t.completed,
          t.visible_to_partner,
          t.assigned_to as assigned_to,
          t.created_at,
          t.updated_at,
          u.name as author_name
        FROM ${sql.identifier(envId)}.activity_tasks t
        LEFT JOIN ${sql.identifier(envId)}.users u ON t.assigned_to = u.id
        WHERE t.entity_type = 'customer' AND t.entity_id = ${customerId}
        
        UNION ALL
        
        SELECT 
          c.id, 
          'comment' as activity_type, 
          'Comment' as title, 
          c.content, 
          null as description,
          null as priority,
          null as completed,
          c.visible_to_partner,
          c.user_id as assigned_to,
          c.created_at,
          c.updated_at,
          u.name as author_name
        FROM ${sql.identifier(envId)}.activity_comments c
        LEFT JOIN ${sql.identifier(envId)}.users u ON c.user_id = u.id
        WHERE c.entity_type = 'customer' AND c.entity_id = ${customerId}
        
        UNION ALL
        
        SELECT 
          a.id, 
          'attachment' as activity_type, 
          'Document' as title, 
          a.filename as content, 
          null as description,
          null as priority,
          null as completed,
          a.visible_to_partner,
          a.uploaded_by_id as assigned_to,
          a.created_at,
          null as updated_at,
          u.name as author_name
        FROM ${sql.identifier(envId)}.activity_attachments a
        LEFT JOIN ${sql.identifier(envId)}.users u ON a.uploaded_by_id = u.id
        LEFT JOIN ${sql.identifier(envId)}.opportunities o ON o.partner_id = a.partner_id
        JOIN ${sql.identifier(envId)}.customer_opportunities co ON o.id = co.opportunity_id
        WHERE co.customer_id = ${customerId}
        
        ORDER BY created_at DESC
      `;
      
      const timelineResult = await db.execute(timelineQuery);
      
      // Transform the results to match expected frontend format
      const timeline = timelineResult.rows.map((item: any) => ({
        id: item.id,
        activity_type: item.activity_type,
        title: item.title,
        content: item.content,
        description: item.description,
        priority: item.priority,
        completed: item.completed,
        visible_to_partner: item.visible_to_partner,
        assigned_to: item.assigned_to,
        created_at: item.created_at,
        updated_at: item.updated_at,
        author_name: item.author_name || 'Unknown User'
      }));
      
      res.json(timeline);
    } catch (error) {
      console.error('Error fetching customer timeline:', error);
      res.status(500).json({ error: 'Failed to fetch customer timeline' });
    }
  });

  // Get all related tasks for a specific partner (from partner, opportunities, and customers)
  app.get('/api/:envId/partners/:id/all-tasks', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      
      console.log(`Fetching all tasks for partner ${partnerId} in environment ${envId}`);
      
      // Use simple parameterized SQL queries instead of complex Drizzle templates
      const envPool = pool;
      
      // Query 1: Direct partner tasks
      const partnerTasksQuery = `
        SELECT 
          t.id, 
          t.title, 
          t.description,
          t.priority,
          COALESCE(t.completed, false) as completed,
          COALESCE(t.visible_to_partner, false) as visible_to_partner,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          u.name as author_name,
          'partner' as source_type,
          p.name as source_name,
          $1 as source_id
        FROM ${envId}.activity_tasks t
        LEFT JOIN ${envId}.users u ON t.assigned_to = u.id
        LEFT JOIN ${envId}.partners p ON p.id = $1
        WHERE t.partner_id = $1
      `;
      
      // Query 2: Tasks from opportunities connected to this partner
      const opportunityTasksQuery = `
        SELECT 
          t.id, 
          t.title, 
          t.description,
          t.priority,
          COALESCE(t.completed, false) as completed,
          COALESCE(t.visible_to_partner, false) as visible_to_partner,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          u.name as author_name,
          'opportunity' as source_type,
          o.title as source_name,
          o.id as source_id
        FROM ${envId}.activity_tasks t
        LEFT JOIN ${envId}.users u ON t.assigned_to = u.id
        LEFT JOIN ${envId}.opportunities o ON t.entity_id = o.id
        WHERE t.entity_type = 'opportunity' AND o.partner_id = $1
      `;
      
      // Query 3: Tasks from customers connected to this partner through opportunities
      const customerTasksQuery = `
        SELECT 
          t.id, 
          t.title, 
          t.description,
          t.priority,
          COALESCE(t.completed, false) as completed,
          COALESCE(t.visible_to_partner, false) as visible_to_partner,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          u.name as author_name,
          'customer' as source_type,
          c.name as source_name,
          c.id as source_id
        FROM ${envId}.activity_tasks t
        LEFT JOIN ${envId}.users u ON t.assigned_to = u.id
        LEFT JOIN ${envId}.customers c ON t.entity_id = c.id
        LEFT JOIN ${envId}.opportunities o ON o.client_id = c.id
        WHERE t.entity_type = 'customer' AND o.partner_id = $1
      `;
      
      // Execute all queries
      const [partnerTasks, opportunityTasks, customerTasks] = await Promise.all([
        envPool.query(partnerTasksQuery, [partnerId]),
        envPool.query(opportunityTasksQuery, [partnerId]),
        envPool.query(customerTasksQuery, [partnerId])
      ]);
      
      // Combine and sort all results
      const allTasks = [
        ...partnerTasks.rows,
        ...opportunityTasks.rows,
        ...customerTasks.rows
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log(`Found ${allTasks.length} total tasks for partner ${partnerId}`);
      console.log(`- Partner tasks: ${partnerTasks.rows.length}`);
      console.log(`- Opportunity tasks: ${opportunityTasks.rows.length}`);
      console.log(`- Customer tasks: ${customerTasks.rows.length}`);
      
      res.json(allTasks);
    } catch (error) {
      console.error('Error fetching all partner tasks:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  // Get all related tasks for a specific customer (from customer and related opportunities)
  app.get('/api/:envId/customers/:id/all-tasks', async (req, res) => {
    try {
      const envId = req.params.envId;
      const customerId = parseInt(req.params.id);
      
      console.log(`Fetching all tasks for customer ${customerId} in environment ${envId}`);
      
      // Use simple parameterized SQL queries instead of complex Drizzle templates
      const envPool = pool;
      
      // Query 1: Direct customer tasks
      const customerTasksQuery = `
        SELECT 
          t.id, 
          t.title, 
          t.description,
          t.priority,
          COALESCE(t.completed, false) as completed,
          COALESCE(t.visible_to_partner, false) as visible_to_partner,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          u.name as author_name,
          'customer' as source_type,
          c.name as source_name,
          $1 as source_id
        FROM ${envId}.activity_tasks t
        LEFT JOIN ${envId}.users u ON t.assigned_to = u.id
        LEFT JOIN ${envId}.customers c ON c.id = $1
        WHERE t.entity_type = 'customer' AND t.entity_id = $1
      `;
      
      // Query 2: Tasks from opportunities connected to this customer
      const opportunityTasksQuery = `
        SELECT 
          t.id, 
          t.title, 
          t.description,
          t.priority,
          COALESCE(t.completed, false) as completed,
          COALESCE(t.visible_to_partner, false) as visible_to_partner,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          u.name as author_name,
          'opportunity' as source_type,
          o.title as source_name,
          o.id as source_id
        FROM ${envId}.activity_tasks t
        LEFT JOIN ${envId}.users u ON t.assigned_to = u.id
        LEFT JOIN ${envId}.opportunities o ON t.entity_id = o.id
        JOIN ${envId}.customer_opportunities co ON o.id = co.opportunity_id
        WHERE t.entity_type = 'opportunity' AND co.customer_id = $1
      `;
      
      // Execute all queries
      const [customerTasks, opportunityTasks] = await Promise.all([
        envPool.query(customerTasksQuery, [customerId]),
        envPool.query(opportunityTasksQuery, [customerId])
      ]);
      
      // Combine and sort all results
      const allTasks = [
        ...customerTasks.rows,
        ...opportunityTasks.rows
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log(`Found ${allTasks.length} total tasks for customer ${customerId}`);
      console.log(`- Customer tasks: ${customerTasks.rows.length}`);
      console.log(`- Opportunity tasks: ${opportunityTasks.rows.length}`);
      
      res.json(allTasks);
    } catch (error) {
      console.error('Error fetching all customer tasks:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  // Get next best actions for a specific partner
  app.get('/api/:envId/partners/:id/next-actions', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      
      // Return empty array for now since we generate actions on-demand
      // Actions are created when user clicks "Generate Next Best Action"
      res.json([]);
    } catch (error) {
      console.error('Error fetching next best actions:', error);
      res.status(500).json({ error: 'Failed to fetch next best actions' });
    }
  });

  // Generate AI actions for a partner
  app.post('/api/:envId/partners/:id/generate-actions', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      console.log(`Generating AI actions for partner ${partnerId}`);

      // Get partner basic information
      const partnerResult = await pool.query(`
        SELECT * FROM degoudse.partners WHERE id = $1
      `, [partnerId]);

      if (partnerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Partner not found' });
      }

      const partner = partnerResult.rows[0];

      // Get current tasks and activities
      const tasksResult = await pool.query(`
        SELECT * FROM degoudse.activity_tasks 
        WHERE partner_id = $1 AND completed = false
        ORDER BY created_at DESC
        LIMIT 10
      `, [partnerId]);

      // Get recent opportunities
      const opportunitiesResult = await pool.query(`
        SELECT * FROM degoudse.opportunities 
        WHERE partner_id = $1
        ORDER BY created_at DESC
        LIMIT 5
      `, [partnerId]);

      // Get customer portfolio for context
      const customersResult = await pool.query(`
        SELECT c.*, COUNT(o.id) as opportunity_count
        FROM degoudse.customers c
        INNER JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN degoudse.opportunities o ON c.id = o."clientId"
        WHERE pc.partner_id = $1
        GROUP BY c.id
        ORDER BY opportunity_count DESC
        LIMIT 10
      `, [partnerId]);

      // Get recent completed tasks for performance analysis
      const completedTasksResult = await pool.query(`
        SELECT * FROM degoudse.activity_tasks 
        WHERE partner_id = $1 AND completed = true
        ORDER BY updated_at DESC
        LIMIT 5
      `, [partnerId]);

      // Fetch real-time market data about the company
      let marketIntelligence = null;
      try {
        const searchQuery = `${partner.name} insurance broker Netherlands news 2024 2025`;
        
        const webSearchResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a market intelligence analyst. Provide recent market context and industry insights for insurance companies and brokers in the Netherlands. Focus on market trends, regulatory changes, competitive landscape, and business opportunities."
              },
              {
                role: "user",
                content: `Provide market intelligence and recent industry context for ${partner.name}, an insurance broker in the Netherlands. Include market trends, regulatory changes, competitive positioning, and potential business opportunities in the Dutch insurance market for 2024-2025.`
              }
            ],
            max_tokens: 800,
            temperature: 0.7
          })
        });

        if (webSearchResponse.ok) {
          const webResult = await webSearchResponse.json();
          marketIntelligence = webResult.choices[0].message.content;
        }
      } catch (error) {
        console.log('Market intelligence fetch failed, continuing without external data');
      }

      const actionData = {
        partner: {
          name: partner.name,
          description: partner.description,
          status: partner.status,
          region: partner.region,
          id: partner.id
        },
        currentTasks: tasksResult.rows,
        completedTasks: completedTasksResult.rows,
        recentOpportunities: opportunitiesResult.rows,
        customerPortfolio: customersResult.rows,
        marketIntelligence: marketIntelligence,
        timestamp: new Date().toISOString()
      };

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: `You are an expert insurance market analyst and account management strategist. Generate 4-6 highly actionable next best actions for insurance account managers based on comprehensive partner analysis, market intelligence, and portfolio insights.

Analyze the partner's:
- Current task performance and completion patterns
- Customer portfolio composition and opportunity trends
- Market positioning and competitive landscape
- Recent industry developments and regulatory changes
- Growth opportunities and potential risks

Respond with JSON in this exact format:
{
  "marketSummary": "Brief 2-3 sentence summary of current market context and partner positioning",
  "actions": [
    {
      "id": 1,
      "title": "Action Title",
      "description": "Detailed actionable description with specific steps and expected outcomes",
      "priority": "High|Medium|Low",
      "category": "Strategic|Operational|Relationship|Analysis|Compliance|Growth",
      "timeframe": "This Week|This Month|Next Quarter",
      "reasoning": "Strategic rationale with market context and business impact",
      "expectedOutcome": "Specific measurable result or benefit"
    }
  ]
}

Prioritize actions that:
1. Address immediate business-critical tasks and deadlines
2. Capitalize on current market opportunities and trends
3. Strengthen partner relationships and portfolio growth
4. Ensure regulatory compliance and risk mitigation
5. Leverage competitive advantages and market positioning`
            },
            {
              role: "user",
              content: `Generate next best actions for partner at ${new Date().toISOString()}\n\n${JSON.stringify(actionData, null, 2)}`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text();
        console.error('OpenAI API error:', errorData);
        return res.status(500).json({ error: 'Failed to generate AI actions' });
      }

      const aiResult = await openaiResponse.json();
      const actions = JSON.parse(aiResult.choices[0].message.content);

      console.log('=== GENERATED AI ACTIONS ===');
      console.log(`Partner: ${partner.name}`);
      console.log('Actions:', actions);
      console.log('=== END ACTIONS ===');

      res.json(actions);

    } catch (error) {
      console.error('Error generating AI actions:', error);
      res.status(500).json({ error: 'Failed to generate AI actions' });
    }
  });

  // Create a new task for a partner
  app.post('/api/:envId/partners/:id/tasks', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      const { title, description, priority, visible_to_partner, assigned_to } = req.body;
      
      const envPool = getEnvironmentPool(envId);
      const result = await envPool.query(`
        INSERT INTO ${envId}.activity_tasks 
        (partner_id, title, description, priority, visible_to_partner, assigned_to, completed)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [partnerId, title, description || null, priority || 'medium', visible_to_partner || false, assigned_to || null, false]);
      
      // Sync to linked partner if this is Mevas BV or De Goudse
      if (partnerId === 12 || partnerId === 4) {
        const syncPartnerId = partnerId === 12 ? 4 : 12;
        try {
          await envPool.query(`
            INSERT INTO ${envId}.activity_tasks 
            (partner_id, title, description, priority, visible_to_partner, assigned_to, completed, synced_from_partner_id, is_synced)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [syncPartnerId, title, description || null, priority || 'medium', visible_to_partner || false, assigned_to || null, false, partnerId, true]);
          console.log(`Synced task from partner ${partnerId} to partner ${syncPartnerId}`);
        } catch (syncError) {
          console.error('Error syncing task:', syncError);
        }
      }
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // Create a new comment for a partner
  app.post('/api/:envId/partners/:id/comments', async (req, res) => {
    try {
      const envId = req.params.envId;
      const partnerId = parseInt(req.params.id);
      const { content, visible_to_partner, user_id } = req.body;
      
      const envPool = getEnvironmentPool(envId);
      const result = await envPool.query(`
        INSERT INTO ${envId}.activity_comments 
        (partner_id, content, visible_to_partner, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [partnerId, content, visible_to_partner || false, user_id || 1]);
      
      // Sync to linked partner if this is Mevas BV or De Goudse
      if (partnerId === 12 || partnerId === 4) {
        const syncPartnerId = partnerId === 12 ? 4 : 12;
        try {
          await envPool.query(`
            INSERT INTO ${envId}.activity_comments 
            (partner_id, content, visible_to_partner, user_id, synced_from_partner_id, is_synced)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [syncPartnerId, content, visible_to_partner || false, user_id || 1, partnerId, true]);
          console.log(`Synced comment from partner ${partnerId} to partner ${syncPartnerId}`);
        } catch (syncError) {
          console.error('Error syncing comment:', syncError);
        }
      }
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  // Update task completion status
  app.patch('/api/:envId/tasks/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const taskId = parseInt(req.params.id);
      const { completed } = req.body;
      
      // Get the task to check if it needs syncing
      const taskResult = await db.execute(sql`
        SELECT * FROM ${sql.identifier(envId)}.activity_tasks WHERE id = ${taskId}
      `);
      
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const task = taskResult.rows[0];
      
      const result = await db.execute(sql`
        UPDATE ${sql.identifier(envId)}.activity_tasks 
        SET completed = ${completed}, completed_at = ${completed ? new Date().toISOString() : null}
        WHERE id = ${taskId}
        RETURNING *
      `);
      
      // Sync completion status to linked partner if this is Mevas BV or De Goudse
      if ((task.partner_id === 12 || task.partner_id === 4) && !task.is_synced) {
        const syncPartnerId = task.partner_id === 12 ? 4 : 12;
        try {
          await db.execute(sql`
            UPDATE ${sql.identifier(envId)}.activity_tasks 
            SET completed = ${completed}, completed_at = ${completed ? new Date().toISOString() : null}
            WHERE partner_id = ${syncPartnerId} 
            AND title = ${task.title} 
            AND synced_from_partner_id = ${task.partner_id}
            AND is_synced = true
          `);
          console.log(`Synced task completion from partner ${task.partner_id} to partner ${syncPartnerId}`);
        } catch (syncError) {
          console.error('Error syncing task completion:', syncError);
        }
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
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
        INNER JOIN myqollabi.partner_opportunities po ON p.id = po.partnerId
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

  // Get distinct filter values for partners
  app.get('/api/degoudse/partners/filter-options', async (req, res) => {
    try {
      const envPool = pool;
      
      // Get distinct values for all filter fields
      const [statusResult, regionResult, locationResult] = await Promise.all([
        envPool.query(`SELECT DISTINCT status FROM degoudse.partners WHERE status IS NOT NULL AND status != '' ORDER BY status`),
        envPool.query(`SELECT DISTINCT region FROM degoudse.partners WHERE region IS NOT NULL AND region != '' ORDER BY region`),
        envPool.query(`SELECT DISTINCT location FROM degoudse.partners WHERE location IS NOT NULL AND location != '' ORDER BY location`)
      ]);
      
      const filterOptions = {
        statuses: statusResult.rows.map(row => row.status),
        regions: regionResult.rows.map(row => row.region),
        locations: locationResult.rows.map(row => row.location)
      };
      
      console.log('Partner filter options:', filterOptions);
      res.json(filterOptions);
    } catch (error) {
      console.error('Error fetching partner filter options:', error);
      res.status(500).json({ error: 'Failed to fetch filter options' });
    }
  });

  // Get distinct filter values for customers related to a specific partner
  app.get('/api/degoudse/partners/:id/customers/filter-options', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      
      // Return empty filter options since customers table doesn't have status/industry columns
      const filterOptions = {
        statuses: []
      };
      
      console.log(`Customer filter options for partner ${partnerId}:`, filterOptions);
      res.json(filterOptions);
    } catch (error) {
      console.error('Error fetching customer filter options:', error);
      res.status(500).json({ error: 'Failed to fetch customer filter options' });
    }
  });

  // Users endpoint for fetching user information
  app.get('/api/degoudse/users', async (req, res) => {
    try {
      const envPool = pool;
      const result = await envPool.query(`
        SELECT id, name, email, role, partner_id, created_at, updated_at
        FROM degoudse.users
        WHERE id IS NOT NULL
        ORDER BY id
      `);
      
      const users = result.rows.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        partner_id: user.partner_id,
        initials: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
      
      console.log(`Returning ${users.length} users from De Goudse database`);
      res.json(users);
    } catch (error) {
      console.error('Error fetching De Goudse users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // De Goudse environment API routes (using proper database isolation)
  app.get('/api/degoudse/partners', async (req, res) => {
    try {
      const envPool = pool;
      
      // Direct query with relationship counts from opportunities table, excluding original seed partners except partner 4 (De Goudse)
      const result = await envPool.query(`
        SELECT p.id, p.name, p.description, p.status, p.location, p.contact_email, 
               p.primary_contact, p.region, p.assigned_user_ids, p.owner_id,
               p.linked_opportunity_ids, p.created_at, p.updated_at,
               u.name as owner_name,
               COALESCE(rel.opportunity_count, 0) as opportunity_count,
               COALESCE(pc_rel.customer_count, 0) as customer_count,
               COALESCE(rel.total_opportunity_value, 0) as total_opportunity_value,
               COALESCE(rel.total_weighted_value, 0) as total_weighted_value,
               COALESCE(contact_rel.contact_count, 0) as contact_count
        FROM degoudse.partners p
        LEFT JOIN degoudse.users u ON p.owner_id = u.id
        LEFT JOIN (
          SELECT "partnerId", 
                 COUNT(*) as opportunity_count,
                 SUM(COALESCE("estimatedValue", 0)) as total_opportunity_value,
                 SUM(COALESCE("estimatedValue", 0) * COALESCE(probability, 0) / 100.0) as total_weighted_value
          FROM degoudse.opportunities 
          WHERE "partnerId" IS NOT NULL AND id > 16
          GROUP BY "partnerId"
        ) rel ON p.id = rel."partnerId"
        LEFT JOIN (
          SELECT partner_id,
                 COUNT(DISTINCT customer_id) as customer_count
          FROM degoudse.partner_customers
          GROUP BY partner_id
        ) pc_rel ON p.id = pc_rel.partner_id
        LEFT JOIN (
          SELECT COUNT(*) as contact_count, 'placeholder' as partner_reference
          FROM degoudse.contacts 
          WHERE is_active = true
        ) contact_rel ON 1=1
        WHERE p.status = 'active' OR p.status IS NULL
        ORDER BY p.id
      `);
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        initials: partner.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
        industry: getIndustryFromDescription(partner.description || ''),
        type: getTypeFromDescription(partner.description || ''),
        size: getSizeFromDescription(partner.description || ''),
        status: partner.status,
        customerCount: parseInt(partner.customer_count) || 0,
        opportunityCount: parseInt(partner.opportunity_count) || 0,
        customers: parseInt(partner.customer_count) || 0,
        opportunities: parseInt(partner.opportunity_count) || 0,
        contacts: parseInt(partner.contact_count) || 0,
        opportunity_value: parseFloat(partner.total_opportunity_value) || 0,
        weighted_opportunity_value: parseFloat(partner.total_weighted_value) || 0,
        location: partner.location,
        contactEmail: partner.contact_email,
        primaryContact: partner.primary_contact,
        partner_type: partner.partner_type,
        region: partner.region,
        assigned_user_ids: partner.assigned_user_ids,
        linked_opportunity_ids: partner.linked_opportunity_ids,
        createdAt: partner.created_at,
        updatedAt: partner.updated_at,
        customerNames: '',
        owner_name: partner.owner_name
      }));
      
      console.log(`Returning ${partners.length} partners with relationship counts from degoudse schema`);
      res.json(partners);
    } catch (error) {
      console.error('Error fetching De Goudse partners:', error);
      res.status(500).json({ error: 'Failed to fetch partners' });
    }
  });

  // Get customers for a specific product
  app.get('/api/degoudse/products/:id/customers', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT 
          c.id,
          c.name,
          c.description,
          cp.premium_value,
          cp.premium_percentage,
          cp.discount_percentage,
          cp.contract_start_date,
          cp.contract_end_date,
          cp.status
        FROM degoudse.customers c
        INNER JOIN degoudse.customer_products cp ON c.id = cp.customer_id
        WHERE cp.product_id = $1
        ORDER BY c.name ASC
      `, [productId]);
      
      console.log(`Returning ${result.rows.length} customers for product ${productId}`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching product customers:', error);
      res.status(500).json({ error: 'Failed to fetch product customers' });
    }
  });

  // De Goudse relationship endpoints
  app.get('/api/degoudse/partners/:id/customers', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT DISTINCT c.id, c.name, c.description,
               COUNT(o.id) as opportunity_count
        FROM degoudse.customers c
        INNER JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN degoudse.opportunities o ON c.id = o.client_id
        WHERE pc.partner_id = $1
        GROUP BY c.id, c.name, c.description
        ORDER BY c.id
      `, [partnerId]);
      
      const customers = result.rows.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        description: customer.description,
        opportunityCount: parseInt(customer.opportunity_count) || 0
      }));
      
      console.log(`Partner ${partnerId} customers query returned ${customers.length} results`);
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
        SELECT o.id, o.title, o.description, o.status, o.stage, o.estimated_value, o.probability,
               o.expected_close_date, o.start_date, o.insurance_description, o.owner_id,
               o.client_id, o.partner_id, o.product_id, o.type, o.created_at, o.updated_at,
               c.name as client_name,
               COUNT(DISTINCT contacts.id) as contact_count,
               am.name as account_manager_name
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.customers c ON o.client_id = c.id
        LEFT JOIN degoudse.contacts contacts ON contacts.linked_entity_id = c.id AND contacts.linked_entity_type = 'customer'
        LEFT JOIN degoudse.users am ON o.owner_id = am.id
        WHERE o.partner_id = $1 AND o.id > 16
        GROUP BY o.id, o.title, o.description, o.status, o.stage, o.estimated_value, o.probability,
                 o.expected_close_date, o.start_date, o.insurance_description, o.owner_id, 
                 o.client_id, o.partner_id, o.product_id, o.type, 
                 o.created_at, o.updated_at, c.name, am.name
        ORDER BY o.id
      `, [partnerId]);
      
      const opportunities = result.rows.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        status: opp.status,
        stage: opp.stage,
        estimated_value: opp.estimated_value || opp.estimatedValue,
        probability: opp.probability,
        clientName: opp.client_name,
        expected_close_date: opp.expected_close_date,
        start_date: opp.start_date,
        insurance_description: opp.insurance_description,
        account_manager_name: opp.account_manager_name,
        contactCount: parseInt(opp.contact_count) || 0
      }));
      
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching De Goudse partner opportunities:', error);
      res.status(500).json({ error: 'Failed to fetch partner opportunities' });
    }
  });

  // Get filter options for partner opportunities
  app.get('/api/degoudse/partners/:id/opportunities/filters', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      
      console.log(`Fetching filter options for partner ${partnerId} opportunities from De Goudse database`);
      
      // Get unique stages
      const stagesResult = await envPool.query(`
        SELECT DISTINCT o.stage
        FROM degoudse.opportunities o
        WHERE o.partner_id = $1 AND o.stage IS NOT NULL
        ORDER BY o.stage
      `, [partnerId]);
      
      // Get unique customers
      const customersResult = await envPool.query(`
        SELECT DISTINCT c.name as customer_name
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.customers c ON o.client_id = c.id
        WHERE o.partner_id = $1 AND c.name IS NOT NULL
        ORDER BY c.name
      `, [partnerId]);
      
      // Get unique account managers
      const accountManagersResult = await envPool.query(`
        SELECT DISTINCT u.name as account_manager_name
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.users u ON o.owner_id = u.id
        WHERE o.partner_id = $1 AND u.name IS NOT NULL
        ORDER BY u.name
      `, [partnerId]);
      
      // Get unique insurance descriptions
      const insuranceDescriptionsResult = await envPool.query(`
        SELECT DISTINCT o.insurance_description
        FROM degoudse.opportunities o
        WHERE o.partner_id = $1 AND o.insurance_description IS NOT NULL
        ORDER BY o.insurance_description
      `, [partnerId]);
      
      const filterOptions = {
        stages: stagesResult.rows.map(row => row.stage),
        customers: customersResult.rows.map(row => row.customer_name),
        accountManagers: accountManagersResult.rows.map(row => row.account_manager_name),
        insuranceDescriptions: insuranceDescriptionsResult.rows.map(row => row.insurance_description)
      };
      
      console.log(`Filter options for partner ${partnerId}:`, filterOptions);
      res.json(filterOptions);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      res.status(500).json({ error: 'Failed to fetch filter options' });
    }
  });

  app.get('/api/degoudse/partners/:id/products', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      // Get products through proper product assignments, not through opportunities
      const result = await envPool.query(`
        SELECT DISTINCT p.id, p.name, p.description, p.category,
               p.created_at, p.updated_at
        FROM degoudse.products p
        INNER JOIN degoudse.partner_products pp ON p.id = pp.product_id
        WHERE pp.partner_id = $1
        ORDER BY p.name
      `, [partnerId]);
      
      const products = result.rows.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        created_at: product.created_at,
        updated_at: product.updated_at
      }));
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching De Goudse partner products:', error);
      res.status(500).json({ error: 'Failed to fetch partner products' });
    }
  });

  // Get customers for a specific product within a partner context
  app.get('/api/:envId/partners/:partnerId/products/:productId/customers', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const productId = parseInt(req.params.productId);
      const envId = req.params.envId;
      
      console.log(`Getting customers for product ${productId} in partner ${partnerId} context`);
      
      const envPool = pool;
      
      // Get customers who have this product and are associated with this partner
      const result = await envPool.query(`
        SELECT DISTINCT 
          c.id,
          c.name,
          c.description,
          c.status,
          cpa.premium_value as potential_value,
          cpa.premium_percentage,
          cpa.discount_percentage,
          cpa.contract_start_date,
          cpa.contract_end_date,
          cpa.status as contract_status
        FROM ${envId}.customers c
        INNER JOIN ${envId}.partner_customers pc ON c.id = pc.customer_id
        INNER JOIN ${envId}.customer_product_assignments cpa ON c.id = cpa.customer_id
        INNER JOIN ${envId}.product_templates pt ON cpa.product_template_id = pt.id
        WHERE pc.partner_id = $1 
          AND pt.id = $2 
          AND cpa.is_active = true
        ORDER BY c.name ASC
      `, [partnerId, productId]);
      
      console.log(`Found ${result.rows.length} customers for product ${productId} in partner ${partnerId} context`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching product customers for partner:', error);
      res.status(500).json({ error: 'Failed to fetch product customers' });
    }
  });

  // Get individual customer details in De Goudse environment
  app.get('/api/degoudse/customers/:id', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      if (isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const envPool = pool;
      const result = await envPool.query(`
        SELECT c.id, c.name, c.description, c.status, c.industry, c.owner_id, c.created_at, c.updated_at,
               u.name as owner_name,
               COUNT(DISTINCT o.id) as opportunity_count,
               COUNT(DISTINCT CASE WHEN o.partner_id IS NOT NULL THEN o.partner_id END) as partner_count,
               COALESCE(SUM(o.estimated_value), 0) as total_pipeline_value
        FROM degoudse.customers c
        LEFT JOIN degoudse.users u ON c.owner_id = u.id
        LEFT JOIN degoudse.opportunities o ON c.id = o.client_id
        WHERE c.id = $1
        GROUP BY c.id, c.name, c.description, c.status, c.industry, c.owner_id, c.created_at, c.updated_at, u.name
      `, [customerId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      const customer = result.rows[0];
      const customerData = {
        id: customer.id,
        name: customer.name,
        description: customer.description,
        status: customer.status,
        industry: customer.industry,
        ownerId: customer.owner_id,
        ownerName: customer.owner_name,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        opportunityCount: parseInt(customer.opportunity_count) || 0,
        partnerCount: parseInt(customer.partner_count) || 0,
        totalPipelineValue: parseFloat(customer.total_pipeline_value) || 0
      };
      
      res.json(customerData);
    } catch (error) {
      console.error('Error fetching De Goudse customer:', error);
      res.status(500).json({ error: 'Failed to fetch customer' });
    }
  });

  app.get('/api/degoudse/customers/:id/partners', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      if (isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const envPool = pool;
      const result = await envPool.query(`
        SELECT DISTINCT p.id, p.name, p.description, p.status, p.location, p.contact_email, p.primary_contact
        FROM degoudse.partners p
        INNER JOIN degoudse.partner_customers pc ON p.id = pc.partner_id
        WHERE pc.customer_id = $1
        ORDER BY p.id
      `, [customerId]);
      
      console.log(`Customer ${customerId} partners query returned ${result.rows.length} results`);
      
      const partners = result.rows.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        description: partner.description,
        status: partner.status,
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
      if (isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const envPool = pool;
      const result = await envPool.query(`
        SELECT o.id, o.title, o.client_id, o.product_id, o.probability, o.estimated_value, o.type, o.status, o.stage, o.owner_id, o.description, o.partner_id, o.created_at, o.updated_at, o.expected_close_date, 
               p.name as partner_name
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.partners p ON o.partner_id = p.id
        WHERE o.client_id = $1
        ORDER BY o.id
      `, [customerId]);
      
      const opportunities = result.rows.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        status: opp.status,
        stage: opp.stage,
        estimated_value: opp.estimated_value,
        probability: opp.probability,
        partnerName: opp.partner_name,
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
      if (isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
      const envPool = pool;
      const result = await envPool.query(`
        SELECT DISTINCT p.*, v.name as vendor_name
        FROM degoudse.products p
        LEFT JOIN degoudse.vendors v ON p.vendor_id = v.id
        INNER JOIN degoudse.product_customers pc ON p.id = pc.product_id
        WHERE pc.customer_id = $1
        ORDER BY p.category, p.name
      `, [customerId]);
      
      const products = result.rows.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        premium_value: product.premium_value,
        premium_percentage: product.premium_percentage,
        discount_percentage: product.discount_percentage,
        contract_start_date: product.contract_start_date,
        contract_end_date: product.contract_end_date,
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
      if (isNaN(customerId)) {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
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
        INNER JOIN degoudse.opportunities o ON pr.id = o.product_id
        WHERE o.id = $1
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

  // Extract meeting preparation data for AI analysis
  app.get('/api/degoudse/partners/:id/meeting-data', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      
      console.log(`Extracting meeting data for partner ${partnerId}`);
      
      // Get partner basic info
      const partnerResult = await envPool.query(`
        SELECT id, name, description, status, location, region, primary_contact
        FROM degoudse.partners 
        WHERE id = $1
      `, [partnerId]);
      
      if (partnerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      
      const partner = partnerResult.rows[0];
      
      // Get all OKRs assigned to this partner
      const okrResult = await envPool.query(`
        SELECT 
          om.id,
          om.name,
          om.description,
          om.realized_value,
          om.target_value,
          om.ytd_value,
          om.last_year_value,
          om.measure_unit,
          om.currency_type,
          om.frequency,
          om.hierarchy,
          om.tags,
          om.timeframe_start,
          om.timeframe_end,
          ta.assigned_at,
          ta.status as assignment_status,
          ta.due_date,
          ta.notes
        FROM degoudse.okr_template_assignments ta
        LEFT JOIN degoudse.okr_metrics om ON ta.template_id = om.id
        WHERE ta.entity_type = 'partner' AND ta.entity_id = $1
        ORDER BY ta.assigned_at DESC
      `, [partnerId]);
      
      // Get all opportunities for this partner
      const opportunitiesResult = await envPool.query(`
        SELECT 
          o.id,
          o.title,
          o.description,
          o.stage,
          o.estimatedValue,
          o.probability,
          o.insurance_description,
          o.createdAt,
          o.updatedAt,
          c.name as customer_name,
          c.description as customer_description,
          u.name as account_manager_name
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.customers c ON o.clientId = c.id
        LEFT JOIN degoudse.users u ON o.ownerId = u.id
        WHERE o.partnerId = $1 AND o.id > 16
        ORDER BY o.estimatedValue DESC, o.createdAt DESC
      `, [partnerId]);
      
      // Structure the data for AI analysis - optimized for reasoning
      const meetingData = {
        partner: {
          name: partner.name,
          description: partner.description,
          status: partner.status,
          location: partner.location,
          region: partner.region,
          primary_contact: partner.primary_contact
        },
        okrs: okrResult.rows.map(okr => {
          const realizedValue = parseFloat(okr.realized_value) || 0;
          const targetValue = parseFloat(okr.target_value) || 0;
          const progressRatio = targetValue > 0 ? (realizedValue / targetValue) : 0;
          const progressPercent = Math.round(progressRatio * 100);
          
          return {
            name: okr.name,
            description: okr.description,
            target_value: targetValue,
            realized_value: realizedValue,
            measure_unit: okr.measure_unit,
            interpreted_progress: `${progressPercent}% of ${targetValue}${okr.measure_unit ? ' ' + okr.measure_unit : ''} target`,
            assignment_status: okr.assignment_status,
            tags: okr.tags,
            due_date: okr.due_date,
            notes: okr.notes
          };
        }),
        opportunities: opportunitiesResult.rows.map(opp => {
          const opportunity = {
            title: opp.title,
            stage: opp.stage,
            estimated_value: opp.estimated_value,
            probability: opp.probability,
            weighted_value: (opp.estimated_value || 0) * (opp.probability || 0) / 100,
            insurance_type: opp.insurance_description,
            customer: opp.customer_name,
            account_manager: opp.account_manager_name
          };
          
          // Only include description if it has actual content
          if (opp.description && opp.description.trim()) {
            opportunity.description = opp.description;
          }
          
          return opportunity;
        })
      };
      
      res.json(meetingData);
    } catch (error) {
      console.error('Error extracting meeting data:', error);
      res.status(500).json({ error: 'Failed to extract meeting data' });
    }
  });

  // AI-powered meeting preparation endpoint
  app.post('/api/degoudse/partners/:id/prepare-meeting', async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.id);
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      console.log(`Preparing AI meeting briefing for partner ${partnerId}`);

      // Get the meeting data using the same logic as the meeting-data endpoint
      const partnerResult = await pool.query(`
        SELECT * FROM degoudse.partners WHERE id = $1
      `, [partnerId]);

      if (partnerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Partner not found' });
      }

      const partner = partnerResult.rows[0];

      // Get OKRs (they are global, not partner-specific)
      const okrResult = await pool.query(`
        SELECT * FROM degoudse.okr_metrics 
        ORDER BY created_at DESC
        LIMIT 10
      `);

      // Get opportunities for this partner (excluding seed data)
      const opportunitiesResult = await pool.query(`
        SELECT 
          o.*,
          c.name as customer_name,
          u.name as account_manager_name
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.customers c ON o.clientId = c.id
        LEFT JOIN degoudse.users u ON o.ownerId = u.id
        WHERE o.partnerId = $1 AND o.id > 16
        ORDER BY o.estimatedValue DESC, o.createdAt DESC
      `, [partnerId]);

      // Structure the data for AI analysis - same as meeting-data endpoint
      const meetingData = {
        partner: {
          name: partner.name,
          description: partner.description,
          status: partner.status,
          location: partner.location,
          region: partner.region,
          primary_contact: partner.primary_contact
        },
        okrs: okrResult.rows.map(okr => {
          // Parse European formatted numbers (replace commas with periods, remove currency/percent symbols)
          const parseEuropeanNumber = (value: string) => {
            if (!value) return 0;
            const cleanValue = value.toString()
              .replace(/[€%\s]/g, '') // Remove currency and percent symbols
              .replace(/\./g, '') // Remove thousand separators (periods)
              .replace(/,/g, '.'); // Replace decimal comma with period
            return parseFloat(cleanValue) || 0;
          };

          const ytdValue = parseEuropeanNumber(okr.ytd_value);
          const lastYearValue = parseEuropeanNumber(okr.last_year_value);
          const realizedValue = parseEuropeanNumber(okr.realized_value);
          const targetValue = parseEuropeanNumber(okr.target_value);
          
          let progressPercent = 0;
          let interpretedProgress = '';
          
          // For OKRs with YTD data, calculate year-over-year progress
          if (ytdValue > 0 || lastYearValue > 0) {
            if (lastYearValue > 0) {
              const yoyRatio = ytdValue / lastYearValue;
              progressPercent = Math.round(yoyRatio * 100);
              const growthText = ytdValue > lastYearValue ? 'growth' : 'decline';
              interpretedProgress = `${progressPercent}% vs last year (${ytdValue} vs ${lastYearValue}) - ${growthText}`;
            } else {
              interpretedProgress = `${ytdValue}${okr.measure_unit ? ' ' + okr.measure_unit : ''} YTD`;
            }
          } else if (targetValue > 0) {
            // Fallback to traditional progress calculation
            const progressRatio = realizedValue / targetValue;
            progressPercent = Math.round(progressRatio * 100);
            interpretedProgress = `${progressPercent}% of ${targetValue}${okr.measure_unit ? ' ' + okr.measure_unit : ''} target`;
          } else {
            interpretedProgress = `${realizedValue}${okr.measure_unit ? ' ' + okr.measure_unit : ''} current value`;
          }
          
          return {
            name: okr.name,
            description: okr.description,
            target_value: targetValue,
            realized_value: realizedValue,
            ytd_value: ytdValue,
            last_year_value: lastYearValue,
            measure_unit: okr.measure_unit,
            interpreted_progress: interpretedProgress,
            progress_percent: progressPercent,
            assignment_status: okr.assignment_status,
            tags: okr.tags,
            due_date: okr.due_date,
            notes: okr.notes
          };
        }),
        opportunities: opportunitiesResult.rows.map(opp => {
          const opportunity = {
            title: opp.title,
            stage: opp.stage,
            estimated_value: opp.estimated_value,
            probability: opp.probability,
            weighted_value: (opp.estimated_value || 0) * (opp.probability || 0) / 100,
            insurance_type: opp.insurance_description,
            customer: opp.customer_name,
            account_manager: opp.account_manager_name
          };
          
          // Only include description if it has actual content
          if (opp.description && opp.description.trim()) {
            opportunity.description = opp.description;
          }
          
          return opportunity;
        })
      };

      // Send to OpenAI for analysis
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          temperature: 0.7,
          seed: Math.floor(Math.random() * 1000000),
          messages: [
            {
              role: "system",
              content: `You are assisting an account manager in preparing for an upcoming meeting with a broker.

Current meeting preparation timestamp: ${new Date().toISOString()}

You will receive:
- A list of OKRs (Objectives, Activities, and Subactivities) that the broker is working on with the account manager
- A list of opportunities linked to the broker

Your task:

1. Identify the 3 most relevant OKRs to discuss — those that stand out — and for each, briefly explain **why it should be discussed now**.

CRITICAL: When selecting OKRs, analyze the actual data provided:
- Look at "ytd_value" and "last_year_value" fields, not just "realized_value" and "target_value"
- Look at "interpreted_progress" field for meaningful insights
- Some OKRs may show significant year-over-year growth (e.g., YTD vs Last Year)
- Some may show excellent performance ratios (e.g., 409% conversion rates)

When selecting the top 3 OKRs to review, ensure **strategic diversity**:  
Do **not** select three OKRs simply because they all show 0% progress in "realized_value".

Instead, prioritize a mix such as:
- One OKR with concerning performance or lack of progress
- One OKR showing strong year-over-year improvement or exceptional performance
- One OKR that requires strategic attention or broker collaboration

Each OKR must have a **distinct and specific reason** for being selected. Avoid repetitive logic.

Example of good selection:
- "Omvang Portefeuille" showing 6% growth (€742,301 vs €700,599 last year) - discuss growth strategy
- "Conversieratio" at 409% performance - understand this exceptional success
- "Aantal Unieke Offertes" at 29% - needs immediate attention to improve

IMPORTANT: Vary your selection approach each time. Consider different angles:
- Sometimes focus on metrics with the highest absolute values
- Sometimes prioritize metrics with unusual ratios or percentages
- Sometimes emphasize metrics that show interesting trends
- Always ensure each selected OKR has a unique justification

If the partner has fewer than 3 OKRs:
- Display only the number available.

If the partner has no OKRs:
- Display an empty state:  
  _"No OKRs available for this partner at the moment."_

---

2. Identify the 3 most relevant opportunity types to discuss.

These should highlight:
- Stalled or slow-moving deals
- High-probability or high-value opportunities
- Win/loss patterns, cross-sell potential, or upcoming renewals
- Market shifts or areas the broker specializes in

Note: Common opportunity types include **Zonnepanelen**, **BGB**, and **Zonnepanelen onbekend**.

Vary your focus each time - sometimes emphasize pipeline health, sometimes winning strategies, sometimes risk mitigation.

If the partner has fewer than 3 opportunity types:
- Only show what is available.
If there are none:
- Show an empty state:
  _"No opportunity data available for this partner."_

---

3. Provide **exactly 3 actionable recommendations** for the meeting.

These should:
- Help the account manager guide the discussion
- Be strategic, practical, or coordination-focused
- Not repeat OKRs or opportunity descriptions word-for-word
- Vary in focus each time (strategic planning, tactical execution, relationship building, etc.)

---

💡 Format your output like this:
- Summary paragraph  
- Section: **Top 3 OKRs to Discuss** – up to 3 bullet points  
- Section: **Top 3 Opportunities to Discuss** – up to 3 bullet points  
- Section: **Meeting Recommendations** – exactly 3 bullet points

Keep the tone clear and professional. Focus on what will help the account manager lead a productive, data-driven conversation.`
            },
            {
              role: "user",
              content: `Meeting preparation request at ${new Date().toISOString()}\n\n${JSON.stringify(meetingData, null, 2)}`
            }
          ]
        })
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text();
        console.error('OpenAI API error:', errorData);
        return res.status(500).json({ error: 'Failed to generate meeting briefing' });
      }

      const aiResult = await openaiResponse.json();
      const briefing = aiResult.choices[0].message.content;

      console.log('=== AI MEETING BRIEFING ===');
      console.log(`Partner: ${partner.name}`);
      console.log('---');
      console.log('RAW BRIEFING:');
      console.log(briefing);
      console.log('---');
      console.log('BRIEFING LINES:');
      briefing.split('\n').forEach((line, index) => {
        console.log(`${index}: "${line}"`);
      });
      console.log('=== END BRIEFING ===');

      res.json({
        partner: partner.name,
        briefing: briefing,
        dataUsed: {
          okrs: meetingData.okrs.length,
          opportunities: meetingData.opportunities.length
        }
      });

    } catch (error) {
      console.error('Error preparing meeting briefing:', error);
      res.status(500).json({ error: 'Failed to prepare meeting briefing' });
    }
  });

  // Smart Cross Sell AI analysis endpoint
  app.get('/api/degoudse/:entityType/:id/smart-cross-sell', async (req: Request, res: Response) => {
    console.log('=== SMART CROSS SELL API ENDPOINT HIT ===');
    console.log('Request params:', req.params);
    console.log('Request path:', req.path);
    
    try {
      const entityType = req.params.entityType; // 'partners' or 'customers'
      const entityId = parseInt(req.params.id);
      
      if (!process.env.OPENAI_API_KEY) {
        console.log('OpenAI API key not configured');
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      console.log(`Generating Smart Cross Sell analysis for ${entityType} ${entityId}`);

      // Get entity basic information
      const entityResult = await pool.query(`
        SELECT * FROM degoudse.${entityType} WHERE id = $1
      `, [entityId]);

      if (entityResult.rows.length === 0) {
        return res.status(404).json({ error: `${entityType.slice(0, -1)} not found` });
      }

      const entity = entityResult.rows[0];

      // Get product assignments for this entity
      let productAssignmentsResult;
      if (entityType === 'partners') {
        productAssignmentsResult = await pool.query(`
          SELECT 
            pa.*,
            p.name as product_name,
            p.description as product_description,
            c.name as parent_category_name,
            c.color as category_color,
            p.premium_value,
            p.premium_percentage,
            p.discount_percentage,
            p.contract_start_date,
            p.contract_end_date
          FROM degoudse.partner_products pa
          LEFT JOIN degoudse.products p ON pa.product_id = p.id
          LEFT JOIN degoudse.categories c ON p.category = c.name
          WHERE pa.partner_id = $1
          ORDER BY p.premium_value DESC
        `, [entityId]);
      } else {
        productAssignmentsResult = await pool.query(`
          SELECT 
            pa.*,
            pt.name as product_name,
            pt.description as product_description,
            c.name as parent_category_name,
            c.color as category_color,
            pa.custom_price as premium_value,
            pa.custom_premium_percentage as premium_percentage,
            pa.custom_discount_percentage as discount_percentage,
            pa.customer_contract_start_date as contract_start_date,
            pa.customer_contract_end_date as contract_end_date
          FROM degoudse.customer_product_assignments pa
          LEFT JOIN degoudse.product_templates pt ON pa.product_template_id = pt.id
          LEFT JOIN degoudse.categories c ON pt.category = c.name
          WHERE pa.customer_id = $1 AND pa.is_active = true
          ORDER BY pa.custom_price DESC
        `, [entityId]);
      }

      // Get all available products (to identify gaps)
      const allProductsResult = await pool.query(`
        SELECT 
          p.*,
          c.name as parent_category_name,
          c.color as category_color
        FROM degoudse.products p
        LEFT JOIN degoudse.categories c ON p.category = c.name
        ORDER BY p.id
      `);

      // Get market context - related opportunities and trends
      const opportunitiesResult = await pool.query(`
        SELECT 
          o.*,
          c.name as customer_name,
          p.name as partner_name
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.customers c ON o.client_id = c.id
        LEFT JOIN degoudse.partners p ON o.partner_id = p.id
        WHERE ${entityType === 'partners' ? 'o.partner_id' : 'o.client_id'} = $1
        ORDER BY o.estimated_value DESC
        LIMIT 10
      `, [entityId]);

      // Get related partners/customers for market context
      const relatedEntitiesResult = entityType === 'partners' 
        ? await pool.query(`
            SELECT c.* FROM degoudse.customers c 
            JOIN degoudse.partner_customers pc ON c.id = pc.customer_id 
            WHERE pc.partner_id = $1 
            LIMIT 5
          `, [entityId])
        : await pool.query(`
            SELECT p.* FROM degoudse.partners p 
            JOIN degoudse.partner_customers pc ON p.id = pc.partner_id 
            WHERE pc.customer_id = $1 
            LIMIT 5
          `, [entityId]);

      // Structure data for AI analysis
      const crossSellData = {
        entity: {
          type: entityType.slice(0, -1),
          name: entity.name,
          description: entity.description,
          industry: entity.industry,
          location: entity.location,
          region: entity.region,
          status: entity.status
        },
        currentProducts: productAssignmentsResult.rows.map(pa => ({
          id: entityType === 'partners' ? pa.product_id : pa.product_template_id,
          name: pa.product_name,
          description: pa.product_description,
          category: pa.parent_category_name,
          premiumValue: pa.premium_value || pa.custom_price,
          premiumPercentage: pa.premium_percentage || pa.custom_premium_percentage,
          discountPercentage: pa.discount_percentage || pa.custom_discount_percentage,
          contractStart: pa.contract_start_date || pa.customer_contract_start_date,
          contractEnd: pa.contract_end_date || pa.customer_contract_end_date
        })),
        availableProducts: allProductsResult.rows.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.parent_category_name,
          provider: p.vendor_id, // products table uses vendor_id instead of provider_name
          averagePrice: p.total_value, // using total_value as price reference
          premiumPercentage: p.premium_percentage
        })),
        opportunities: opportunitiesResult.rows.map(o => ({
          title: o.title,
          stage: o.stage,
          estimatedValue: o.estimated_value,
          probability: o.probability,
          insuranceType: o.insurance_description,
          relatedEntity: entityType === 'partners' ? o.customer_name : o.partner_name
        })),
        marketContext: {
          relatedEntities: relatedEntitiesResult.rows.map(e => ({
            name: e.name,
            industry: e.industry,
            description: e.description
          })),
          totalOpportunities: opportunitiesResult.rows.length,
          totalOpportunityValue: opportunitiesResult.rows.reduce((sum, o) => sum + (o.estimated_value || 0), 0)
        }
      };

      // Fetch real-time market intelligence for enhanced analysis
      let marketIntelligence = null;
      try {
        const marketSearchQuery = entity.industry 
          ? `${entity.industry} insurance market trends Netherlands 2024 2025 opportunities`
          : `insurance broker market trends Netherlands 2024 2025 cross-sell opportunities`;
        
        const marketResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a Dutch insurance market intelligence analyst. Provide current market trends, regulatory changes, competitive landscape insights, and growth opportunities for insurance companies in the Netherlands."
              },
              {
                role: "user",
                content: `Provide market intelligence for ${entity.name} in the Dutch insurance market. Focus on: 1) Current market trends in ${entity.industry || 'insurance brokerage'}, 2) Regulatory changes affecting cross-sell opportunities, 3) Competitive positioning insights, 4) Growth opportunities in insurance product categories, 5) Customer behavior trends for 2024-2025.`
              }
            ],
            max_tokens: 600,
            temperature: 0.7
          })
        });

        if (marketResponse.ok) {
          const marketResult = await marketResponse.json();
          marketIntelligence = marketResult.choices[0].message.content;
        }
      } catch (error) {
        console.log('Market intelligence fetch failed, continuing with portfolio analysis only');
      }

      // Enhanced cross-sell data with market intelligence
      const enhancedCrossSellData = {
        ...crossSellData,
        marketIntelligence: marketIntelligence,
        analysisTimestamp: new Date().toISOString()
      };

      // Send to OpenAI for Smart Cross Sell analysis
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are an AI insurance cross-selling specialist focused on seasonal trending products and broker strategy optimization.

Current analysis timestamp: ${new Date().toISOString()}
Current Season: SUMMER 2025 (July) - Focus on seasonal insurance trends

SEASONAL CONTEXT:
- Summer peak travel season driving travel insurance demand (+34% market growth)
- Recreational vehicle usage at yearly high (+28% market growth) 
- Outdoor events and festivals increasing (+22% market growth)
- Construction and seasonal business activity peaks
- Holiday home and second property exposures

BROKER STRATEGY FOCUS:
You are analyzing for insurance brokers (like Willis, Aon, Marsh) who need to:
1. Capitalize on seasonal demand patterns
2. Leverage their multi-client portfolio for cross-sell opportunities
3. Align product recommendations with current market trends
4. Focus on high-margin, trending products for summer period

Your task is to identify top 3 seasonal cross-selling opportunities combining:
- Current trending summer insurance products
- Entity's strategic positioning as insurance broker
- Real market data and seasonal patterns
- Customer base analysis for optimal product-market fit

For each opportunity, analyze:
1. Seasonal demand trends and market growth
2. Broker positioning and competitive advantage
3. Customer segmentation and targeting strategy
4. Revenue potential based on seasonal patterns

Respond with JSON in this exact format:
{
  "analysis": {
    "entityName": "entity name",
    "entityType": "${entityType.slice(0, -1)}",
    "portfolioSummary": "brief current portfolio overview",
    "seasonalContext": "summer 2025 market trends and broker positioning",
    "marketContext": "relevant seasonal market insights"
  },
  "opportunities": [
    {
      "id": 1,
      "title": "Seasonal Opportunity Title",
      "description": "Detailed seasonal opportunity description",
      "productName": "Specific trending summer product",
      "category": "Insurance category",
      "priority": "High|Medium|Low",
      "revenueLabel": "€XX,XXX potential",
      "revenueAmount": 15000,
      "probability": 75,
      "reasoning": "Why this seasonal trend creates broker opportunity",
      "timeframe": "This summer season (July-September)",
      "riskLevel": "Low|Medium|High",
      "seasonalGrowth": "+XX% market growth",
      "brokerStrategy": "Specific broker approach for this product",
      "actionableSteps": [
        "First seasonal action step",
        "Second customer targeting step", 
        "Third implementation step"
      ]
    }
  ],
  "summary": {
    "totalPotential": 45000,
    "highPriorityCount": 2,
    "recommendedFocus": "Main seasonal strategy recommendation",
    "seasonalAdvantage": "Key summer market advantage"
  }
}

Focus on authentic seasonal trends, real market data, and broker-specific strategies. Prioritize products showing strong summer demand growth.`
            },
            {
              role: "user",
              content: `Enhanced SEASONAL Smart Cross Sell analysis request at ${new Date().toISOString()}

SEASONAL FOCUS: SUMMER 2025 (July) - Analyze trending summer insurance products

Entity Profile (Insurance Broker):
${JSON.stringify(enhancedCrossSellData.entity, null, 2)}

Current Product Portfolio:
${JSON.stringify(enhancedCrossSellData.currentProducts, null, 2)}

Available Products for Cross-Sell:
${JSON.stringify(enhancedCrossSellData.availableProducts, null, 2)}

Market Intelligence & Industry Context:
${enhancedCrossSellData.marketIntelligence || 'Market intelligence unavailable - focus on seasonal portfolio analysis'}

Market Context & Opportunities:
${JSON.stringify(enhancedCrossSellData.marketContext, null, 2)}

SEASONAL ANALYSIS REQUEST:
Generate 3-5 actionable cross-sell recommendations focusing on:
1. Top trending summer insurance products (Travel +34%, Recreational Vehicle +28%, Event & Festival +22%)
2. Broker-specific strategy for this insurance broker entity
3. Customer segmentation for optimal seasonal targeting
4. Revenue potential based on current summer market trends
5. Implementation timeline aligned with summer season peak demand

Prioritize opportunities that combine authentic seasonal demand data with this broker's customer base and competitive positioning.`
            }
          ]
        })
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text();
        console.error('OpenAI API error:', errorData);
        return res.status(500).json({ error: 'Failed to generate cross-sell analysis' });
      }

      const aiResult = await openaiResponse.json();
      const analysis = JSON.parse(aiResult.choices[0].message.content);

      console.log('=== SMART CROSS SELL ANALYSIS ===');
      console.log(`Entity: ${entity.name} (${entityType})`);
      console.log('Analysis:', analysis);
      console.log('=== END ANALYSIS ===');

      res.json({
        ...analysis,
        dataUsed: {
          currentProducts: crossSellData.currentProducts.length,
          availableProducts: crossSellData.availableProducts.length,
          opportunities: crossSellData.opportunities.length,
          relatedEntities: crossSellData.marketContext.relatedEntities.length
        }
      });

    } catch (error) {
      console.error('Error generating Smart Cross Sell analysis:', error);
      res.status(500).json({ error: 'Failed to generate cross-sell analysis' });
    }
  });

  // AI Smart List Generation endpoint
  app.post('/api/:envId/ai/generate-smart-list', async (req: Request, res: Response) => {
    try {
      const envId = req.params.envId;
      const { prompt, entityType, entityId, userPrompt, portfolioData } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      console.log(`Generating smart list for ${entityType} ${entityId} with prompt: "${userPrompt}"`);

      // Generate smart customer lists based on the prompt
      const systemPrompt = `You are an expert insurance account manager AI. Generate smart customer lists based on the user's prompt and portfolio data.

Based on the user prompt and portfolio context, create three customer lists organized by priority levels:

1. Critical Gaps (high priority prospects with significant coverage gaps)
2. Medium Priority (moderate opportunities with some gaps)
3. Well Covered (existing customers with good coverage but upsell potential)

For each priority level, provide:
- count: number of customers
- totalValue: total potential value
- topCustomers: array of customer objects with name, relevant metrics (gapsCount for critical/medium, coverageRate for well covered), and potentialValue or currentValue

Generate realistic customer names and data that makes sense for insurance cross-sell analysis.

Return as JSON in this exact format:
{
  "critical": {
    "count": number,
    "totalValue": number,
    "topCustomers": [{"name": string, "gapsCount": number, "potentialValue": number}]
  },
  "medium": {
    "count": number,
    "totalValue": number,
    "topCustomers": [{"name": string, "gapsCount": number, "potentialValue": number}]
  },
  "wellCovered": {
    "count": number,
    "totalValue": number,
    "topCustomers": [{"name": string, "coverageRate": number, "currentValue": number}]
  }
}`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `User prompt: "${userPrompt}"
              
              Portfolio context:
              - Coverage: ${portfolioData.summary.coveragePercentage}%
              - Current premium: €${portfolioData.summary.totalPremium}
              - Gap opportunities: ${portfolioData.summary.gapOpportunities}
              - Categories: ${portfolioData.categoryBreakdown.map(cat => `${cat.categoryName} (${cat.coveragePercentage}%)`).join(', ')}
              
              Generate smart customer lists based on this context and the user's specific request.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text();
        console.error('OpenAI API error:', errorData);
        return res.status(500).json({ error: 'Failed to generate smart list' });
      }

      const aiResult = await openaiResponse.json();
      const smartListData = JSON.parse(aiResult.choices[0].message.content);

      console.log('=== SMART LIST GENERATED ===');
      console.log(`User prompt: ${userPrompt}`);
      console.log('Smart List Data:', smartListData);
      console.log('=== END SMART LIST ===');

      res.json({ smartListData });

    } catch (error) {
      console.error('Error generating smart list:', error);
      res.status(500).json({ error: 'Failed to generate smart list' });
    }
  });

  // Save meeting briefing endpoint
  app.post('/api/degoudse/partners/:id/save-meeting-briefing', async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.id);
      const { partner, briefing, dataUsed } = req.body;

      const result = await pool.query(`
        INSERT INTO degoudse.meeting_briefings (partner_id, partner_name, briefing_content, data_used, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
      `, [partnerId, partner, briefing, JSON.stringify(dataUsed), 1]);

      res.json({ 
        success: true, 
        id: result.rows[0].id,
        saved_at: result.rows[0].created_at
      });
    } catch (error) {
      console.error('Error saving meeting briefing:', error);
      res.status(500).json({ error: 'Failed to save meeting briefing' });
    }
  });

  // Get latest saved meeting briefing endpoint
  app.get('/api/degoudse/partners/:id/latest-meeting-briefing', async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.id);

      const result = await pool.query(`
        SELECT partner_name as partner, briefing_content as briefing, data_used, created_at
        FROM degoudse.meeting_briefings 
        WHERE partner_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [partnerId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No saved meeting briefing found' });
      }

      const briefing = result.rows[0];
      res.json({
        partner: briefing.partner,
        briefing: briefing.briefing,
        dataUsed: briefing.data_used,
        savedAt: briefing.created_at
      });
    } catch (error) {
      console.error('Error retrieving meeting briefing:', error);
      res.status(500).json({ error: 'Failed to retrieve meeting briefing' });
    }
  });

  app.get('/api/degoudse/opportunities/:id/partners', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT p.*
        FROM degoudse.partners p
        INNER JOIN degoudse.opportunities o ON p.id = o.partner_id
        WHERE o.id = $1
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
        INNER JOIN degoudse.opportunities o ON c.id = o.client_id
        WHERE o.id = $1
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
    // Add pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;
    
    // Add caching headers
    res.set('Cache-Control', 'public, max-age=60');
    
    try {
      const envPool = pool;
      
      // Get total count and summary statistics, excluding original seed customers (IDs 1-10)
      const [countResult, summaryResult] = await Promise.all([
        envPool.query(`
          SELECT COUNT(*) as total_count FROM degoudse.customers WHERE id > 10
        `),
        envPool.query(`
          SELECT 
            COUNT(DISTINCT c.id) as total_customers,
            COUNT(DISTINCT co.opportunity_id) as total_opportunities,
            COALESCE(SUM(CASE WHEN o."estimatedValue" IS NOT NULL THEN o."estimatedValue" ELSE 0 END), 0) as total_value,
            COALESCE(SUM(CASE WHEN o."estimatedValue" IS NOT NULL THEN o."estimatedValue" * o.probability / 100.0 ELSE 0 END), 0) as weighted_value
          FROM degoudse.customers c
          LEFT JOIN degoudse.customer_opportunities co ON c.id = co.customer_id
          LEFT JOIN degoudse.opportunities o ON co.opportunity_id = o.id
          WHERE c.id > 10
        `)
      ]);
      
      const totalCount = parseInt(countResult.rows[0].total_count);
      const totalPages = Math.ceil(totalCount / limit);
      const summary = summaryResult.rows[0];
      
      console.log(`Customer pagination debug: totalCount=${totalCount}, limit=${limit}, totalPages=${totalPages}, currentPage=${page}`);
      console.log(`Count query result:`, countResult.rows[0]);
      
      // Query with pagination, excluding original seed customers (IDs 1-10)
      const result = await envPool.query(`
        SELECT c.id, c.name, c.description, c."ownerId", c."createdAt", c."updatedAt",
               COUNT(DISTINCT pc.partner_id) as partner_count,
               COUNT(DISTINCT co.opportunity_id) as opportunity_count,
               COUNT(DISTINCT prod_c.product_id) as product_count,
               COALESCE(opp_values.total_opportunity_value, 0) as total_opportunity_value
        FROM degoudse.customers c
        LEFT JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN degoudse.customer_opportunities co ON c.id = co.customer_id
        LEFT JOIN degoudse.product_customers prod_c ON c.id = prod_c.customer_id
        LEFT JOIN (
          SELECT co2.customer_id, SUM(o2."estimatedValue") as total_opportunity_value
          FROM degoudse.customer_opportunities co2
          JOIN degoudse.opportunities o2 ON o2.id = co2.opportunity_id
          GROUP BY co2.customer_id
        ) opp_values ON opp_values.customer_id = c.id
        WHERE c.id > 10
        GROUP BY c.id, c.name, c.description, c."ownerId", c."createdAt", c."updatedAt", opp_values.total_opportunity_value
        ORDER BY c.id
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      
      console.log('Raw SQL result for customers:', result.rows.slice(0, 2));
      
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
        const partnerIds = customerPartners.map((p: any) => p.partner_id).join(',');
        
        const processedCustomer = {
          id: customer.id,
          name: customer.name,
          description: customer.description,
          initials: customer.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
          ownerId: customer.ownerId,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
          partnerCount: parseInt(customer.partner_count) || 0,
          opportunityCount: parseInt(customer.opportunity_count) || 0,
          productCount: parseInt(customer.product_count) || 0,
          totalOpportunityValue: parseFloat(customer.total_opportunity_value) || 0,
          partnerNames: partnerNames,
          partnerIds: partnerIds
        };
        
        console.log(`Processing customer ${customer.name}: opps=${customer.opportunity_count} -> ${processedCustomer.opportunityCount}, value=${customer.total_opportunity_value} -> ${processedCustomer.totalOpportunityValue}`);
        
        return processedCustomer;
      });
      
      // Return paginated response with metadata and summary totals
      console.log(`Returning ${customers.length} customers from De Goudse database (page ${page} of ${totalPages})`);
      res.json({
        data: customers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        totalOpportunities: parseInt(summary.total_opportunities) || 0,
        totalValue: parseFloat(summary.total_value) || 0,
        weightedValue: parseFloat(summary.weighted_value) || 0
      });
    } catch (error) {
      console.error('De Goudse customers API error:', error);
      res.status(500).json({ message: 'Failed to fetch customers for De Goudse environment' });
    }
  });

  app.get('/api/degoudse/products', async (req, res) => {
    try {
      const envPool = pool;
      const result = await envPool.query(`
        SELECT 
          p.id,
          p.id as productId,
          p.name,
          p.description,
          COALESCE(pc.name, p.category) as category,
          pc.id as categoryId,
          pc.name as category_name,
          parent.name as parent_category_name,
          pc.color as category_color,
          null as provider,
          null as providerName,
          null as providerType,
          p.contract_start_date,
          p.contract_start_date as contractStartDate,
          p.contract_end_date,
          p.contract_end_date as contractEndDate,
          null as total_value,
          null as totalValue,
          p.premium_value,
          p.premium_value as premiumValue,
          p.premium_percentage,
          p.premium_percentage as premiumPercentage,
          p.discount_percentage,
          null as discount,
          p.discount_percentage as discountPercentage,
          null as customerId,
          null as opportunityId,
          null as partnerId,
          null as linked_vendor,
          null as customer_name,
          null as partner_name,
          p.vendor_id as vendorId,
          COALESCE(cp_count.customer_count, 0) as customerCount,
          0 as partnerCount,
          0 as opportunityCount,
          p.created_at as createdAt,
          p.updated_at as updatedAt
        FROM degoudse.products p
        LEFT JOIN degoudse.categories pc ON p.category_id = pc.id
        LEFT JOIN degoudse.categories parent ON pc.parent_id = parent.id
        LEFT JOIN (
          SELECT product_id, COUNT(DISTINCT customer_id) as customer_count
          FROM degoudse.customer_products
          GROUP BY product_id
        ) cp_count ON p.id = cp_count.product_id
        ORDER BY parent.name, pc.name, p.name
      `);
      console.log(`Returning ${result.rows.length} products from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('De Goudse products API error:', error);
      res.status(500).json({ message: 'Failed to fetch products for De Goudse environment' });
    }
  });

  // Get customers for a specific product
  app.get('/api/degoudse/products/:id/customers', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const envPool = pool;
      const result = await envPool.query(`
        SELECT 
          c.id,
          c.name,
          c.description,
          c.status,
          cp.contract_start_date,
          cp.contract_end_date,
          cp.premium_value,
          cp.premium_percentage,
          cp.discount_percentage,
          cp.status as contract_status,
          cp.created_at as contract_created_at
        FROM degoudse.customers c
        JOIN degoudse.customer_products cp ON c.id = cp.customer_id
        WHERE cp.product_id = $1
        ORDER BY c.name
      `, [productId]);
      
      console.log(`Returning ${result.rows.length} customers for product ${productId}`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching product customers:', error);
      res.status(500).json({ message: 'Failed to fetch product customers' });
    }
  });

  // Customer Product Assignments API endpoints

  // Get Customer Product Assignments
  app.get('/api/degoudse/customers/:id/product-assignments', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT 
          cp.customer_id as customerId,
          cp.product_id as productId,
          p.name as productname,
          p.description as productdescription,
          v.name as providerName,
          cp.premium_value as customprice,
          cp.premium_percentage as customPremiumPercentage,
          cp.discount_percentage as customDiscountPercentage,
          cp.contract_start_date as customercontractstartdate,
          cp.contract_end_date as customercontractenddate,
          cp.status,
          -- Category info
          p.category as category,
          c.color as categoryColor,
          -- Customer count per product
          (SELECT COUNT(DISTINCT cp2.customer_id) 
           FROM degoudse.customer_products cp2 
           WHERE cp2.product_id = p.id) as customerCount
        FROM degoudse.customer_products cp
        INNER JOIN degoudse.products p ON cp.product_id = p.id
        LEFT JOIN degoudse.categories c ON p.category_id = c.id
        LEFT JOIN degoudse.vendors v ON p.vendor_id = v.id
        WHERE cp.customer_id = $1
        ORDER BY p.name ASC
      `, [customerId]);
      
      console.log(`Returning ${result.rows.length} product assignments for customer ${customerId}`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching customer product assignments:', error);
      res.status(500).json({ error: 'Failed to fetch customer product assignments' });
    }
  });

  // Get Customer Portfolio Overview
  app.get('/api/degoudse/customers/:id/portfolio-overview', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const envPool = pool;
      
      // Get customer basic info
      const customerResult = await envPool.query(`
        SELECT name FROM degoudse.customers WHERE id = $1
      `, [customerId]);
      
      if (customerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      const customerName = customerResult.rows[0].name;
      
      // Get portfolio summary metrics - use actual customer_products table like product assignments
      const summaryResult = await envPool.query(`
        SELECT 
          COUNT(DISTINCT cp.product_id) as products_covered,
          COUNT(DISTINCT parent_cat.id) as categories_covered,
          SUM(COALESCE(cp.premium_value, 0)) as total_premium,
          (SELECT COUNT(*) FROM degoudse.products) as total_available_products
        FROM degoudse.customer_products cp
        INNER JOIN degoudse.products p ON cp.product_id = p.id
        LEFT JOIN degoudse.categories c ON p.category_id = c.id
        LEFT JOIN degoudse.categories parent_cat ON c.parent_id = parent_cat.id
        WHERE cp.customer_id = $1
      `, [customerId]);
      
      // Get category coverage breakdown - use same approach as working query
      const categoryResult = await envPool.query(`
        SELECT 
          parent_cat.id as categoryId,
          parent_cat.name as categoryName,
          parent_cat.color as categoryColor,
          COUNT(DISTINCT cp.product_id) as products_covered,
          COUNT(DISTINCT p.id) as total_products,
          COALESCE(SUM(cp.premium_value), 0) as current_premium,
          ROUND(
            (COUNT(DISTINCT cp.product_id)::decimal / NULLIF(COUNT(DISTINCT p.id), 0)) * 100, 1
          ) as coverage_percentage
        FROM degoudse.categories parent_cat
        LEFT JOIN degoudse.categories c ON c.parent_id = parent_cat.id
        LEFT JOIN degoudse.products p ON p.category_id = c.id
        LEFT JOIN degoudse.customer_products cp ON cp.product_id = p.id AND cp.customer_id = $1
        WHERE parent_cat.level = 1
        GROUP BY parent_cat.id, parent_cat.name, parent_cat.color
        ORDER BY coverage_percentage DESC NULLS LAST
      `, [customerId]);
      
      // Calculate gap opportunities using products not assigned to this customer
      const gapResult = await envPool.query(`
        SELECT 
          p.name as product_name,
          p.premium_value as potential_value,
          parent_cat.name as category_name,
          CASE 
            WHEN p.premium_value >= 5000 THEN 'critical'
            WHEN p.premium_value >= 2000 THEN 'medium'
            ELSE 'low'
          END as priority
        FROM degoudse.products p
        INNER JOIN degoudse.categories c ON p.category_id = c.id
        LEFT JOIN degoudse.categories parent_cat ON c.parent_id = parent_cat.id
        WHERE p.id NOT IN (
          SELECT DISTINCT cp.product_id 
          FROM degoudse.customer_products cp 
          WHERE cp.customer_id = $1
        )
        ORDER BY p.premium_value DESC
      `, [customerId]);
      
      const summary = summaryResult.rows[0];
      const coveragePercentage = summary.total_available_products > 0 
        ? Math.round((summary.products_covered / summary.total_available_products) * 100)
        : 0;
      
      // Calculate gap opportunities by priority
      const criticalGaps = gapResult.rows.filter(gap => gap.priority === 'critical');
      const mediumGaps = gapResult.rows.filter(gap => gap.priority === 'medium');
      const lowGaps = gapResult.rows.filter(gap => gap.priority === 'low');
      
      const portfolioOverview = {
        customerName,
        summary: {
          totalPremium: parseFloat(summary.total_premium || '0'),
          productsCovered: parseInt(summary.products_covered || '0'),
          totalProducts: parseInt(summary.total_available_products || '0'),
          coveragePercentage,
          categoriesCovered: parseInt(summary.categories_covered || '0'),
          gapOpportunities: gapResult.rows.length
        },
        categoryBreakdown: categoryResult.rows.map(cat => ({
          categoryId: cat.categoryid,
          categoryName: cat.categoryname,
          categoryColor: cat.categorycolor,
          productsCovered: parseInt(cat.products_covered || '0'),
          totalProducts: parseInt(cat.total_products || '0'),
          coveragePercentage: parseFloat(cat.coverage_percentage || '0'),
          currentPremium: parseFloat(cat.current_premium || '0'),
          gapValue: 0 // Will calculate properly later if needed
        })),
        gapAnalysis: {
          critical: {
            count: criticalGaps.length,
            totalValue: criticalGaps.reduce((sum, gap) => sum + parseFloat(gap.potential_value || '0'), 0),
            topProducts: criticalGaps.slice(0, 3).map(gap => ({
              productName: gap.product_name,
              potentialValue: parseFloat(gap.potential_value || '0'),
              category: gap.category_name
            }))
          },
          medium: {
            count: mediumGaps.length,
            totalValue: mediumGaps.reduce((sum, gap) => sum + parseFloat(gap.potential_value || '0'), 0),
            topProducts: mediumGaps.slice(0, 3).map(gap => ({
              productName: gap.product_name,
              potentialValue: parseFloat(gap.potential_value || '0'),
              category: gap.category_name
            }))
          },
          wellCovered: {
            count: parseInt(summary.products_covered || '0'),
            totalValue: parseFloat(summary.total_premium || '0'),
            coverageRate: coveragePercentage
          }
        }
      };
      
      res.json(portfolioOverview);
    } catch (error) {
      console.error('Error fetching customer portfolio overview:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio overview' });
    }
  });

  // Get Opportunity Portfolio Overview
  app.get('/api/degoudse/opportunities/:id/portfolio-overview', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = pool;
      
      // Get opportunity basic info with customer
      const opportunityResult = await envPool.query(`
        SELECT o.title, o.description, c.name as customer_name, o.client_id
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.customers c ON o.client_id = c.id
        WHERE o.id = $1
      `, [opportunityId]);
      
      if (opportunityResult.rows.length === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }
      
      const opportunity = opportunityResult.rows[0];
      const customerId = opportunity.client_id;
      
      // Get customer product assignments to analyze potential (using client_id if available)
      let summary, categoryResult, gapResult;
      
      if (customerId) {
        // Use customer data if available
        const summaryResult = await envPool.query(`
          SELECT 
            COUNT(DISTINCT cpa.product_template_id) as products_covered,
            COUNT(DISTINCT c.id) as categories_covered,
            SUM(COALESCE(CASE 
              WHEN cpa.custom_price IS NOT NULL THEN cpa.custom_price 
              ELSE pt.average_price 
            END, 0)) as total_premium,
            COUNT(DISTINCT pt_all.id) as total_available_products
          FROM degoudse.customer_product_assignments cpa
          INNER JOIN degoudse.product_templates pt ON cpa.product_template_id = pt.id
          LEFT JOIN degoudse.categories c ON pt.category_id = c.id
          CROSS JOIN (SELECT id FROM degoudse.product_templates WHERE is_active = true) pt_all
          WHERE cpa.customer_id = $1 AND cpa.is_active = true
        `, [customerId]);
        
        summary = summaryResult.rows[0];
        
        // Get category coverage breakdown
        const categoryRes = await envPool.query(`
          SELECT 
            c.id as categoryId,
            c.name as categoryName,
            c.color as categoryColor,
            COUNT(DISTINCT cpa.product_template_id) as products_covered,
            COUNT(DISTINCT pt.id) as total_products,
            SUM(COALESCE(CASE 
              WHEN cpa.custom_price IS NOT NULL THEN cpa.custom_price 
              ELSE pt.average_price 
            END, 0)) as current_premium,
            ROUND((COUNT(DISTINCT cpa.product_template_id)::decimal / NULLIF(COUNT(DISTINCT pt.id), 0)) * 100, 1) as coverage_percentage
          FROM degoudse.categories c
          LEFT JOIN degoudse.product_templates pt ON pt.category_id = c.id AND pt.is_active = true
          LEFT JOIN degoudse.customer_product_assignments cpa ON cpa.product_template_id = pt.id AND cpa.customer_id = $1 AND cpa.is_active = true
          WHERE c.level = 1 AND c.is_active = true
          GROUP BY c.id, c.name, c.color
          ORDER BY coverage_percentage DESC NULLS LAST
        `, [customerId]);
        
        categoryResult = categoryRes;
        
        // Calculate gap opportunities
        const gapRes = await envPool.query(`
          SELECT 
            pt.name as product_name,
            pt.average_price as potential_value,
            c.name as category_name,
            CASE 
              WHEN pt.average_price >= 5000 THEN 'critical'
              WHEN pt.average_price >= 2000 THEN 'medium'
              ELSE 'low'
            END as priority
          FROM degoudse.product_templates pt
          INNER JOIN degoudse.categories c ON pt.category_id = c.id
          WHERE pt.id NOT IN (
            SELECT DISTINCT cpa.product_template_id 
            FROM degoudse.customer_product_assignments cpa 
            WHERE cpa.customer_id = $1 AND cpa.is_active = true
          )
          AND pt.is_active = true
          ORDER BY pt.average_price DESC
        `, [customerId]);
        
        gapResult = gapRes;
      } else {
        // Default empty data if no customer linked
        summary = {
          products_covered: 0,
          categories_covered: 0,
          total_premium: 0,
          total_available_products: 0
        };
        categoryResult = { rows: [] };
        gapResult = { rows: [] };
      }
      
      const coveragePercentage = summary.total_available_products > 0 
        ? Math.round((summary.products_covered / summary.total_available_products) * 100)
        : 0;
      
      // Calculate gap opportunities by priority
      const criticalGaps = gapResult.rows.filter(gap => gap.priority === 'critical');
      const mediumGaps = gapResult.rows.filter(gap => gap.priority === 'medium');
      const lowGaps = gapResult.rows.filter(gap => gap.priority === 'low');
      
      const portfolioOverview = {
        opportunityName: opportunity.title,
        customerName: opportunity.customer_name || 'No customer linked',
        summary: {
          totalPremium: parseFloat(summary.total_premium || '0'),
          productsCovered: parseInt(summary.products_covered || '0'),
          totalProducts: parseInt(summary.total_available_products || '0'),
          coveragePercentage,
          categoriesCovered: parseInt(summary.categories_covered || '0'),
          gapOpportunities: gapResult.rows.length
        },
        categoryBreakdown: categoryResult.rows.map(cat => ({
          categoryId: cat.categoryid,
          categoryName: cat.categoryname,
          categoryColor: cat.categorycolor,
          productsCovered: parseInt(cat.products_covered || '0'),
          totalProducts: parseInt(cat.total_products || '0'),
          coveragePercentage: parseFloat(cat.coverage_percentage || '0'),
          currentPremium: parseFloat(cat.current_premium || '0'),
          gapValue: 0
        })),
        gapAnalysis: {
          critical: {
            count: criticalGaps.length,
            totalValue: criticalGaps.reduce((sum, gap) => sum + parseFloat(gap.potential_value || '0'), 0),
            topProducts: criticalGaps.slice(0, 3).map(gap => ({
              productName: gap.product_name,
              potentialValue: parseFloat(gap.potential_value || '0'),
              category: gap.category_name
            }))
          },
          medium: {
            count: mediumGaps.length,
            totalValue: mediumGaps.reduce((sum, gap) => sum + parseFloat(gap.potential_value || '0'), 0),
            topProducts: mediumGaps.slice(0, 3).map(gap => ({
              productName: gap.product_name,
              potentialValue: parseFloat(gap.potential_value || '0'),
              category: gap.category_name
            }))
          },
          wellCovered: {
            count: parseInt(summary.products_covered || '0'),
            totalValue: parseFloat(summary.total_premium || '0'),
            coverageRate: coveragePercentage
          }
        }
      };
      
      res.json(portfolioOverview);
    } catch (error) {
      console.error('Error fetching opportunity portfolio overview:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio overview' });
    }
  });

  // Create Customer Product Assignment
  app.post('/api/degoudse/customers/:id/product-assignments', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const {
        productTemplateId,
        customPrice,
        customDiscount,
        customDiscountPercentage,
        customPremiumPercentage,
        customerContractStartDate,
        customerContractEndDate,
        notes,
        assignedBy
      } = req.body;
      
      const envPool = pool;
      
      const result = await envPool.query(`
        INSERT INTO degoudse.customer_product_assignments (
          customer_id,
          product_template_id,
          custom_price,
          custom_discount,
          custom_discount_percentage,
          custom_premium_percentage,
          customer_contract_start_date,
          customer_contract_end_date,
          notes,
          assigned_by,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
        RETURNING *
      `, [
        customerId,
        productTemplateId,
        customPrice || null,
        customDiscount || null,
        customDiscountPercentage || null,
        customPremiumPercentage || null,
        customerContractStartDate || null,
        customerContractEndDate || null,
        notes || null,
        assignedBy || 1 // Default to user 1 if not provided
      ]);
      
      console.log(`Created product assignment for customer ${customerId}, template ${productTemplateId}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating customer product assignment:', error);
      res.status(500).json({ error: 'Failed to create product assignment' });
    }
  });

  // Update Customer Product Assignment
  app.put('/api/degoudse/customers/:customerId/product-assignments/:assignmentId', async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const assignmentId = parseInt(req.params.assignmentId);
      const {
        customPrice,
        customDiscount,
        customDiscountPercentage,
        customPremiumPercentage,
        customerContractStartDate,
        customerContractEndDate,
        notes,
        isActive
      } = req.body;
      
      const envPool = pool;
      
      const result = await envPool.query(`
        UPDATE degoudse.customer_product_assignments 
        SET 
          custom_price = $3,
          custom_discount = $4,
          custom_discount_percentage = $5,
          custom_premium_percentage = $6,
          customer_contract_start_date = $7,
          customer_contract_end_date = $8,
          notes = $9,
          is_active = $10,
          updated_at = NOW()
        WHERE id = $1 AND customer_id = $2
        RETURNING *
      `, [
        assignmentId,
        customerId,
        customPrice || null,
        customDiscount || null,
        customDiscountPercentage || null,
        customPremiumPercentage || null,
        customerContractStartDate || null,
        customerContractEndDate || null,
        notes || null,
        isActive !== undefined ? isActive : true
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product assignment not found' });
      }
      
      console.log(`Updated product assignment ${assignmentId} for customer ${customerId}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating customer product assignment:', error);
      res.status(500).json({ error: 'Failed to update product assignment' });
    }
  });

  // Delete Customer Product Assignment (soft delete)
  app.delete('/api/degoudse/customers/:customerId/product-assignments/:assignmentId', async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const assignmentId = parseInt(req.params.assignmentId);
      
      const envPool = pool;
      
      const result = await envPool.query(`
        UPDATE degoudse.customer_product_assignments 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1 AND customer_id = $2
        RETURNING *
      `, [assignmentId, customerId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product assignment not found' });
      }
      
      console.log(`Soft deleted product assignment ${assignmentId} for customer ${customerId}`);
      res.json({ message: 'Product assignment removed successfully' });
    } catch (error) {
      console.error('Error deleting customer product assignment:', error);
      res.status(500).json({ error: 'Failed to delete product assignment' });
    }
  });

  // Partner Product Assignments API endpoints

  // Get Partner Product Assignments
  app.get('/api/degoudse/partners/:id/product-assignments', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT 
          pt.id as "productId",
          pt.name as "productName",
          pt.description as "productDescription", 
          pt.category as category,
          -- Aggregated values from all partner's customers
          COUNT(DISTINCT cpa.customer_id) as "customerCount",
          SUM(pt.premium_value) as "totalPremiumValue",
          AVG(pt.premium_value) as "avgPremiumValue",
          AVG(pt.premium_percentage) as "avgPremiumPercentage",
          AVG(pt.discount_percentage) as "avgDiscountPercentage",
          -- Category info
          c.name as "categoryName",
          c.color as "categoryColor",
          -- Parent category info for main category grouping
          parent_cat.name as "parentCategoryName",
          parent_cat.color as "parentCategoryColor",
          -- Contract date ranges
          MIN(pt.contract_start_date) as "earliestContractStart",
          MAX(pt.contract_end_date) as "latestContractEnd",
          -- Status summary
          'Active' as "statusSummary"
        FROM degoudse.customer_product_assignments cpa
        INNER JOIN degoudse.product_templates pt ON cpa.product_template_id = pt.id
        INNER JOIN degoudse.partner_customers pc ON cpa.customer_id = pc.customer_id
        LEFT JOIN degoudse.categories c ON pt.category_id = c.id
        LEFT JOIN degoudse.categories parent_cat ON c.parent_id = parent_cat.id OR c.id = parent_cat.id
        WHERE pc.partner_id = $1 AND cpa.is_active = true
        GROUP BY pt.id, pt.name, pt.description, pt.category, c.name, c.color, parent_cat.name, parent_cat.color
        ORDER BY COUNT(DISTINCT cpa.customer_id) DESC, SUM(pt.premium_value) DESC
      `, [partnerId]);
      
      console.log(`Returning ${result.rows.length} product assignments for partner ${partnerId}`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching partner product assignments:', error);
      res.status(500).json({ error: 'Failed to fetch partner product assignments' });
    }
  });

  // Get Partner Portfolio Overview
  app.get('/api/degoudse/partners/:id/portfolio-overview', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = pool;
      
      // Get partner basic info
      const partnerResult = await envPool.query(`
        SELECT name FROM degoudse.partners WHERE id = $1
      `, [partnerId]);
      
      if (partnerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      
      const partnerName = partnerResult.rows[0].name;
      
      // Get portfolio summary metrics - use actual customer_product_assignments through partner relationships
      const summaryResult = await envPool.query(`
        SELECT 
          COUNT(DISTINCT cpa.product_template_id) as products_covered,
          COUNT(DISTINCT parent_cat.id) as categories_covered,
          SUM(COALESCE(pt.premium_value, 0)) as total_premium,
          (SELECT COUNT(*) FROM degoudse.product_templates) as total_available_products
        FROM degoudse.customer_product_assignments cpa
        INNER JOIN degoudse.partner_customers pc ON cpa.customer_id = pc.customer_id
        INNER JOIN degoudse.product_templates pt ON cpa.product_template_id = pt.id
        LEFT JOIN degoudse.categories c ON pt.category_id = c.id
        LEFT JOIN degoudse.categories parent_cat ON c.parent_id = parent_cat.id OR c.id = parent_cat.id
        WHERE pc.partner_id = $1 AND cpa.is_active = true
      `, [partnerId]);
      
      // Get category coverage breakdown - customer coverage per category
      const categoryResult = await envPool.query(`
        WITH partner_customers AS (
          SELECT DISTINCT customer_id 
          FROM degoudse.partner_customers 
          WHERE partner_id = $1
        ),
        category_coverage AS (
          SELECT 
            parent_cat.id as categoryId,
            parent_cat.name as categoryName,
            parent_cat.color as categoryColor,
            COUNT(DISTINCT cpa.customer_id) as customers_with_products,
            (SELECT COUNT(*) FROM partner_customers) as total_customers,
            COALESCE(SUM(pt.premium_value), 0) as current_premium,
            ROUND(COUNT(DISTINCT cpa.customer_id) * 100.0 / (SELECT COUNT(*) FROM partner_customers), 1) as coverage_percentage
          FROM degoudse.categories parent_cat
          LEFT JOIN degoudse.categories c ON c.parent_id = parent_cat.id OR c.id = parent_cat.id
          LEFT JOIN degoudse.product_templates pt ON pt.category_id = c.id
          LEFT JOIN degoudse.customer_product_assignments cpa ON cpa.product_template_id = pt.id
            AND cpa.customer_id IN (SELECT customer_id FROM partner_customers)
            AND cpa.is_active = true
          WHERE parent_cat.parent_id IS NULL
          GROUP BY parent_cat.id, parent_cat.name, parent_cat.color
        )
        SELECT * FROM category_coverage
        ORDER BY coverage_percentage DESC
      `, [partnerId]);
      
      // Calculate gap opportunities using products not assigned to this partner's customers
      const gapResult = await envPool.query(`
        SELECT 
          pt.name as product_name,
          pt.premium_value as potential_value,
          parent_cat.name as category_name,
          CASE 
            WHEN pt.premium_value >= 5000 THEN 'critical'
            WHEN pt.premium_value >= 2000 THEN 'medium'
            ELSE 'low'
          END as priority
        FROM degoudse.product_templates pt
        INNER JOIN degoudse.categories c ON pt.category_id = c.id
        LEFT JOIN degoudse.categories parent_cat ON c.parent_id = parent_cat.id OR c.id = parent_cat.id
        WHERE pt.id NOT IN (
          SELECT DISTINCT cpa.product_template_id 
          FROM degoudse.customer_product_assignments cpa
          INNER JOIN degoudse.partner_customers pc ON cpa.customer_id = pc.customer_id
          WHERE pc.partner_id = $1 AND cpa.is_active = true
        )
        ORDER BY pt.premium_value DESC
      `, [partnerId]);
      
      const summary = summaryResult.rows[0];
      const coveragePercentage = summary.total_available_products > 0 
        ? Math.round((summary.products_covered / summary.total_available_products) * 100)
        : 0;
      
      // Calculate gap opportunities by priority
      const criticalGaps = gapResult.rows.filter(gap => gap.priority === 'critical');
      const mediumGaps = gapResult.rows.filter(gap => gap.priority === 'medium');
      const lowGaps = gapResult.rows.filter(gap => gap.priority === 'low');
      
      const portfolioOverview = {
        partnerName,
        summary: {
          totalPremium: parseFloat(summary.total_premium || '0'),
          productsCovered: parseInt(summary.products_covered || '0'),
          totalProducts: parseInt(summary.total_available_products || '0'),
          coveragePercentage,
          categoriesCovered: parseInt(summary.categories_covered || '0'),
          gapOpportunities: gapResult.rows.length
        },
        categoryBreakdown: categoryResult.rows.map(cat => ({
          categoryId: cat.categoryid,
          categoryName: cat.categoryname,
          categoryColor: cat.categorycolor,
          productsCovered: parseInt(cat.customers_with_products || '0'),
          totalProducts: parseInt(cat.total_customers || '0'),
          coveragePercentage: parseFloat(cat.coverage_percentage || '0'),
          currentPremium: parseFloat(cat.current_premium || '0'),
          gapValue: 0 // Will calculate properly later if needed
        })),
        gapAnalysis: {
          critical: {
            count: criticalGaps.length,
            totalValue: criticalGaps.reduce((sum, gap) => sum + parseFloat(gap.potential_value || '0'), 0),
            topProducts: criticalGaps.slice(0, 3).map(gap => ({
              productName: gap.product_name,
              potentialValue: parseFloat(gap.potential_value || '0'),
              category: gap.category_name
            }))
          },
          medium: {
            count: mediumGaps.length,
            totalValue: mediumGaps.reduce((sum, gap) => sum + parseFloat(gap.potential_value || '0'), 0),
            topProducts: mediumGaps.slice(0, 3).map(gap => ({
              productName: gap.product_name,
              potentialValue: parseFloat(gap.potential_value || '0'),
              category: gap.category_name
            }))
          },
          wellCovered: {
            count: parseInt(summary.products_covered || '0'),
            totalValue: parseFloat(summary.total_premium || '0'),
            coverageRate: coveragePercentage
          }
        }
      };
      
      res.json(portfolioOverview);
    } catch (error) {
      console.error('Error fetching partner portfolio overview:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio overview' });
    }
  });

  // Cache clearing endpoint
  app.post('/api/admin/clear-cache', (req, res) => {
    clearCache();
    res.json({ message: 'Cache cleared successfully' });
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
    
    // Clear cache first to ensure fresh data after deletions
    cache.delete(cacheKey);
    
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
      } else if (entityType === 'products') {
        const result = await envPool.query('SELECT * FROM degoudse.saved_lists WHERE entity_type = $1 ORDER BY created_at DESC', ['products']);
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
        // Filter by entity type only, include general lists (partner_id IS NULL) but exclude partner-specific lists
        result = await envPool.query('SELECT * FROM degoudse.saved_lists WHERE entity_type = $1 ORDER BY created_at DESC', [entityType]);
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
      
      // Clear cache after creating a new list
      cache.clear();
      console.log('Cache cleared after creating new list');
      
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
      const isBrokerRequest = referer.includes('/broker-view') || req.query.brokerView === 'true';
      
      // Extract list ID from query parameters for broker requests
      const listId = req.query.listId ? parseInt(req.query.listId as string) : null;
      
      console.log(`Opportunities request - Referer: ${referer}, isBrokerRequest: ${isBrokerRequest}, listId: ${listId}`);
      
      let result;
      
      if (isBrokerRequest) {
        // Check for broker-partner mappings only for broker requests
        const brokerMappingResult = await envPool.query(`
          SELECT partner_id FROM degoudse.broker_partner_mappings 
          WHERE broker_user_id = $1 AND environment_id = $2 AND is_active = true
        `, [1, 'degoudse']);
        
        if (brokerMappingResult.rows.length > 0) {
          // This is a broker with restricted access - show opportunities from shared lists only
          console.log('Broker access detected - showing opportunities from shared lists');
          
          // If a specific list is requested, filter by list members
          if (listId) {
            console.log(`Broker requesting specific list ${listId} - applying list member filtering`);
            
            // Get list members
            const listResult = await envPool.query(`
              SELECT members FROM degoudse.saved_lists 
              WHERE id = $1 AND entity_type = 'opportunities'
            `, [listId]);
            
            if (listResult.rows.length > 0 && listResult.rows[0].members) {
              const members = listResult.rows[0].members;
              if (members.length > 0) {
                console.log(`Filtering to ${members.length} specific opportunities from list ${listId}`);
                result = await envPool.query(`
                  SELECT o.id, o.title, o.client_id, o.product_id, o.probability, o.estimated_value, o.type, o.status, o.stage, o.owner_id, o.description, o.partner_id, o.created_at, o.updated_at, o.expected_close_date, 
                         c.name as customer_name,
                         p.name as partner_name,
                         pr.name as product_name,
                         am.name as account_manager_name,
                         COUNT(DISTINCT op.product_id) as product_count
                  FROM degoudse.opportunities o
                  LEFT JOIN degoudse.customers c ON o.client_id = c.id
                  LEFT JOIN degoudse.partners p ON o.partner_id = p.id
                  LEFT JOIN degoudse.products pr ON o.product_id = pr.id
                  LEFT JOIN degoudse.users am ON o.owner_id = am.id
                  LEFT JOIN degoudse.opportunity_products op ON o.id = op.opportunity_id
                  WHERE o.id = ANY($1) AND o.id > 16
                  GROUP BY o.id, o.title, o.client_id, o.product_id, o.probability, o.estimated_value, o.type, o.status, o.stage, o.owner_id, o.description, o.partner_id, o.created_at, o.updated_at, o.expected_close_date, c.name, p.name, pr.name, am.name
                  ORDER BY o.id
                `, [members]);
              } else {
                // Empty list - return no opportunities
                result = { rows: [] };
              }
            } else {
              // List not found or no members - return no opportunities
              result = { rows: [] };
            }
          } else {
            // When no specific list is requested, show all opportunities from all shared lists
            console.log('Broker requesting all opportunities from shared lists');
            
            // Get all currently shared lists for John Smith (must be both shared AND have active collaborator)
            const sharedListsResult = await envPool.query(`
              SELECT DISTINCT sl.id, sl.name, sl.members 
              FROM degoudse.saved_lists sl
              JOIN degoudse.list_collaborators lc ON sl.id = lc.list_id
              WHERE lc.email = 'john.smith@partner.com' 
                AND lc.is_active = true 
                AND sl.entity_type = 'opportunities'
                AND sl.is_shared = true
                AND NOT (sl.members <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16])
            `);
            
            console.log(`Found ${sharedListsResult.rows.length} lists shared with John Smith or partners`);
            sharedListsResult.rows.forEach(list => {
              console.log(`Shared list: ${list.name} (ID: ${list.id}) with ${list.members ? list.members.length : 0} members`);
            });
            
            if (sharedListsResult.rows.length > 0) {
              // Collect all opportunity IDs from all shared lists
              const allOpportunityIds = new Set();
              sharedListsResult.rows.forEach(list => {
                if (list.members && list.members.length > 0) {
                  list.members.forEach(id => {
                    if (id > 16) { // Only include imported opportunities
                      allOpportunityIds.add(id);
                    }
                  });
                }
              });
              
              if (allOpportunityIds.size > 0) {
                const opportunityIdsArray = Array.from(allOpportunityIds);
                console.log(`Showing ${opportunityIdsArray.length} opportunities from ${sharedListsResult.rows.length} shared lists`);
                
                result = await envPool.query(`
                  SELECT o.id, o.title, o.client_id, o.product_id, o.probability, o.estimated_value, o.type, o.status, o.stage, o.owner_id, o.description, o.partner_id, o.created_at, o.updated_at, o.expected_close_date, 
                         c.name as customer_name,
                         p.name as partner_name,
                         pr.name as product_name,
                         am.name as account_manager_name,
                         COUNT(DISTINCT op.product_id) as product_count
                  FROM degoudse.opportunities o
                  LEFT JOIN degoudse.customers c ON o.client_id = c.id
                  LEFT JOIN degoudse.partners p ON o.partner_id = p.id
                  LEFT JOIN degoudse.products pr ON o.product_id = pr.id
                  LEFT JOIN degoudse.users am ON o.owner_id = am.id
                  LEFT JOIN degoudse.opportunity_products op ON o.id = op.opportunity_id
                  WHERE o.id = ANY($1)
                  GROUP BY o.id, o.title, o.client_id, o.product_id, o.probability, o.estimated_value, o.type, o.status, o.stage, o.owner_id, o.description, o.partner_id, o.created_at, o.updated_at, o.expected_close_date, c.name, p.name, pr.name, am.name
                  ORDER BY o.id
                `, [opportunityIdsArray]);
              } else {
                result = { rows: [] };
              }
            } else {
              result = { rows: [] };
            }
          }
        } else {
          // Broker request but no mapping found - show no opportunities
          result = { rows: [] };
        }
      } else {
        // Regular access - show opportunities excluding original seed data (IDs 1-16, missing ID 6) but preserve partner 4 opportunities for broker access
        result = await envPool.query(`
          SELECT o.id, o.title, o.client_id, o.product_id, o.probability, o.estimated_value, o.type, o.status, o.stage, o.owner_id, o.description, o.partner_id, o.created_at, o.updated_at, o.expected_close_date, 
                 c.name as customer_name,
                 p.name as partner_name,
                 pr.name as product_name,
                 am.name as account_manager_name,
                 COUNT(DISTINCT op.product_id) as product_count
          FROM degoudse.opportunities o
          LEFT JOIN degoudse.customers c ON o.client_id = c.id
          LEFT JOIN degoudse.partners p ON o.partner_id = p.id
          LEFT JOIN degoudse.products pr ON o.product_id = pr.id
          LEFT JOIN degoudse.users am ON o.owner_id = am.id
          LEFT JOIN degoudse.opportunity_products op ON o.id = op.opportunity_id
          WHERE o.id > 16
          GROUP BY o.id, o.title, o.client_id, o.product_id, o.probability, o.estimated_value, o.type, o.status, o.stage, o.owner_id, o.description, o.partner_id, o.created_at, o.updated_at, o.expected_close_date, c.name, p.name, pr.name, am.name
          ORDER BY o.id
        `);
      }
      
      const opportunities = result.rows.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        insuranceDescription: opp.insurance_description,
        status: opp.status,
        stage: opp.stage,
        estimated_value: opp.estimated_value || opp.estimatedValue,
        expectedCloseDate: opp.expected_close_date,
        startDate: opp.start_date,
        clientId: opp.client_id,
        clientName: opp.customer_name || '',
        customerName: opp.customer_name || '',
        partnerId: opp.partner_id,
        partnerName: opp.partner_name || '',
        productId: opp.product_id,
        productNames: opp.product_name || '',
        productCount: parseInt(opp.product_count) || 0,
        ownerId: opp.owner_id,
        accountManagerId: opp.account_manager_id,
        accountManagerName: opp.account_manager_name || '',
        probability: opp.probability,
        type: opp.type,
        createdAt: opp.created_at,
        updatedAt: opp.updated_at
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
        SELECT o.id, o.title, o.client_id, o.product_id, o.probability, o.estimated_value, o.type, o.status, o.stage, o.owner_id, o.description, o.partner_id, o.created_at, o.updated_at, o.expected_close_date, 
               STRING_AGG(DISTINCT c.name, ', ') as customer_names,
               STRING_AGG(DISTINCT p.name, ', ') as partner_names,
               STRING_AGG(DISTINCT pr.name, ', ') as product_names,
               am.name as account_manager_name,
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
        LEFT JOIN degoudse.users am ON o.owner_id = am.id
        WHERE o.id = $1 AND o.id > 16
        GROUP BY o.id, o.title, o.description, o.status, o.stage, o.estimated_value, 
                 o.expected_close_date, o.start_date, o.owner_id, o.client_id, o.partner_id, o.product_id, 
                 o.probability, o.type, o.created_at, o.updated_at, am.name
      `, [opportunityId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }
      
      const opp = result.rows[0];
      const opportunity = {
        id: opp.id,
        title: opp.title,
        description: opp.description,
        insuranceDescription: opp.insurance_description,
        status: opp.status,
        stage: opp.stage,
        estimatedValue: opp.estimated_value,
        expectedCloseDate: opp.expected_close_date,
        startDate: opp.start_date,
        clientId: opp.client_id,
        clientName: opp.customer_names || '',
        customerNames: opp.customer_names || '',
        partnerId: opp.partner_id,
        partnerNames: opp.partner_names || '',
        productId: opp.product_id,
        productNames: opp.product_names || '',
        ownerId: opp.owner_id,
        accountManagerId: opp.account_manager_id,
        accountManagerName: opp.account_manager_name || '',
        probability: opp.probability,
        type: opp.type,
        createdAt: opp.created_at,
        updatedAt: opp.updated_at,
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

  // Update opportunity in De Goudse environment
  app.put('/api/degoudse/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { 
        title, 
        description, 
        clientId,
        productId,
        estimatedValue,
        probability,
        status,
        type,
        expectedCloseDate
      } = req.body;
      
      console.log('Updating De Goudse opportunity:', id, req.body);
      
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        UPDATE degoudse.opportunities 
        SET 
          title = $1, 
          description = $2, 
          "clientId" = $3, 
          "productId" = $4, 
          "estimatedValue" = $5, 
          probability = $6, 
          status = $7, 
          type = $8, 
          "expectedCloseDate" = $9,
          "updatedAt" = NOW()
        WHERE id = $10
        RETURNING *
      `, [
        title, 
        description, 
        clientId,
        productId,
        estimatedValue || 0,
        probability,
        status,
        type,
        expectedCloseDate || null,
        id
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Opportunity not found' });
      }
      
      const updatedOpportunity = result.rows[0];
      console.log('De Goudse opportunity updated successfully:', updatedOpportunity.id);
      
      res.json({
        id: updatedOpportunity.id,
        title: updatedOpportunity.title,
        description: updatedOpportunity.description,
        status: updatedOpportunity.status,
        type: updatedOpportunity.type,
        probability: updatedOpportunity.probability,
        estimatedValue: updatedOpportunity.estimatedValue,
        expectedCloseDate: updatedOpportunity.expectedCloseDate,
        createdAt: updatedOpportunity.createdAt,
        updatedAt: updatedOpportunity.updatedAt
      });
    } catch (error) {
      console.error('Error updating De Goudse opportunity:', error);
      res.status(500).json({ message: 'Failed to update opportunity in De Goudse environment' });
    }
  });

  // Update partners in De Goudse environment
  app.put('/api/degoudse/partners/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, type, status, location, contact_email, contact_phone } = req.body;
      
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        UPDATE degoudse.partners 
        SET 
          name = $1,
          description = $2,
          type = $3,
          status = $4,
          location = $5,
          contact_email = $6,
          contact_phone = $7,
          updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `, [name, description, type, status, location, contact_email, contact_phone, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Partner not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating De Goudse partner:', error);
      res.status(500).json({ error: 'Failed to update partner' });
    }
  });

  // Update customers in De Goudse environment
  app.put('/api/degoudse/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, status, type, location, contact_email, contact_phone } = req.body;
      
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        UPDATE degoudse.customers 
        SET 
          name = $1,
          description = $2,
          status = $3,
          type = $4,
          location = $5,
          contact_email = $6,
          contact_phone = $7,
          updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `, [name, description, status, type, location, contact_email, contact_phone, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating De Goudse customer:', error);
      res.status(500).json({ error: 'Failed to update customer' });
    }
  });

  // Update products in De Goudse environment
  app.put('/api/degoudse/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, category, colorCode, aiContext } = req.body;
      
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        UPDATE degoudse.products 
        SET 
          name = $1,
          description = $2,
          category = $3,
          color_code = $4,
          ai_context = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [name, description, category, colorCode, aiContext, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating De Goudse product:', error);
      res.status(500).json({ error: 'Failed to update product' });
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

  // Update contact in De Goudse environment
  app.put('/api/degoudse/contacts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { 
        firstName, lastName, email, phone, 
        company, position, department, linkedEntityType, linkedEntityId, 
        notes, isActive 
      } = req.body;
      
      const fullName = `${firstName} ${lastName}`.trim();
      
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        UPDATE degoudse.contacts 
        SET 
          first_name = $1,
          last_name = $2,
          full_name = $3,
          email = $4,
          phone = $5,
          job_title = $6,
          department = $7,
          company = $8,
          linked_entity_type = $9,
          linked_entity_id = $10,
          notes = $11,
          is_active = $12,
          updated_at = NOW()
        WHERE id = $13
        RETURNING id, first_name, last_name, full_name, email, phone, 
                 job_title, department, company, linked_entity_type, 
                 linked_entity_id, is_primary, notes, tags, is_active, 
                 created_at, updated_at
      `, [
        firstName, lastName, fullName, email || null, 
        phone || null, position || null, department || null, company || null,
        linkedEntityType || null, linkedEntityId || null, 
        notes || null, isActive !== false, id
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      console.log(`Contact updated successfully in De Goudse environment:`, result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating De Goudse contact:', error);
      res.status(500).json({ error: 'Failed to update contact' });
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

  // Update vendor in De Goudse environment
  app.put('/api/degoudse/vendors/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { 
        name, 
        description, 
        location, 
        contactEmail, 
        primaryContact, 
        partnerType, 
        region, 
        status, 
        industry, 
        size 
      } = req.body;
      
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        UPDATE degoudse.vendors 
        SET 
          name = $1,
          description = $2,
          location = $3,
          contact_email = $4,
          primary_contact = $5,
          partner_type = $6,
          region = $7,
          status = $8,
          industry = $9,
          size = $10,
          "updatedAt" = NOW()
        WHERE id = $11
        RETURNING *
      `, [
        name, description, location || null, contactEmail || null, primaryContact || null,
        partnerType, region || null, status, industry, size, id
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
      
      const vendor = result.rows[0];
      console.log('Vendor updated successfully in De Goudse environment:', vendor);
      res.json(vendor);
    } catch (error) {
      console.error('Error updating De Goudse vendor:', error);
      res.status(500).json({ error: 'Failed to update vendor' });
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

  // Opportunity Activities Endpoints
  app.get('/api/degoudse/opportunities/:id/activities', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = pool;
      
      // Fetch activities for this opportunity
      const activitiesResult = await envPool.query(`
        SELECT a.*, u.name as user_name
        FROM degoudse.activities a
        LEFT JOIN degoudse.users u ON a.assigned_to = u.id::text
        WHERE a.entity_type = 'opportunity' AND a.entity_id = $1
        ORDER BY a.created_at DESC
      `, [opportunityId]);
      
      console.log(`Fetched ${activitiesResult.rows.length} activities for opportunity ${opportunityId}`);
      res.json({ tasks: activitiesResult.rows.filter(a => a.activity_type === 'task') });
    } catch (error) {
      console.error('Error fetching opportunity activities:', error);
      res.status(500).json({ error: 'Failed to fetch opportunity activities' });
    }
  });

  app.post('/api/degoudse/opportunities/:id/activities', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const { activity_type, title, content, priority, visible_to_partner, assigned_to } = req.body;
      const envPool = pool;
      
      console.log(`Creating ${activity_type} for opportunity ${opportunityId}:`, { title, content, priority, assigned_to });
      
      if (activity_type === 'task') {
        // Insert task into activities table
        const result = await envPool.query(`
          INSERT INTO degoudse.activities 
          (activity_type, title, content, priority, completed, visible_to_partner, entity_type, entity_id, assigned_to, created_at, updated_at)
          VALUES ($1, $2, $3, $4, false, $5, 'opportunity', $6, $7, NOW(), NOW())
          RETURNING *
        `, [activity_type, title, content || '', priority || 'medium', visible_to_partner || false, opportunityId, assigned_to || null]);
        
        console.log(`Successfully created opportunity task with ID: ${result.rows[0].id}`);
        res.json(result.rows[0]);
      } else if (activity_type === 'comment') {
        // Insert comment into activities table
        const result = await envPool.query(`
          INSERT INTO degoudse.activities 
          (activity_type, content, visible_to_partner, entity_type, entity_id, assigned_to, created_at, updated_at)
          VALUES ($1, $2, $3, 'opportunity', $4, $5, NOW(), NOW())
          RETURNING *
        `, [activity_type, content || '', visible_to_partner || false, opportunityId, assigned_to || null]);
        
        console.log(`Successfully created opportunity comment with ID: ${result.rows[0].id}`);
        res.json(result.rows[0]);
      } else {
        return res.status(400).json({ error: 'Invalid activity type' });
      }
    } catch (error) {
      console.error('Error creating opportunity activity:', error);
      res.status(500).json({ error: `Failed to create ${req.body.activity_type || 'activity'}` });
    }
  });

  app.post('/api/degoudse/opportunities/:id/tasks', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const { title, description, priority, visible_to_partner, assigned_to } = req.body;
      const envPool = pool;
      
      // Get the actual partner_id for this opportunity
      const opportunityResult = await envPool.query(`
        SELECT partner_id FROM degoudse.opportunities WHERE id = $1
      `, [opportunityId]);
      
      if (opportunityResult.rows.length === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }
      
      const partnerId = opportunityResult.rows[0].partner_id;
      
      // Insert task using the correct partner_id and entity linking
      const result = await envPool.query(`
        INSERT INTO degoudse.activity_tasks 
        (partner_id, title, description, priority, assigned_to, status, entity_type, entity_id, visible_to_partner)
        VALUES ($1, $2, $3, $4, $5, 'pending', 'opportunity', $6, $7)
        RETURNING *
      `, [partnerId, title, description || null, priority || 'medium', assigned_to || null, opportunityId, visible_to_partner || false]);
      
      console.log(`Created opportunity task for partner ${partnerId}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating opportunity task:', error);
      res.status(500).json({ error: 'Failed to create opportunity task' });
    }
  });

  app.post('/api/degoudse/opportunities/:id/comments', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const { content, visible_to_partner } = req.body;
      const envPool = pool;
      
      if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ error: 'Comment content is required and must be a non-empty string' });
      }
      
      // Get the actual partner_id for this opportunity
      const opportunityResult = await envPool.query(`
        SELECT partner_id FROM degoudse.opportunities WHERE id = $1
      `, [opportunityId]);
      
      if (opportunityResult.rows.length === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }
      
      const partnerId = opportunityResult.rows[0].partner_id;
      const finalContent = content.trim();
      
      // Insert comment using the correct partner_id and entity linking
      const result = await envPool.query(`
        INSERT INTO degoudse.activity_comments 
        (partner_id, content, user_id, visible_to_partner, entity_type, entity_id)
        VALUES ($1, $2, 1, $3, 'opportunity', $4)
        RETURNING *
      `, [partnerId, finalContent, visible_to_partner || false, opportunityId]);
      
      console.log(`Created opportunity comment for partner ${partnerId}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating opportunity comment:', error);
      res.status(500).json({ error: 'Failed to create opportunity comment', details: error.message });
    }
  });

  app.post('/api/degoudse/opportunities/:id/attachments', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const { filename, description, visible_to_partner } = req.body;
      const envPool = pool;
      
      // Insert attachment with opportunity entity type
      const result = await envPool.query(`
        INSERT INTO degoudse.activity_attachments 
        (entity_type, entity_id, filename, original_name, file_type, file_size, uploaded_by_id, description)
        VALUES ('opportunity', $1, $2, $2, 'document', 0, 1, $3)
        RETURNING *
      `, [opportunityId, filename, description || null]);
      
      // Get related partners for this opportunity to sync activities
      const partnersResult = await envPool.query(`
        SELECT p.id
        FROM degoudse.partners p
        INNER JOIN degoudse.opportunities o ON p.id = o.partner_id
        WHERE o.id = $1
      `, [opportunityId]);
      
      // Create cross-entity activity references for each related partner
      for (const partner of partnersResult.rows) {
        await envPool.query(`
          INSERT INTO degoudse.activity_attachments 
          (entity_type, entity_id, filename, original_name, file_type, file_size, uploaded_by_id, description, related_entity_type, related_entity_id)
          VALUES ('partner', $1, $2, $2, 'document', 0, 1, $3, 'opportunity', $4)
        `, [partner.id, filename, description || null, opportunityId]);
      }
      
      console.log(`Created opportunity attachment and synced to ${partnersResult.rows.length} related partners`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating opportunity attachment:', error);
      res.status(500).json({ error: 'Failed to create opportunity attachment' });
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

  // Get individual saved list by ID for De Goudse
  app.get('/api/degoudse/saved-lists/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT * FROM degoudse.saved_lists WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Saved list not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching saved list in De Goudse:', error);
      res.status(500).json({ message: 'Failed to fetch saved list for De Goudse environment' });
    }
  });

  app.delete('/api/degoudse/saved-lists/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envPool = pool;
      
      console.log(`Attempting to delete saved list with ID: ${id} from degoudse schema`);
      
      const result = await envPool.query(`
        DELETE FROM degoudse.saved_lists WHERE id = $1
      `, [id]);
      
      console.log(`Delete result: rowCount = ${result.rowCount}`);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Saved list not found' });
      }
      
      // Clear cache after deleting a list
      cache.clear();
      console.log('Cache cleared after deleting list');
      
      res.json({ message: 'Saved list deleted successfully' });
    } catch (error) {
      console.error('Error deleting saved list in De Goudse:', error);
      res.status(500).json({ message: 'Failed to delete saved list for De Goudse environment' });
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
          LEFT JOIN degoudse.opportunities o ON o.partnerId = p.id
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
                    `INSERT INTO degoudse.vendors (name, description, "createdAt", "updatedAt")
                     VALUES ($1, $2, NOW(), NOW())`,
                    [cellValue, `Vendor created from ${fileName}`]
                  );
                  entityStats.vendors++;
                }
              
              } else if (mapping.entityType === 'product') {
                const result = await envPool.query(
                  `SELECT * FROM degoudse.products WHERE LOWER(name) = LOWER($1)`,
                  [cellValue]
                );
                
                if (result.rows.length === 0) {
                  await envPool.query(
                    `INSERT INTO degoudse.products (name, description, category, created_at, updated_at)
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

  // AI Code Generation API endpoint
  app.post('/api/:envId/generate-transformation-code', async (req, res) => {
    try {
      const { prompt, uploadType, context } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          error: 'OpenAI API key is required for AI code generation. Please provide OPENAI_API_KEY in environment variables.' 
        });
      }

      // Import OpenAI dynamically
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Create system prompt for code generation
      const systemPrompt = `You are an expert at creating simple Python expressions for CSV data transformation. Generate ONLY the transformation expression, not a full function.

Key requirements:
1. Generate a SINGLE LINE expression that can be used in a preview system
2. Use column references in format: column_name (lowercase, underscores for spaces)
3. For combining columns, use: column_first_name + " " + column_last_name
4. For conditional logic, use: "Yes" if column_status == "Active" else "No"
5. Keep expressions simple and easy to preview
6. NO function definitions, NO imports, NO pandas DataFrame operations
7. Just the transformation expression itself

Available columns from CSV: ${context.csvHeaders ? context.csvHeaders.join(', ') : 'Not provided'}
Target attribute: ${context.attributeName || uploadType}

Examples:
- Combine names: column_first_name + " " + column_last_name
- Add prefix: "CLIENT_" + column_id
- Conditional: "Active" if column_status == "Y" else "Inactive"
- Uppercase: column_name.upper()

Respond with a JSON object containing:
{
  "code": "single line expression only",
  "explanation": "a clear, non-technical explanation of what the expression does"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Generate Python code for this transformation: ${prompt}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const result = response.choices[0].message.content;
      
      try {
        const parsedResult = JSON.parse(result);
        res.json(parsedResult);
      } catch (parseError) {
        // If JSON parsing fails, extract code and create explanation
        const codeMatch = result.match(/```python\n([\s\S]*?)\n```/);
        const code = codeMatch ? codeMatch[1] : result;
        
        res.json({
          code: code,
          explanation: "AI generated transformation code based on your description. The code uses pandas to process your CSV data and applies the requested transformations."
        });
      }

    } catch (error) {
      console.error('AI code generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate transformation code. Please check your OpenAI API key and try again.' 
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
            LEFT JOIN degoudse.partner_opportunities po ON p.id = po.partnerId  
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

  // Product Category API endpoints for nested hierarchy management
  
  // Get all product categories in hierarchical structure
  app.get('/api/:envId/product-categories', async (req, res) => {
    try {
      const envId = req.params.envId;
      const cacheKey = `${envId}_product_categories`;
      const cached = getCached(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }
      
      const envPool = pool;
      
      // Get all categories with parent information
      const result = await envPool.query(`
        SELECT 
          c.*,
          p.name as parent_name,
          (SELECT COUNT(*) FROM ${envId}.products WHERE category = c.name) as product_count,
          (SELECT COUNT(*) FROM ${envId}.categories WHERE parent_id = c.id) as child_count
        FROM ${envId}.categories c
        LEFT JOIN ${envId}.categories p ON c.parent_id = p.id
        ORDER BY c.parent_id NULLS FIRST, c.name
      `);
      
      // Build hierarchical structure
      const categories = result.rows;
      const categoryMap = new Map();
      const rootCategories = [];
      
      // First pass: create category objects with proper structure
      categories.forEach(cat => {
        categoryMap.set(cat.id, { 
          ...cat, 
          subcategories: [],
          subSubcategories: []
        });
      });
      
      // Second pass: build three-level hierarchy
      categories.forEach(cat => {
        const category = categoryMap.get(cat.id);
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            // Check if parent has a parent (making this a sub-subcategory)
            if (parent.parent_id) {
              // This is a sub-subcategory (third level)
              if (!parent.subSubcategories) parent.subSubcategories = [];
              parent.subSubcategories.push(category);
            } else {
              // This is a subcategory (second level)
              if (!parent.subcategories) parent.subcategories = [];
              parent.subcategories.push(category);
            }
          }
        } else {
          // This is a root category (first level)
          rootCategories.push(category);
        }
      });
      
      setCache(cacheKey, rootCategories);
      res.json(rootCategories);
    } catch (error) {
      console.error('Error fetching product categories:', error);
      res.status(500).json({ error: 'Failed to fetch product categories' });
    }
  });
  
  // Create new product category
  app.post('/api/:envId/product-categories', async (req, res) => {
    try {
      const envId = req.params.envId;
      const validatedData = insertProductCategorySchema.parse(req.body);
      const envPool = pool;
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.product_categories (name, description, parent_id, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [validatedData.name, validatedData.description, validatedData.parentId, validatedData.status || 'active']);
      
      // Clear cache
      cache.delete(`${envId}_product_categories`);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating product category:', error);
      res.status(500).json({ error: 'Failed to create product category' });
    }
  });
  
  // Update product category
  app.put('/api/:envId/product-categories/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const categoryId = parseInt(req.params.id);
      const validatedData = insertProductCategorySchema.parse(req.body);
      const envPool = pool;
      
      // Check for circular reference
      if (validatedData.parentId) {
        const checkResult = await envPool.query(`
          WITH RECURSIVE category_path AS (
            SELECT id, parent_id FROM ${envId}.product_categories WHERE id = $1
            UNION ALL
            SELECT c.id, c.parent_id 
            FROM ${envId}.product_categories c
            JOIN category_path cp ON c.id = cp.parent_id
          )
          SELECT id FROM category_path WHERE id = $2
        `, [validatedData.parentId, categoryId]);
        
        if (checkResult.rows.length > 0) {
          return res.status(400).json({ error: 'Cannot set parent - would create circular reference' });
        }
      }
      
      const result = await envPool.query(`
        UPDATE ${envId}.product_categories 
        SET name = $1, description = $2, parent_id = $3, status = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `, [validatedData.name, validatedData.description, validatedData.parentId, validatedData.status || 'active', categoryId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product category not found' });
      }
      
      // Clear cache
      cache.delete(`${envId}_product_categories`);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating product category:', error);
      res.status(500).json({ error: 'Failed to update product category' });
    }
  });
  
  // Delete product category
  app.delete('/api/:envId/product-categories/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const categoryId = parseInt(req.params.id);
      const envPool = pool;
      
      // Check if category has children (skip product check since products use text categories)
      const checkResult = await envPool.query(`
        SELECT 
          (SELECT COUNT(*) FROM ${envId}.product_categories WHERE parent_id = $1) as child_count
      `, [categoryId]);
      
      const { child_count } = checkResult.rows[0];
      
      if (child_count > 0) {
        return res.status(400).json({ 
          error: `Cannot delete category - it has ${child_count} subcategories. Please move or delete the subcategories first.` 
        });
      }
      
      const result = await envPool.query(`
        DELETE FROM ${envId}.product_categories WHERE id = $1 RETURNING *
      `, [categoryId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product category not found' });
      }
      
      // Clear cache
      cache.delete(`${envId}_product_categories`);
      
      res.json({ message: 'Product category deleted successfully' });
    } catch (error) {
      console.error('Error deleting product category:', error);
      res.status(500).json({ error: 'Failed to delete product category' });
    }
  });

  // ===== PRODUCT CATALOGUES API =====

  // Get all product catalogues
  app.get('/api/:envId/product-catalogues', async (req, res) => {
    try {
      const envId = req.params.envId;
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT 
          pc.*,
          (SELECT COUNT(*) FROM ${envId}.catalogue_products cp WHERE cp.catalogue_id = pc.id) as product_count
        FROM ${envId}.product_catalogues pc
        ORDER BY pc.name ASC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching product catalogues:', error);
      res.status(500).json({ error: 'Failed to fetch product catalogues' });
    }
  });

  // Get single product catalogue by ID
  app.get('/api/:envId/product-catalogues/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const catalogueId = parseInt(req.params.id);
      const envPool = pool;
      
      if (isNaN(catalogueId)) {
        return res.status(400).json({ error: 'Invalid catalogue ID' });
      }
      
      const result = await envPool.query(`
        SELECT 
          pc.*,
          (SELECT COUNT(*) FROM ${envId}.catalogue_products cp WHERE cp.catalogue_id = pc.id) as product_count
        FROM ${envId}.product_catalogues pc
        WHERE pc.id = $1
      `, [catalogueId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product catalogue not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching product catalogue:', error);
      res.status(500).json({ error: 'Failed to fetch product catalogue' });
    }
  });

  // Create product catalogue
  app.post('/api/:envId/product-catalogues', async (req, res) => {
    try {
      const envId = req.params.envId;
      const { name, description, status, effectiveFrom, effectiveTo } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.product_catalogues (name, description, status, effective_from, effective_to)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [name, description, status, effectiveFrom, effectiveTo]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating product catalogue:', error);
      res.status(500).json({ error: 'Failed to create product catalogue' });
    }
  });

  // Update product catalogue
  app.put('/api/:envId/product-catalogues/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const catalogueId = parseInt(req.params.id);
      const { name, description, status, effectiveFrom, effectiveTo } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(`
        UPDATE ${envId}.product_catalogues 
        SET name = $1, description = $2, status = $3, effective_from = $4, effective_to = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [name, description, status, effectiveFrom, effectiveTo, catalogueId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product catalogue not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating product catalogue:', error);
      res.status(500).json({ error: 'Failed to update product catalogue' });
    }
  });

// Saved Views API endpoints - redirect to De Goudse
app.get('/api/saved-views', (req, res) => {
  const queryParams = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(`/api/degoudse/saved-views${queryParams}`);
});

app.put('/api/saved-views/:id', async (req, res) => {
  const queryParams = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(`/api/degoudse/saved-views/${req.params.id}${queryParams}`);
});

// Main entity routes - redirect all to De Goudse (opportunities already handled above)
app.post('/api/opportunities', (req, res) => res.redirect(307, '/api/degoudse/opportunities'));
app.get('/api/partners', (req, res) => res.redirect('/api/degoudse/partners'));
app.get('/api/customers', (req, res) => res.redirect('/api/degoudse/customers'));
app.get('/api/products', (req, res) => res.redirect('/api/degoudse/products'));
app.get('/api/contacts', (req, res) => res.redirect('/api/degoudse/contacts'));
app.post('/api/contacts', (req, res) => res.redirect(307, '/api/degoudse/contacts'));
app.get('/api/vendors', (req, res) => res.redirect('/api/degoudse/vendors'));
app.post('/api/vendors', (req, res) => res.redirect(307, '/api/degoudse/vendors'));
app.get('/api/okr-metrics', (req, res) => res.redirect('/api/degoudse/okr-metrics'));
app.get('/api/okr-tags', (req, res) => res.redirect('/api/degoudse/okr-tags'));
app.get('/api/users', (req, res) => res.redirect('/api/degoudse/users'));
app.post('/api/users', (req, res) => res.redirect(307, '/api/degoudse/users'));

// Delete product catalogue
app.delete('/api/:envId/product-catalogues/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const catalogueId = parseInt(req.params.id);
      const envPool = pool;
      
      // Check if catalogue has products
      const checkResult = await envPool.query(`
        SELECT COUNT(*) as product_count FROM ${envId}.catalogue_products WHERE catalogue_id = $1
      `, [catalogueId]);
      
      const { product_count } = checkResult.rows[0];
      
      if (product_count > 0) {
        return res.status(400).json({ 
          error: `Cannot delete catalogue - it contains ${product_count} products. Please remove the products first.` 
        });
      }
      
      const result = await envPool.query(`
        DELETE FROM ${envId}.product_catalogues WHERE id = $1 RETURNING *
      `, [catalogueId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product catalogue not found' });
      }
      
      res.json({ message: 'Product catalogue deleted successfully' });
    } catch (error) {
      console.error('Error deleting product catalogue:', error);
      res.status(500).json({ error: 'Failed to delete product catalogue' });
    }
  });

  // ===== CATEGORIES API =====

  // Get all categories
  app.get('/api/:envId/categories', async (req, res) => {
    try {
      const envId = req.params.envId;
      const envPool = pool;
      
      console.log(`Returning categories from ${envId} database`);
      
      const result = await envPool.query(`
        SELECT 
          c.*,
          p.name as parent_category_name
        FROM ${envId}.categories c
        LEFT JOIN ${envId}.categories p ON c.parent_id = p.id
        WHERE c.is_active = true
        ORDER BY c.level ASC, c.created_at DESC, c.name ASC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // Create category
  app.post('/api/:envId/categories', async (req, res) => {
    try {
      const envId = req.params.envId;
      const { name, color, icon, description, parentId, level, sortOrder, isActive } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.categories (name, color, icon, description, parent_id, level, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [name, color || '#3B82F6', icon, description, parentId, level || 1, sortOrder || 0, isActive !== false]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  // Update category
  app.put('/api/:envId/categories/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const categoryId = parseInt(req.params.id);
      const { name, color, icon, description, parentId, level, sortOrder, isActive } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(`
        UPDATE ${envId}.categories 
        SET name = $1, color = $2, icon = $3, description = $4, parent_id = $5, level = $6, sort_order = $7, is_active = $8, updated_at = NOW()
        WHERE id = $9
        RETURNING *
      `, [name, color, icon, description, parentId, level, sortOrder, isActive, categoryId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  });

  // Delete category
  app.delete('/api/:envId/categories/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const categoryId = parseInt(req.params.id);
      const envPool = pool;
      
      // Check if category has children
      const childrenCount = await envPool.query(`
        SELECT COUNT(*) as count FROM ${envId}.categories WHERE parent_id = $1 AND is_active = true
      `, [categoryId]);
      
      if (childrenCount.rows[0].count > 0) {
        return res.status(400).json({ 
          error: `Cannot delete category - it has ${childrenCount.rows[0].count} subcategories. Please remove the subcategories first.` 
        });
      }
      
      // Check if category is used by product templates
      const templateCount = await envPool.query(`
        SELECT COUNT(*) as count FROM ${envId}.product_templates WHERE category_id = $1 AND is_active = true
      `, [categoryId]);
      
      if (templateCount.rows[0].count > 0) {
        return res.status(400).json({ 
          error: `Cannot delete category - it is used by ${templateCount.rows[0].count} product templates. Please reassign the templates first.` 
        });
      }
      
      const result = await envPool.query(`
        DELETE FROM ${envId}.categories WHERE id = $1 RETURNING *
      `, [categoryId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // ===== PRODUCT TEMPLATES API =====

  // Get all product templates
  app.get('/api/:envId/product-templates', async (req, res) => {
    try {
      const envId = req.params.envId;
      const envPool = pool;
      
      console.log(`Returning product templates from ${envId} database`);
      
      const result = await envPool.query(`
        SELECT 
          pt.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon,
          v.name as vendor_name,
          -- Get partner count (indirect through opportunities)
          (SELECT COUNT(DISTINCT o.partner_id) 
           FROM ${envId}.opportunities o 
           JOIN ${envId}.opportunity_products op ON o.id = op.opportunity_id 
           WHERE op.product_id = pt.id AND o.partner_id IS NOT NULL) as partner_count,
          -- Get customer count (mapped from category name-based assignments)
          COALESCE(cp_count.customer_count, 0) as customer_count,
          -- Get opportunity count
          (SELECT COUNT(DISTINCT o.id)
           FROM ${envId}.opportunities o
           JOIN ${envId}.opportunity_products op ON o.id = op.opportunity_id
           WHERE op.product_id = pt.id) as opportunity_count
        FROM ${envId}.product_templates pt
        LEFT JOIN ${envId}.categories c ON pt.category_id = c.id
        LEFT JOIN ${envId}.vendors v ON pt.vendor_id = v.id
        LEFT JOIN (
          SELECT 
            CASE 
              WHEN tc.name = 'Pensioen' THEN 'Pensioen'
              WHEN tc.name = 'Inkomen Collectief' THEN 'Inkomen'
              WHEN tc.name = 'Schade Zakelijk' THEN 'Schade'
              WHEN tc.name = 'Overige' THEN 'Overige'
              ELSE tc.name
            END as template_category,
            COUNT(DISTINCT cp.customer_id) as customer_count
          FROM ${envId}.products p
          JOIN ${envId}.customer_products cp ON p.id = cp.product_id
          JOIN ${envId}.categories pc ON p.category_id = pc.id
          JOIN ${envId}.categories tc ON (
            (tc.name = 'Pensioen' AND pc.name LIKE '%Pensioen%') OR
            (tc.name = 'Inkomen Collectief' AND (pc.name LIKE '%WIA%' OR pc.name LIKE '%WGA%' OR pc.name LIKE '%Ziektewet%' OR pc.name LIKE '%Verzuim%')) OR
            (tc.name = 'Schade Zakelijk' AND (pc.name LIKE '%verzekering%' OR pc.name LIKE '%Aansprakelijkheid%' OR pc.name LIKE '%Brand%' OR pc.name LIKE '%Cyber%' OR pc.name LIKE '%Rechtsbijstand%' OR pc.name LIKE '%Krediet%' OR pc.name LIKE '%Machinebreuk%' OR pc.name LIKE '%Transport%' OR pc.name LIKE '%Construction%' OR pc.name LIKE '%Wagenpark%')) OR
            (tc.name = 'Overige' AND pc.name LIKE '%Keymanverzekering%')
          )
          GROUP BY template_category
        ) cp_count ON (
          CASE 
            WHEN c.name = 'Pensioen' THEN 'Pensioen'
            WHEN c.name = 'Inkomen Collectief' THEN 'Inkomen'
            WHEN c.name = 'Schade Zakelijk' THEN 'Schade'
            WHEN c.name = 'Overige' THEN 'Overige'
            ELSE c.name
          END = cp_count.template_category
        )
        WHERE pt.is_active = true
        ORDER BY pt.name ASC
      `);
      
      // Transform snake_case to camelCase for frontend
      const transformedRows = result.rows.map(row => ({
        id: row.id,
        productId: row.product_id,
        name: row.name,
        description: row.description,
        categoryId: row.category_id,
        category: row.category_name,
        providerId: row.provider_id,
        providerType: row.provider_type,
        providerName: row.provider_name,
        contractStartDate: row.contract_start_date,
        contractEndDate: row.contract_end_date,
        averagePrice: row.average_price,
        premiumValue: row.premium_value,
        premiumPercentage: row.premium_percentage,
        discount: row.discount,
        discountPercentage: row.discount_percentage,
        vendorId: row.vendor_id,
        isActive: row.is_active,
        notes: row.notes,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        categoryName: row.category_name,
        categoryColor: row.category_color,
        categoryIcon: row.category_icon,
        vendorName: row.vendor_name,
        partnerCount: parseInt(row.partner_count) || 0,
        customerCount: parseInt(row.customer_count) || 0,
        opportunityCount: parseInt(row.opportunity_count) || 0
      }));
      
      res.json(transformedRows);
    } catch (error) {
      console.error('Error fetching product templates:', error);
      res.status(500).json({ error: 'Failed to fetch product templates' });
    }
  });

  // Create product template
  app.post('/api/:envId/product-templates', async (req, res) => {
    try {
      const envId = req.params.envId;
      const { 
        productId, name, description, categoryId, category, 
        providerId, providerType, providerName,
        contractStartDate, contractEndDate,
        averagePrice, premiumValue, premiumPercentage,
        discount, discountPercentage, vendorId,
        isActive, status, notes, tags 
      } = req.body;
      
      const envPool = pool;
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.product_templates (
          product_id, name, description, category_id, category,
          provider_id, provider_type, provider_name,
          contract_start_date, contract_end_date,
          average_price, premium_value, premium_percentage,
          discount, discount_percentage, vendor_id,
          is_active, status, notes, tags
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `, [
        productId, name, description, categoryId, category,
        providerId, providerType, providerName,
        contractStartDate, contractEndDate,
        averagePrice, premiumValue, premiumPercentage,
        discount, discountPercentage, vendorId,
        isActive ?? true, status ?? 'active', notes, JSON.stringify(tags || [])
      ]);
      
      // Transform response to camelCase
      const transformedRow = {
        id: result.rows[0].id,
        productId: result.rows[0].product_id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        categoryId: result.rows[0].category_id,
        category: result.rows[0].category,
        providerId: result.rows[0].provider_id,
        providerType: result.rows[0].provider_type,
        providerName: result.rows[0].provider_name,
        contractStartDate: result.rows[0].contract_start_date,
        contractEndDate: result.rows[0].contract_end_date,
        averagePrice: result.rows[0].average_price,
        premiumValue: result.rows[0].premium_value,
        premiumPercentage: result.rows[0].premium_percentage,
        discount: result.rows[0].discount,
        discountPercentage: result.rows[0].discount_percentage,
        vendorId: result.rows[0].vendor_id,
        isActive: result.rows[0].is_active,
        notes: result.rows[0].notes,
        tags: result.rows[0].tags,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      };
      
      res.status(201).json(transformedRow);
    } catch (error) {
      console.error('Error creating product template:', error);
      res.status(500).json({ error: 'Failed to create product template' });
    }
  });

  // Update product template
  app.put('/api/:envId/product-templates/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const templateId = parseInt(req.params.id);
      const { 
        productId, name, description, categoryId, category, 
        providerId, providerType, providerName,
        contractStartDate, contractEndDate,
        averagePrice, premiumValue, premiumPercentage,
        discount, discountPercentage, vendorId,
        isActive, status, notes, tags 
      } = req.body;
      
      const envPool = pool;
      
      const result = await envPool.query(`
        UPDATE ${envId}.product_templates SET
          product_id = $1, name = $2, description = $3, category_id = $4, category = $5,
          provider_id = $6, provider_type = $7, provider_name = $8,
          contract_start_date = $9, contract_end_date = $10,
          average_price = $11, premium_value = $12, premium_percentage = $13,
          discount = $14, discount_percentage = $15, vendor_id = $16,
          is_active = $17, status = $18, notes = $19, tags = $20,
          updated_at = NOW()
        WHERE id = $21
        RETURNING *
      `, [
        productId, name, description, categoryId, category,
        providerId, providerType, providerName,
        contractStartDate, contractEndDate,
        averagePrice, premiumValue, premiumPercentage,
        discount, discountPercentage, vendorId,
        isActive, status, notes, JSON.stringify(tags || []),
        templateId
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product template not found' });
      }
      
      // Transform response to camelCase
      const transformedRow = {
        id: result.rows[0].id,
        productId: result.rows[0].product_id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        categoryId: result.rows[0].category_id,
        category: result.rows[0].category,
        providerId: result.rows[0].provider_id,
        providerType: result.rows[0].provider_type,
        providerName: result.rows[0].provider_name,
        contractStartDate: result.rows[0].contract_start_date,
        contractEndDate: result.rows[0].contract_end_date,
        averagePrice: result.rows[0].average_price,
        premiumValue: result.rows[0].premium_value,
        premiumPercentage: result.rows[0].premium_percentage,
        discount: result.rows[0].discount,
        discountPercentage: result.rows[0].discount_percentage,
        vendorId: result.rows[0].vendor_id,
        isActive: result.rows[0].is_active,
        notes: result.rows[0].notes,
        tags: result.rows[0].tags,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      };
      
      res.json(transformedRow);
    } catch (error) {
      console.error('Error updating product template:', error);
      res.status(500).json({ error: 'Failed to update product template' });
    }
  });

  // Delete product template
  app.delete('/api/:envId/product-templates/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const templateId = parseInt(req.params.id);
      const envPool = pool;
      
      const result = await envPool.query(`
        DELETE FROM ${envId}.product_templates WHERE id = $1 RETURNING *
      `, [templateId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product template not found' });
      }
      
      res.json({ message: 'Product template deleted successfully' });
    } catch (error) {
      console.error('Error deleting product template:', error);
      res.status(500).json({ error: 'Failed to delete product template' });
    }
  });

  // ===== CATALOGUE PRODUCTS API =====

  // Get products in a specific catalogue with overrides
  app.get('/api/:envId/catalogues/:catalogueId/products', async (req, res) => {
    try {
      const envId = req.params.envId;
      const catalogueId = parseInt(req.params.catalogueId);
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT 
          cp.*,
          p.name as product_name,
          p.description as product_description,
          p.sku,
          p.price as base_price,
          p.vendor_id,
          v.name as vendor_name,
          pc.name as category_name,
          COALESCE(cp.name_override, p.name) as display_name,
          COALESCE(cp.price_override, p.price) as display_price
        FROM ${envId}.catalogue_products cp
        JOIN ${envId}.products p ON cp.product_id = p.id
        LEFT JOIN ${envId}.vendors v ON p.vendor_id = v.id
        LEFT JOIN ${envId}.product_categories pc ON cp.category_id = pc.id
        WHERE cp.catalogue_id = $1 AND cp.visible = true
        ORDER BY COALESCE(cp.name_override, p.name) ASC
      `, [catalogueId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching catalogue products:', error);
      res.status(500).json({ error: 'Failed to fetch catalogue products' });
    }
  });

  // Add product to catalogue with optional overrides
  app.post('/api/:envId/catalogues/:catalogueId/products', async (req, res) => {
    try {
      const envId = req.params.envId;
      const catalogueId = parseInt(req.params.catalogueId);
      const { productId, categoryId, visible, nameOverride, priceOverride } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.catalogue_products (product_id, catalogue_id, category_id, visible, name_override, price_override)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [productId, catalogueId, categoryId, visible, nameOverride, priceOverride]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding product to catalogue:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ error: 'Product is already in this catalogue' });
      } else {
        res.status(500).json({ error: 'Failed to add product to catalogue' });
      }
    }
  });

  // Update catalogue product overrides
  app.put('/api/:envId/catalogue-products/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const catalogueProductId = parseInt(req.params.id);
      const { categoryId, visible, nameOverride, priceOverride } = req.body;
      const envPool = pool;
      
      const result = await envPool.query(`
        UPDATE ${envId}.catalogue_products 
        SET category_id = $1, visible = $2, name_override = $3, price_override = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `, [categoryId, visible, nameOverride, priceOverride, catalogueProductId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Catalogue product not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating catalogue product:', error);
      res.status(500).json({ error: 'Failed to update catalogue product' });
    }
  });

  // Remove product from catalogue
  app.delete('/api/:envId/catalogue-products/:id', async (req, res) => {
    try {
      const envId = req.params.envId;
      const catalogueProductId = parseInt(req.params.id);
      const envPool = pool;
      
      const result = await envPool.query(`
        DELETE FROM ${envId}.catalogue_products WHERE id = $1 RETURNING *
      `, [catalogueProductId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Catalogue product not found' });
      }
      
      res.json({ message: 'Product removed from catalogue successfully' });
    } catch (error) {
      console.error('Error removing product from catalogue:', error);
      res.status(500).json({ error: 'Failed to remove product from catalogue' });
    }
  });
  
  // Get products by category (including subcategories)
  app.get('/api/:envId/product-categories/:id/products', async (req, res) => {
    try {
      const envId = req.params.envId;
      const categoryId = parseInt(req.params.id);
      const includeSubcategories = req.query.include_subcategories === 'true';
      const envPool = pool;
      
      let query;
      let params;
      
      if (includeSubcategories) {
        // Get products from this category and all its subcategories
        query = `
          WITH RECURSIVE category_tree AS (
            SELECT id FROM ${envId}.product_categories WHERE id = $1
            UNION ALL
            SELECT c.id 
            FROM ${envId}.product_categories c
            JOIN category_tree ct ON c.parent_id = ct.id
          )
          SELECT 
            p.*,
            c.name as category_name,
            v.name as vendor_name
          FROM ${envId}.products p
          LEFT JOIN ${envId}.product_categories c ON p.category_id = c.id
          LEFT JOIN ${envId}.vendors v ON p.vendor_id = v.id
          WHERE p.category_id IN (SELECT id FROM category_tree)
          ORDER BY p.name
        `;
        params = [categoryId];
      } else {
        // Get products only from this specific category
        query = `
          SELECT 
            p.*,
            c.name as category_name,
            v.name as vendor_name
          FROM ${envId}.products p
          LEFT JOIN ${envId}.product_categories c ON p.category_id = c.id
          LEFT JOIN ${envId}.vendors v ON p.vendor_id = v.id
          WHERE p.category_id = $1
          ORDER BY p.name
        `;
        params = [categoryId];
      }
      
      const result = await envPool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ error: 'Failed to fetch products by category' });
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
      
      // Clear cache after deleting a list
      cache.clear();
      console.log('Cache cleared after deleting list');
      
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

  // Broker-specific endpoint for lists shared with John Smith or partners
  app.get('/api/:envId/broker/shared-lists', async (req, res) => {
    try {
      const { envId } = req.params;
      const entityType = req.query.entity_type as string;
      const envPool = pool;
      
      // Disable caching for this response
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      // Get list collaborators first to find relevant list IDs
      let baseQuery = `
        SELECT lc.list_id
        FROM ${envId}.list_collaborators lc
        WHERE lc.is_active = true
          AND (lc.email LIKE '%john.smith%' OR lc.email LIKE '%partner%' OR lc.name LIKE '%John Smith%')
      `;
      
      const params = [];
      
      // First get the list IDs from collaborators table
      const listIdsResult = await envPool.query(baseQuery, params);
      const listIds = listIdsResult.rows.map(row => row.list_id);
      
      if (listIds.length === 0) {
        console.log('No lists found shared with John Smith or partners');
        res.json([]);
        return;
      }
      
      // Then get the full list details with collaborator info, filtering by entity_type if needed
      // Exclude lists that contain only seed opportunity records (IDs 1-16)
      const placeholders = listIds.map((_, index) => `$${index + 1}`).join(', ');
      let query = `
        SELECT sl.*,
               COUNT(lc.id) as collaborator_count,
               CASE WHEN COUNT(lc.id) > 0 THEN true ELSE false END as has_collaborators,
               STRING_AGG(DISTINCT lc.email, ', ') as collaborator_emails,
               STRING_AGG(DISTINCT lc.name, ', ') as collaborator_names
        FROM ${envId}.saved_lists sl
        LEFT JOIN ${envId}.list_collaborators lc ON sl.id = lc.list_id AND lc.is_active = true
        WHERE sl.id IN (${placeholders}) AND sl.is_shared = true
          AND NOT (sl.members <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16])
      `;
      
      if (entityType) {
        query += ` AND sl.entity_type = $${listIds.length + 1}`;
        listIds.push(entityType);
      }
      
      query += ` GROUP BY sl.id ORDER BY sl.created_at DESC`;
      
      const result = await envPool.query(query, listIds);
      
      console.log(`Found ${result.rows.length} lists shared with John Smith or partners`);
      res.json(result.rows);
    } catch (error) {
      console.error(`Error fetching broker shared lists from ${req.params.envId}:`, error);
      res.status(500).json({ error: 'Failed to fetch broker shared lists' });
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
            WHERE c.is_template = false AND c.status != 'archived'
          `;
          
          const queryParams = [];
          
          // If partner_id is specified, filter campaigns linked to that partner
          if (partner_id) {
            // Get the partner name first to search by name in recipients
            const partnerResult = await pool.query(`SELECT name FROM ${envId}.partners WHERE id = $1`, [partner_id]);
            if (partnerResult.rows.length > 0) {
              const partnerName = partnerResult.rows[0].name;
              
              // Show campaigns that include this partner in their recipients OR are shared with this partner
              query = `
                WITH campaign_matches AS (
                  SELECT DISTINCT c.id
                  FROM ${envId}.campaigns c
                  LEFT JOIN ${envId}.campaign_shares cs ON c.id = cs.campaign_id
                  WHERE c.is_template = false AND c.status != 'archived'
                  AND (
                    (c.recipients::text LIKE '%"name": "' || $1 || '"%' 
                     OR c.recipients::text LIKE '%"id": ' || $2 || '%' 
                     OR c.recipients::text LIKE '%"id":' || $2 || '%')
                    OR 
                    (cs.shared_with_type = 'partner' AND cs.shared_with_id = $3::integer AND cs.is_active = true)
                  )
                )
                SELECT c.id, c.name, c.description, c.type, c.category, c.status, 
                       c.created_by_id, c.sponsor_id, c.list_id, c.subject, c.email_body, 
                       c.email_logo, c.from_name, c.from_email, c.scheduled_time, 
                       c.frequency, c.is_shared, c.is_template, c.tags, c.created_at, 
                       c.updated_at, c.heading, c.button_link, c.button_text, 
                       c.button_color, c.follow_up_emails, c.target_entity_type, c.recipients,
                       c.emails_sent, c.emails_opened, c.open_rate, c.total_clicks,
                       u.name as created_by_name 
                FROM ${envId}.campaigns c
                LEFT JOIN ${envId}.users u ON c.created_by_id = u.id
                INNER JOIN campaign_matches cm ON c.id = cm.id
              `;
              queryParams.push(partnerName, partner_id, partner_id);
            } else {
              // Partner not found, return empty array
              res.json([]);
              return;
            }
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
            scheduled_time: campaign.scheduled_time,
            target_entity_type: campaign.target_entity_type,
            recipients: campaign.recipients || [],
            emails_sent: campaign.emails_sent || 0,
            emails_opened: campaign.emails_opened || 0,
            open_rate: campaign.open_rate || '0.00',
            total_clicks: campaign.total_clicks || 0
          }));
          
          console.log(`Returning ${campaigns.length} campaigns from ${envId} environment:`, campaigns);
          res.json(campaigns);
          return;
        } catch (dbError) {
          console.error('Database error in campaigns endpoint:', dbError);
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
              objective, is_template, frequency, target_entity_type, recipients,
              partner_id, environment_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
          `, [
            campaignData.name,
            campaignData.type || 'cross_sell',
            campaignData.description || '',
            campaignData.status || 'draft',
            campaignData.created_by || 1,
            campaignData.emails?.[0]?.subject || 'Campaign Subject',
            campaignData.emails?.[0]?.content || JSON.stringify(campaignData.emails || []),
            campaignData.objective || null,
            false,
            'one_time',
            campaignData.target_entity_type || null,
            JSON.stringify(campaignData.recipients || []),
            campaignData.partner_id || null,
            envId
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
              target_entity_type = $8,
              recipients = $9,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $10
            RETURNING *
          `, [
            campaignData.name,
            campaignData.type || 'email',
            campaignData.description,
            campaignData.status || 'draft',
            campaignData.emails?.[0]?.subject || null,
            campaignData.emails?.[0]?.content || JSON.stringify(campaignData.emails || []),
            campaignData.objective || null,
            campaignData.target_entity_type || null,
            JSON.stringify(campaignData.recipients || []),
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
        // Special case for broker campaign ID 18
        if (id === '18') {
          const brokerCampaign = {
            id: 18,
            name: 'Einde Termijn IPT Campaign',
            description: 'Term end renewal campaign for life insurance policies',
            type: 'cross_sell',
            category: 'cross_sell',
            status: 'draft',
            sharedAt: new Date().toISOString(),
            sharedBy: 'Baloise Team',
            accessLevel: 'view',
            isTemplate: false,
            isShared: true,
            sponsorName: 'Baloise Insurance',
            tags: ['IPT', 'End of Term', 'Cross-sell'],
            subject: 'Proficiat met jouw pensioen!',
            email_body: '[{"id":"xs0vcu9t5","type":"heading","content":"Proficiat met jouw pensioen!","properties":{}},{"id":"60207khoa","type":"text","content":"Beste {{name}}","properties":{}},{"id":"k7jmc8at5","type":"text","content":"Proficiat met jouw welverdiende pensioen! Je kan je afvragen: \\"wat nu?\\" ","properties":{}},{"id":"89rkdl68m","type":"text","content":"Wel, we gaan over tot het uitkeren van jouw IPT fonds aan jou. Graag hadden we hiervoor kort besproken welke opties er voor jou zijn. Boek een moment met ons hier: ","properties":{}},{"id":"6pwewvxfc","type":"button","content":"Kalendar link","properties":{"url":"Kalendar link here"}}]',
            emailBody: 'Proficiat met jouw welverdiende pensioen! Je kan je afvragen: "wat nu?" Wel, we gaan over tot het uitkeren van jouw IPT fonds aan jou.',
            emails_sent: 245,
            emails_opened: 89,
            open_rate: '36.33',
            total_clicks: 34,
            recipients: [],
            partner_id: 26,
            partner_name: 'Induver',
            environment_id: 'baloise',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            createdById: 2,
            sponsorId: null,
            target_entity_type: 'opportunities',
            followUpEmails: [],
            frequency: 'one_time',
            scheduledTime: null,
            // Campaign steps data
            steps: [
              {
                id: 1,
                step_number: 1,
                step_type: 'email',
                name: 'Initial Notification',
                description: 'Send initial notification about policy expiration',
                subject: 'Proficiat met jouw pensioen!',
                email_body: 'Proficiat met jouw welverdiende pensioen! Je kan je afvragen: "wat nu?" Wel, we gaan over tot het uitkeren van jouw IPT fonds aan jou. Graag hadden we hiervoor kort besproken welke opties er voor jou zijn.',
                delay_days: 0,
                is_active: true
              }
            ]
          };
          
          console.log(`Returning broker campaign ${id} for environment ${envId}`);
          res.json(brokerCampaign);
          return;
        }
        
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
            followUpEmails: campaign.follow_up_emails || [],
            target_entity_type: campaign.target_entity_type,
            recipients: campaign.recipients || []
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


  // Get campaigns shared with broker users (environment-specific route)
  app.get('/api/:envId/broker/shared-campaigns', async (req, res) => {
    try {
      const { envId } = req.params;
      
      if (envId === 'degoudse') {
        try {
          // Return only the new Einde Termijn IPT Campaign for broker view - solar panel protection campaign completely removed
          const sharedCampaigns = [
            {
              id: 18,
              name: 'Einde Termijn IPT Campaign',
              description: 'New end-of-term IPT insurance campaign targeting customers with expiring policies',
              type: 'cross_sell',
              category: 'cross_sell',
              status: 'draft',
              sharedAt: new Date().toISOString(),
              sharedBy: 'Baloise Team',
              accessLevel: 'view',
              isTemplate: false,
              sponsorName: 'Baloise Insurance',
              tags: ['IPT', 'End of Term', 'Cross-sell'],
              subject: 'Your IPT Policy is Expiring - Renewal Options Available',
              email_body: 'Dear valued customer, your IPT policy is approaching its end date. We have prepared attractive renewal options for you.',
              emails_sent: 245,
              emails_opened: 89,
              open_rate: '36.33',
              total_clicks: 34,
              recipients: 245,
              partner_id: 12,
              partner_name: 'Mevas BV',
              environment_id: 'baloise',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          
          console.log(`Returning ${sharedCampaigns.length} shared campaigns for broker view from ${envId}`);
          res.json(sharedCampaigns);
        } catch (dbError) {
          console.error('Database error fetching shared campaigns:', dbError);
          // Return empty array if campaigns table doesn't exist yet
          res.json([]);
        }
      } else {
        // For other environments, return empty array
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching shared campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch shared campaigns' });
    }
  });

  // Get campaigns shared with broker users (for Regional Insurance Partners environment)
  app.get('/api/broker/shared-campaigns', async (req, res) => {
    try {
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
      if (envId === 'degoudse') {
        try {
          // Return only the new Einde Termijn IPT Campaign for broker view - solar panel protection campaign completely removed
          const sharedCampaigns = [
            {
              id: 18,
              name: 'Einde Termijn IPT Campaign',
              description: 'New end-of-term IPT insurance campaign targeting customers with expiring policies',
              type: 'cross_sell',
              category: 'cross_sell',
              status: 'draft',
              sharedAt: new Date().toISOString(),
              sharedBy: 'Baloise Team',
              accessLevel: 'view',
              isTemplate: false,
              sponsorName: 'Baloise Insurance',
              tags: ['IPT', 'End of Term', 'Cross-sell'],
              subject: 'Your IPT Policy is Expiring - Renewal Options Available',
              email_body: 'Dear valued customer, your IPT policy is approaching its end date. We have prepared attractive renewal options for you.',
              emails_sent: 245,
              emails_opened: 89,
              open_rate: '36.33',
              total_clicks: 34,
              recipients: 245,
              partner_id: 12,
              partner_name: 'Mevas BV',
              environment_id: 'baloise',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          
          console.log(`Returning ${sharedCampaigns.length} shared campaigns for broker view`);
          res.json(sharedCampaigns);
        } catch (dbError) {
          console.error('Database error fetching shared campaigns:', dbError);
          // Return empty array if campaigns table doesn't exist yet
          res.json([]);
        }
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
        WHERE c.is_template = true AND COALESCE(c.status, 'draft') != 'archived'
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
        icon: template.icon,
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
        scheduled_time: template.scheduled_time,
        target_entity_type: template.target_entity_type,
        icon: template.icon
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
      
      // Insert template into campaigns table
      const templateResult = await pool.query(`
        INSERT INTO degoudse.campaigns (name, description, objective, icon, status, is_template, type, created_by_id, target_entity_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [name, description || '', objective || '', icon, status || 'draft', true, 'email', createdBy, entity]);
      
      const templateId = templateResult.rows[0].id;
      
      // Prepare email content and follow-ups
      if (emails && emails.length > 0) {
        const firstEmail = emails[0];
        const followUpEmails = emails.slice(1);
        
        // Update the template with email content
        await pool.query(`
          UPDATE degoudse.campaigns 
          SET subject = $1, email_body = $2, follow_up_emails = $3
          WHERE id = $4
        `, [
          firstEmail.subject || '',
          firstEmail.content || '',
          JSON.stringify(followUpEmails.map(email => ({
            subject: email.subject || '',
            body: email.content || '',
            send_after_days: email.followUpDays || 0
          }))),
          templateId
        ]);
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
      
      // Prepare email content for storage
      let emailBody = '';
      let followUpEmails = [];
      
      if (emails && emails.length > 0) {
        const firstEmail = emails[0];
        emailBody = firstEmail.content || '';
        
        // Handle follow-up emails
        if (emails.length > 1) {
          followUpEmails = emails.slice(1).map(email => ({
            subject: email.subject || '',
            body: email.content || '',
            send_after_days: email.followUpDays || 0
          }));
        }
      }
      
      // Update template in campaigns table
      await pool.query(`
        UPDATE ${envId}.campaigns 
        SET name = $1, description = $2, objective = $3, target_entity_type = $4, icon = $5, status = $6, 
            subject = $7, email_body = $8, follow_up_emails = $9, updated_at = NOW()
        WHERE id = $10 AND is_template = true
      `, [
        name, 
        description, 
        objective, 
        entity, 
        icon, 
        status || 'draft', 
        emails && emails.length > 0 ? emails[0].subject : '', 
        emailBody, 
        JSON.stringify(followUpEmails), 
        id
      ]);
      
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

  // Helper function to ensure there's always a default catalogue
  async function ensureDefaultCatalogue(envId: string) {
    try {
      const envPool = pool;
      
      // Check if default catalogue exists
      const existing = await envPool.query(`
        SELECT id FROM ${envId}.product_catalogues 
        WHERE name = 'Products Catalogue' AND status = 'active'
        LIMIT 1
      `);
      
      if (existing.rows.length === 0) {
        // Create default catalogue
        const result = await envPool.query(`
          INSERT INTO ${envId}.product_catalogues (name, description, status)
          VALUES ('Products Catalogue', 'Main product catalogue', 'active')
          RETURNING id
        `);
        return result.rows[0].id;
      }
      
      return existing.rows[0].id;
    } catch (error) {
      console.error('Error ensuring default catalogue:', error);
      return 1; // Fallback to ID 1
    }
  }

  // Update product creation to automatically assign to default catalogue
  app.post('/api/:envId/products', async (req, res) => {
    try {
      const envId = req.params.envId;
      const { name, description, category, sku, price, vendorId } = req.body;
      const envPool = pool;
      
      // Create the product
      const productResult = await envPool.query(`
        INSERT INTO ${envId}.products (name, description, category, sku, price, vendor_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [name, description, category, sku, price, vendorId]);
      
      const product = productResult.rows[0];
      
      // Ensure default catalogue exists and assign product to it
      const catalogueId = await ensureDefaultCatalogue(envId);
      
      // Add product to default catalogue
      await envPool.query(`
        INSERT INTO ${envId}.catalogue_products (product_id, catalogue_id, visible)
        VALUES ($1, $2, true)
        ON CONFLICT (product_id, catalogue_id) DO NOTHING
      `, [product.id, catalogueId]);
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // Template Management Routes
  app.get('/api/:environmentId/upload/templates', async (req: Request, res: Response) => {
    try {
      const { environmentId } = req.params;
      const { entityType } = req.query;
      
      if (!getAvailableEnvironments().includes(environmentId)) {
        return res.status(400).json({ error: 'Invalid environment' });
      }
      
      let query = `SELECT id, template_name as name, description, entity_type as "entityType", 
                          environment_id as "environmentId", template_data as "columnMappings",
                          is_active as "isShared", 0 as "usageCount", null as "lastUsedAt",
                          created_at as "createdAt", updated_at as "updatedAt"
                   FROM upload_templates WHERE environment_id = $1 AND is_active = true`;
      const params = [environmentId];
      
      if (entityType) {
        query += ` AND entity_type = $2`;
        params.push(entityType as string);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  app.post('/api/:environmentId/upload/templates', async (req: Request, res: Response) => {
    try {
      const { environmentId } = req.params;
      const { name, description, entityType, columnMappings, isShared } = req.body;
      
      if (!getAvailableEnvironments().includes(environmentId)) {
        return res.status(400).json({ error: 'Invalid environment' });
      }
      
      const result = await pool.query(`
        INSERT INTO upload_templates (template_name, description, entity_type, environment_id, template_data, is_active, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `, [name, description, entityType, environmentId, JSON.stringify(columnMappings), true, 1]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error saving template:', error);
      res.status(500).json({ error: 'Failed to save template' });
    }
  });

  app.put('/api/:environmentId/upload/templates/:templateId', async (req: Request, res: Response) => {
    try {
      const { environmentId, templateId } = req.params;
      const { name, description, columnMappings, isShared } = req.body;
      
      if (!getAvailableEnvironments().includes(environmentId)) {
        return res.status(400).json({ error: 'Invalid environment' });
      }
      
      const result = await pool.query(`
        UPDATE upload_templates 
        SET name = $1, description = $2, column_mappings = $3, is_shared = $4, updated_at = NOW()
        WHERE id = $5 AND environment_id = $6
        RETURNING *
      `, [name, description, JSON.stringify(columnMappings), isShared || false, templateId, environmentId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  });

  app.delete('/api/:environmentId/upload/templates/:templateId', async (req: Request, res: Response) => {
    try {
      const { environmentId, templateId } = req.params;
      
      if (!getAvailableEnvironments().includes(environmentId)) {
        return res.status(400).json({ error: 'Invalid environment' });
      }
      
      const result = await pool.query(`
        DELETE FROM upload_templates 
        WHERE id = $1 AND environment_id = $2
        RETURNING id
      `, [templateId, environmentId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  });

  app.post('/api/:environmentId/upload/templates/:templateId/use', async (req: Request, res: Response) => {
    try {
      const { environmentId, templateId } = req.params;
      
      if (!getAvailableEnvironments().includes(environmentId)) {
        return res.status(400).json({ error: 'Invalid environment' });
      }
      
      const result = await pool.query(`
        UPDATE upload_templates 
        SET usage_count = usage_count + 1, last_used_at = NOW()
        WHERE id = $1 AND environment_id = $2
        RETURNING *
      `, [templateId, environmentId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating template usage:', error);
      res.status(500).json({ error: 'Failed to update template usage' });
    }
  });

  // Phase 1: Upload Settings Infrastructure Routes

  // Schema Discovery Routes
  app.get('/api/:environmentId/upload/entities', async (req: Request, res: Response) => {
    try {
      const { environmentId } = req.params;
      
      if (!getAvailableEnvironments().includes(environmentId)) {
        return res.status(400).json({ error: 'Invalid environment' });
      }
      
      const entitySchemas = await discoverEntitySchemas(environmentId);
      res.json(entitySchemas);
    } catch (error) {
      console.error('Failed to discover entity schemas:', error);
      res.status(500).json({ error: 'Failed to discover entity schemas' });
    }
  });

  app.get('/api/:environmentId/upload/entities/:entityType/attributes', async (req: Request, res: Response) => {
    try {
      const { environmentId, entityType } = req.params;
      
      if (!isSupportedEntityType(entityType)) {
        return res.status(400).json({ error: 'Unsupported entity type' });
      }
      
      const entitySchemas = await discoverEntitySchemas(environmentId);
      const entitySchema = entitySchemas.find(schema => schema.entityType === entityType);
      
      if (!entitySchema) {
        return res.status(404).json({ error: 'Entity not found' });
      }
      
      res.json(entitySchema.attributes);
    } catch (error) {
      console.error('Failed to get entity attributes:', error);
      res.status(500).json({ error: 'Failed to get entity attributes' });
    }
  });

  // Admin Entity Schemas Route
  app.get('/api/admin/entity-schemas', async (req: Request, res: Response) => {
    try {
      const entitySchemas = [
        {
          tableName: 'opportunities',
          entityType: 'opportunities',
          columns: [
            { name: 'id', type: 'number', isRequired: false },
            { name: 'title', type: 'string', isRequired: true },
            { name: 'description', type: 'string', isRequired: false },
            { name: 'value', type: 'number', isRequired: false },
            { name: 'status', type: 'string', isRequired: false },
            { name: 'priority', type: 'string', isRequired: false },
            { name: 'customer_id', type: 'number', isRequired: false },
            { name: 'partner_id', type: 'number', isRequired: false },
            { name: 'owner_id', type: 'number', isRequired: false },
            { name: 'created_at', type: 'datetime', isRequired: false },
            { name: 'updated_at', type: 'datetime', isRequired: false },
            { name: 'expected_close_date', type: 'date', isRequired: false },
            { name: 'probability', type: 'number', isRequired: false },
            { name: 'stage', type: 'string', isRequired: false },
            { name: 'source', type: 'string', isRequired: false },
            { name: 'notes', type: 'text', isRequired: false }
          ]
        },
        {
          tableName: 'partners',
          entityType: 'partners',
          columns: [
            { name: 'id', type: 'number', isRequired: false },
            { name: 'name', type: 'string', isRequired: true },
            { name: 'description', type: 'string', isRequired: false },
            { name: 'type', type: 'string', isRequired: false },
            { name: 'status', type: 'string', isRequired: false },
            { name: 'contact_email', type: 'string', isRequired: false },
            { name: 'contact_phone', type: 'string', isRequired: false },
            { name: 'website', type: 'string', isRequired: false },
            { name: 'address', type: 'string', isRequired: false },
            { name: 'created_at', type: 'datetime', isRequired: false },
            { name: 'updated_at', type: 'datetime', isRequired: false }
          ]
        },
        {
          tableName: 'customers',
          entityType: 'customers',
          columns: [
            { name: 'id', type: 'number', isRequired: false },
            { name: 'name', type: 'string', isRequired: true },
            { name: 'email', type: 'string', isRequired: false },
            { name: 'phone', type: 'string', isRequired: false },
            { name: 'company', type: 'string', isRequired: false },
            { name: 'status', type: 'string', isRequired: false },
            { name: 'partner_id', type: 'number', isRequired: false },
            { name: 'created_at', type: 'datetime', isRequired: false },
            { name: 'updated_at', type: 'datetime', isRequired: false },
            { name: 'address', type: 'string', isRequired: false },
            { name: 'notes', type: 'text', isRequired: false }
          ]
        },
        {
          tableName: 'products',
          entityType: 'products',
          columns: [
            { name: 'id', type: 'number', isRequired: false },
            { name: 'name', type: 'string', isRequired: true },
            { name: 'description', type: 'string', isRequired: false },
            { name: 'category', type: 'string', isRequired: false },
            { name: 'contract_start_date', type: 'date', isRequired: false },
            { name: 'contract_end_date', type: 'date', isRequired: false },
            { name: 'total_value', type: 'number', isRequired: false },
            { name: 'premium_value', type: 'number', isRequired: false },
            { name: 'premium_percentage', type: 'number', isRequired: false },
            { name: 'discount_percentage', type: 'number', isRequired: false },
            { name: 'status', type: 'string', isRequired: false },
            { name: 'created_at', type: 'datetime', isRequired: false },
            { name: 'updated_at', type: 'datetime', isRequired: false }
          ]
        },
        {
          tableName: 'vendors',
          entityType: 'vendors',
          columns: [
            { name: 'id', type: 'number', isRequired: false },
            { name: 'name', type: 'string', isRequired: true },
            { name: 'contact_email', type: 'string', isRequired: false },
            { name: 'contact_phone', type: 'string', isRequired: false },
            { name: 'address', type: 'string', isRequired: false },
            { name: 'status', type: 'string', isRequired: false },
            { name: 'created_at', type: 'datetime', isRequired: false },
            { name: 'updated_at', type: 'datetime', isRequired: false }
          ]
        },
        {
          tableName: 'contacts',
          entityType: 'contacts',
          columns: [
            { name: 'id', type: 'number', isRequired: false },
            { name: 'first_name', type: 'string', isRequired: true },
            { name: 'last_name', type: 'string', isRequired: true },
            { name: 'email', type: 'string', isRequired: false },
            { name: 'phone', type: 'string', isRequired: false },
            { name: 'company', type: 'string', isRequired: false },
            { name: 'position', type: 'string', isRequired: false },
            { name: 'created_at', type: 'datetime', isRequired: false },
            { name: 'updated_at', type: 'datetime', isRequired: false }
          ]
        }
      ];
      
      res.json(entitySchemas);
    } catch (error) {
      console.error('Failed to get entity schemas:', error);
      res.status(500).json({ error: 'Failed to get entity schemas' });
    }
  });

  // Create Record Route
  app.post('/api/:environmentId/create-record', async (req: Request, res: Response) => {
    try {
      const { environmentId } = req.params;
      const { entityType, data, originalRow } = req.body;
      
      if (!getAvailableEnvironments().includes(environmentId)) {
        return res.status(400).json({ error: 'Invalid environment' });
      }
      
      if (!isSupportedEntityType(entityType)) {
        return res.status(400).json({ error: 'Unsupported entity type' });
      }
      
      const envPool = getEnvironmentPool(environmentId);
      
      // Build dynamic insert query based on entity type and data
      const columns = Object.keys(data).filter(key => data[key] !== null && data[key] !== undefined);
      const values = columns.map(col => data[col]);
      const placeholders = columns.map((_, index) => `$${index + 1}`);
      
      const tableName = `${environmentId}.${entityType}`;
      // Quote column names to preserve case sensitivity
      const quotedColumns = columns.map(col => `"${col}"`);
      const insertQuery = `
        INSERT INTO ${tableName} (${quotedColumns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;
      
      console.log('Creating record:', {
        entityType,
        tableName,
        columns,
        values: values.map((v, i) => `${columns[i]}: ${v}`)
      });
      
      const result = await envPool.query(insertQuery, values);
      const createdRecord = result.rows[0];
      
      res.status(201).json({
        success: true,
        record: createdRecord,
        entityType,
        originalRow
      });
      
    } catch (error) {
      console.error('Failed to create record:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create record' 
      });
    }
  });

  // Helper function to get default mandatory attributes for each entity type
  function getDefaultMandatoryAttributes(entityType: string) {
    const defaultAttributes: Record<string, any[]> = {
      opportunities: [
        { attribute_name: 'title', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'clientId', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'productId', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'probability', is_mandatory: false, entity_type: entityType },
        { attribute_name: 'estimatedValue', is_mandatory: false, entity_type: entityType }
      ],
      partners: [
        { attribute_name: 'name', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'email', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'phone', is_mandatory: false, entity_type: entityType },
        { attribute_name: 'company', is_mandatory: false, entity_type: entityType }
      ],
      customers: [
        { attribute_name: 'name', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'email', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'phone', is_mandatory: false, entity_type: entityType },
        { attribute_name: 'address', is_mandatory: false, entity_type: entityType }
      ],
      products: [
        { attribute_name: 'name', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'price', is_mandatory: false, entity_type: entityType },
        { attribute_name: 'category', is_mandatory: false, entity_type: entityType },
        { attribute_name: 'sku', is_mandatory: false, entity_type: entityType }
      ],
      vendors: [
        { attribute_name: 'name', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'contact_email', is_mandatory: false, entity_type: entityType },
        { attribute_name: 'contact_phone', is_mandatory: false, entity_type: entityType }
      ],
      contacts: [
        { attribute_name: 'first_name', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'last_name', is_mandatory: true, entity_type: entityType },
        { attribute_name: 'email', is_mandatory: false, entity_type: entityType },
        { attribute_name: 'phone', is_mandatory: false, entity_type: entityType }
      ]
    };
    
    return defaultAttributes[entityType] || [];
  }

  // Upload Settings Routes
  app.get('/api/:environmentId/upload-settings/:entityType', async (req: Request, res: Response) => {
    try {
      const { environmentId, entityType } = req.params;
      
      // Check if this is a special format (same logic as frontend)
      const isSpecialFormat = entityType.includes('-') || ['salesforce', 'brio', 'degoudse'].includes(entityType);
      
      if (!isSpecialFormat && !isSupportedEntityType(entityType)) {
        return res.status(400).json({ error: 'Unsupported entity type' });
      }
      
      // For special formats, return empty settings array since they don't have predefined mandatory attributes
      if (isSpecialFormat) {
        return res.json([]);
      }
      
      // For now, always return default mandatory attributes to ensure CSV mapping works
      const defaultSettings = getDefaultMandatoryAttributes(entityType);
      return res.json(defaultSettings);
    } catch (error) {
      console.error('Failed to get upload settings:', error);
      res.status(500).json({ error: 'Failed to get upload settings' });
    }
  });

  app.post('/api/:environmentId/upload-settings/:entityType', async (req: Request, res: Response) => {
    try {
      const { environmentId, entityType } = req.params;
      const { settings } = req.body;
      
      // Check if this is a special format (same logic as frontend)
      const isSpecialFormat = entityType.includes('-') || ['salesforce', 'brio', 'degoudse'].includes(entityType);
      
      if (!isSpecialFormat && !isSupportedEntityType(entityType)) {
        return res.status(400).json({ error: 'Unsupported entity type' });
      }
      
      // For special formats, return success without saving settings
      if (isSpecialFormat) {
        return res.json({ success: true, message: 'Special format uploads do not require settings configuration' });
      }
      
      const settingsSchema = z.array(z.object({
        attributeName: z.string(),
        isMandatory: z.boolean(),
        dataType: z.string().optional()
      }));
      
      const validatedSettings = settingsSchema.parse(settings);
      
      await UploadSettingsService.updateUploadSettings(environmentId, entityType, validatedSettings);
      
      res.json({ success: true, message: 'Upload settings updated successfully' });
    } catch (error) {
      console.error('Failed to update upload settings:', error);
      res.status(500).json({ error: 'Failed to update upload settings' });
    }
  });

  // Transformation Scripts Routes
  app.get('/api/:environmentId/transformation-scripts', async (req: Request, res: Response) => {
    try {
      const { environmentId } = req.params;
      const { entityType } = req.query;
      
      const scripts = await UploadSettingsService.getTransformationScripts(
        environmentId, 
        entityType as string
      );
      
      res.json(scripts);
    } catch (error) {
      console.error('Failed to get transformation scripts:', error);
      res.status(500).json({ error: 'Failed to get transformation scripts' });
    }
  });

  app.post('/api/:environmentId/transformation-scripts', async (req: Request, res: Response) => {
    try {
      const { environmentId } = req.params;
      const scriptData = { ...req.body, environmentId };
      
      const validatedScript = insertTransformationScriptSchema.parse(scriptData);
      
      const validation = UploadSettingsService.validateScriptSyntax(validatedScript.scriptContent);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Invalid script syntax', 
          details: validation.errors 
        });
      }
      
      const script = await UploadSettingsService.createTransformationScript(validatedScript);
      res.status(201).json(script);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid script data', details: error.errors });
      }
      console.error('Failed to create transformation script:', error);
      res.status(500).json({ error: 'Failed to create transformation script' });
    }
  });

  app.post('/api/:environmentId/transformation-scripts/validate', async (req: Request, res: Response) => {
    try {
      const { scriptContent } = req.body;
      
      if (!scriptContent || typeof scriptContent !== 'string') {
        return res.status(400).json({ error: 'Script content is required' });
      }
      
      const validation = UploadSettingsService.validateScriptSyntax(scriptContent);
      res.json(validation);
    } catch (error) {
      console.error('Failed to validate script:', error);
      res.status(500).json({ error: 'Failed to validate script' });
    }
  });

  // Apply transformation script to CSV data
  app.post('/api/:environmentId/transformation-scripts/execute', csvUpload.any(), async (req: Request, res: Response) => {
    try {
      const { environmentId } = req.params;
      const { scriptId, entityType } = req.body;
      // Handle both single file and multiple files upload
      const files = req.files as Express.Multer.File[];
      const file = files?.[0] || req.file;

      console.log('🔄 SERVER TRANSFORMATION DEBUG: Received request');
      console.log('🔄 Environment ID:', environmentId);
      console.log('🔄 Script ID:', scriptId);
      console.log('🔄 Entity Type:', entityType);
      console.log('🔄 Has file:', !!file);
      console.log('🔄 File details:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');

      if (!file) {
        return res.status(400).json({ error: 'CSV file is required' });
      }

      if (!scriptId && !entityType) {
        return res.status(400).json({ error: 'Either scriptId or entityType is required' });
      }

      let script;
      if (scriptId) {
        console.log('🔄 Looking up transformation script by ID:', scriptId);
        script = await UploadSettingsService.getTransformationScriptById(parseInt(scriptId), environmentId);
        console.log('🔄 Found script by ID:', script ? { id: script.id, name: script.name } : 'Not found');
      } else {
        // Get the first active script for this entity type
        console.log('🔄 Looking up scripts for entity type:', entityType);
        const scripts = await UploadSettingsService.getTransformationScripts(environmentId, entityType);
        console.log('🔄 Found scripts for entity type:', scripts.length);
        script = scripts.find(s => s.isActive);
        console.log('🔄 Active script found:', script ? { id: script.id, name: script.name } : 'None');
      }

      if (!script) {
        console.log('❌ No transformation script found');
        return res.status(404).json({ error: 'No transformation script found' });
      }

      console.log('✅ Using script:', { 
        id: script.id, 
        name: script.name,
        scriptLength: script.scriptContent?.length || 0
      });

      // Execute the transformation
      const csvData = file.buffer.toString('utf-8');
      const originalLines = csvData.split('\n').filter(line => line.trim());
      console.log('🔄 Original CSV stats:', {
        totalLines: originalLines.length,
        headers: originalLines[0]?.substring(0, 200) + (originalLines[0]?.length > 200 ? '...' : ''),
        sampleDataLine: originalLines[1]?.substring(0, 200) + (originalLines[1]?.length > 200 ? '...' : '')
      });

      console.log('🔄 Executing transformation script...');
      const result = await UploadSettingsService.executeTransformationScript(
        script.scriptContent,
        csvData
      );

      console.log('✅ Transformation completed:', {
        headers: result.headers,
        rowCount: result.rowCount,
        transformedCsvLength: result.transformedCsv?.length || 0
      });

      const transformedLines = result.transformedCsv.split('\n').filter((line: string) => line.trim());
      console.log('✅ Transformed CSV sample:', {
        totalLines: transformedLines.length,
        headers: transformedLines[0]?.substring(0, 200) + (transformedLines[0]?.length > 200 ? '...' : ''),
        sampleDataLine: transformedLines[1]?.substring(0, 200) + (transformedLines[1]?.length > 200 ? '...' : '')
      });

      res.json({
        success: true,
        transformedCsv: result.transformedCsv,
        headers: result.headers,
        rowCount: result.rowCount
      });

    } catch (error: any) {
      console.error('Failed to execute transformation script:', error);
      res.status(500).json({ 
        error: 'Failed to execute transformation script',
        details: error.message 
      });
    }
  });

  app.patch('/api/:environmentId/transformation-scripts/:scriptId', async (req: Request, res: Response) => {
    try {
      const { environmentId, scriptId } = req.params;
      const { name, description, scriptContent } = req.body;
      
      if (!name && !description && !scriptContent) {
        return res.status(400).json({ error: 'At least one field must be provided for update' });
      }
      
      const updates: any = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (scriptContent) {
        // Validate script content if provided
        const validation = UploadSettingsService.validateScriptSyntax(scriptContent);
        if (!validation.isValid) {
          return res.status(400).json({ 
            error: 'Invalid script syntax', 
            details: validation.errors 
          });
        }
        updates.script_content = scriptContent;
      }
      
      const script = await UploadSettingsService.updateTransformationScript(
        parseInt(scriptId), 
        environmentId, 
        updates
      );
      
      res.json(script);
    } catch (error) {
      if (error instanceof Error && error.message === 'Script not found') {
        return res.status(404).json({ error: 'Script not found' });
      }
      console.error('Failed to update transformation script:', error);
      res.status(500).json({ error: 'Failed to update transformation script' });
    }
  });

  app.delete('/api/:environmentId/transformation-scripts/:scriptId', async (req: Request, res: Response) => {
    try {
      const { environmentId, scriptId } = req.params;
      
      const deleted = await UploadSettingsService.deleteTransformationScript(
        parseInt(scriptId), 
        environmentId
      );
      
      if (!deleted) {
        return res.status(404).json({ error: 'Script not found' });
      }
      
      res.json({ success: true, message: 'Transformation script deleted successfully' });
    } catch (error) {
      console.error('Failed to delete transformation script:', error);
      res.status(500).json({ error: 'Failed to delete transformation script' });
    }
  });

  // Upload Templates Routes
  app.get('/api/:environmentId/upload-templates', async (req: Request, res: Response) => {
    try {
      const { environmentId } = req.params;
      const { entityType } = req.query;
      const userId = 1; // Default user for testing
      
      const templates = await UploadSettingsService.getUploadTemplates(
        environmentId, 
        entityType as string,
        userId
      );
      
      res.json(templates);
    } catch (error) {
      console.error('Failed to get upload templates:', error);
      res.status(500).json({ error: 'Failed to get upload templates' });
    }
  });

  app.post('/api/:environmentId/upload-templates', async (req: Request, res: Response) => {
    try {
      const { environmentId } = req.params;
      const templateData = { ...req.body, environmentId, createdBy: 1 }; // Default user
      
      const validatedTemplate = insertUploadTemplateSchema.parse(templateData);
      
      const template = await UploadSettingsService.createUploadTemplate(validatedTemplate);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid template data', details: error.errors });
      }
      console.error('Failed to create upload template:', error);
      res.status(500).json({ error: 'Failed to create upload template' });
    }
  });

  app.put('/api/:environmentId/upload-templates/:templateId', async (req: Request, res: Response) => {
    try {
      const { environmentId, templateId } = req.params;
      const updates = req.body;
      
      console.log('Updating template:', templateId, 'with data:', JSON.stringify(updates, null, 2));
      
      const template = await UploadSettingsService.updateUploadTemplate(
        parseInt(templateId), 
        environmentId, 
        updates, 
        1 // Default user
      );
      
      console.log('Template updated successfully:', template);
      res.json(template);
    } catch (error) {
      console.error('Failed to update upload template:', error);
      res.status(500).json({ error: 'Failed to update upload template' });
    }
  });

  // Utility Routes
  app.get('/api/upload/environments', async (req: Request, res: Response) => {
    try {
      const environments = getAvailableEnvironments();
      res.json(environments);
    } catch (error) {
      console.error('Failed to get environments:', error);
      res.status(500).json({ error: 'Failed to get environments' });
    }
  });

  app.get('/api/upload/supported-entities', async (req: Request, res: Response) => {
    try {
      const supportedEntities = [
        'opportunities',
        'partners', 
        'customers',
        'vendors',
        'products',
        'users',
        'contacts'
      ];
      
      res.json(supportedEntities);
    } catch (error) {
      console.error('Failed to get supported entities:', error);
      res.status(500).json({ error: 'Failed to get supported entities' });
    }
  });

  // Environment-specific supported entities endpoint
  app.get('/api/:environmentId/upload/supported-entities', async (req: Request, res: Response) => {
    try {
      const supportedEntities = [
        'opportunities',
        'partners', 
        'customers',
        'vendors',
        'products',
        'users',
        'contacts'
      ];
      
      res.json(supportedEntities);
    } catch (error) {
      console.error('Failed to get supported entities:', error);
      res.status(500).json({ error: 'Failed to get supported entities' });
    }
  });

  // ===== ACTIVITY REACTIONS API =====

  // Get reactions for an activity item
  app.get('/api/:envId/activity-reactions/:activityType/:activityId', async (req, res) => {
    try {
      const { envId, activityType, activityId } = req.params;
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT 
          ar.emoji,
          COUNT(*) as count,
          ARRAY_AGG(u.name) as user_names,
          ARRAY_AGG(ar.user_id) as user_ids
        FROM ${envId}.activity_reactions ar
        JOIN ${envId}.users u ON ar.user_id = u.id
        WHERE ar.activity_type = $1 AND ar.activity_id = $2
        GROUP BY ar.emoji
        ORDER BY count DESC
      `, [activityType, parseInt(activityId)]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching activity reactions:', error);
      res.status(500).json({ error: 'Failed to fetch reactions' });
    }
  });

  // Toggle reaction for an activity item
  app.post('/api/:envId/activity-reactions', async (req, res) => {
    try {
      const { envId } = req.params;
      const { activityType, activityId, userId, emoji } = req.body;
      
      if (!activityType || !activityId || !userId || !emoji) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const envPool = pool;
      
      // Check if user already reacted with this emoji
      const existingReaction = await envPool.query(`
        SELECT id FROM ${envId}.activity_reactions 
        WHERE activity_type = $1 AND activity_id = $2 AND user_id = $3 AND emoji = $4
      `, [activityType, activityId, userId, emoji]);
      
      if (existingReaction.rows.length > 0) {
        // Remove existing reaction
        await envPool.query(`
          DELETE FROM ${envId}.activity_reactions 
          WHERE activity_type = $1 AND activity_id = $2 AND user_id = $3 AND emoji = $4
        `, [activityType, activityId, userId, emoji]);
        
        res.json({ action: 'removed', emoji });
      } else {
        // Add new reaction
        await envPool.query(`
          INSERT INTO ${envId}.activity_reactions (activity_type, activity_id, user_id, emoji, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [activityType, activityId, userId, emoji]);
        
        res.json({ action: 'added', emoji });
      }
    } catch (error) {
      console.error('Error toggling activity reaction:', error);
      res.status(500).json({ error: 'Failed to toggle reaction' });
    }
  });

  // Get current user's reactions for an activity item
  app.get('/api/:envId/activity-reactions/:activityType/:activityId/user/:userId', async (req, res) => {
    try {
      const { envId, activityType, activityId, userId } = req.params;
      const envPool = pool;
      
      const result = await envPool.query(`
        SELECT emoji FROM ${envId}.activity_reactions 
        WHERE activity_type = $1 AND activity_id = $2 AND user_id = $3
      `, [activityType, parseInt(activityId), parseInt(userId)]);
      
      res.json(result.rows.map(row => row.emoji));
    } catch (error) {
      console.error('Error fetching user reactions:', error);
      res.status(500).json({ error: 'Failed to fetch user reactions' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
