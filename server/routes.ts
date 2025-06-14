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
  contacts
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
    // Accept CSV files and text files
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed for transformation'));
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

  // Direct opportunities handler - avoid redirect issues
  app.get('/api/opportunities', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
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
        FROM myqollabi.customers c
        INNER JOIN myqollabi.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN myqollabi.opportunities o ON o.client_id = c.id
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
        FROM myqollabi.opportunities o
        INNER JOIN myqollabi.partner_opportunities po ON o.id = po.opportunity_id
        LEFT JOIN myqollabi.customers c ON o.client_id = c.id
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
      const envPool = getEnvironmentPool('degoudse');
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

  // De Goudse environment API routes (using proper database isolation)
  app.get('/api/degoudse/partners', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
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
        region: partner.region,
        customerNames: partner.customer_names
      }));
      
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
      const envPool = getEnvironmentPool('degoudse');
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
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT o.*, c.name as client_name
        FROM degoudse.opportunities o
        INNER JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
        LEFT JOIN degoudse.customers c ON o."clientId" = c.id
        WHERE po.partner_id = $1
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
        expected_close_date: opp.expectedCloseDate
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
      const envPool = getEnvironmentPool('degoudse');
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
      const envPool = getEnvironmentPool('degoudse');
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
      const envPool = getEnvironmentPool('degoudse');
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

  app.get('/api/degoudse/opportunities/:id/products', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
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
      const envPool = getEnvironmentPool('degoudse');
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
      const envPool = getEnvironmentPool('degoudse');
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

  app.get('/api/degoudse/customers', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT c.*, 
               COUNT(DISTINCT pc.partner_id) as partner_count,
               COUNT(DISTINCT co.opportunity_id) as opportunity_count,
               STRING_AGG(DISTINCT p.name, ', ') as partner_names
        FROM degoudse.customers c
        LEFT JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN degoudse.customer_opportunities co ON c.id = co.customer_id
        LEFT JOIN degoudse.partners p ON p.id = pc.partner_id
        GROUP BY c.id, c.name, c.description, c."ownerId", c."createdAt", c."updatedAt"
        ORDER BY c.id
      `);
      
      const customers = result.rows.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        description: customer.description,
        initials: customer.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2),
        ownerId: customer.ownerId,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        partnerCount: customer.partner_count || 0,
        opportunityCount: customer.opportunity_count || 0,
        partnerNames: customer.partner_names
      }));
      
      console.log(`Returning ${customers.length} customers from De Goudse database`);
      res.json(customers);
    } catch (error) {
      console.error('De Goudse customers API error:', error);
      res.status(500).json({ message: 'Failed to fetch customers for De Goudse environment' });
    }
  });

  app.get('/api/degoudse/products', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM degoudse.products ORDER BY id
      `);
      console.log(`Returning ${result.rows.length} authentic products from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('De Goudse products API error:', error);
      res.status(500).json({ message: 'Failed to fetch products for De Goudse environment' });
    }
  });

  app.get('/api/degoudse/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await db.execute(sql`
        SELECT * FROM degoudse.products WHERE id = ${id}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      console.log(`Returning product ${id} from De Goudse database`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('De Goudse product detail API error:', error);
      res.status(500).json({ message: 'Failed to fetch product details for De Goudse environment' });
    }
  });

  app.patch('/api/degoudse/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Build dynamic update query based on provided fields
      const updateFields = [];
      const values = [];
      let paramCount = 1;
      
      if (updates.name) {
        updateFields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.description) {
        updateFields.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.category) {
        updateFields.push(`category = $${paramCount++}`);
        values.push(updates.category);
      }
      if (updates.sku !== undefined) {
        updateFields.push(`sku = $${paramCount++}`);
        values.push(updates.sku);
      }
      if (updates.price !== undefined) {
        updateFields.push(`price = $${paramCount++}`);
        values.push(updates.price);
      }
      if (updates.vendorId) {
        updateFields.push(`vendor_id = $${paramCount++}`);
        values.push(updates.vendorId);
      }
      
      updateFields.push(`updated_at = NOW()`);
      values.push(id);
      
      const result = await db.execute(sql`
        UPDATE degoudse.products 
        SET ${sql.raw(updateFields.join(', '))}
        WHERE id = $${paramCount}
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      console.log(`Updated product ${id} in De Goudse database`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('De Goudse product update API error:', error);
      res.status(500).json({ message: 'Failed to update product for De Goudse environment' });
    }
  });

  // WORKING TEST ROUTE
  app.get('/api/degoudse/saved-views-test', async (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      const entityType = req.query.entity_type as string;
      const envPool = getEnvironmentPool('degoudse');
      
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
    // Disable all caching
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      const entityType = req.query.entity_type as string;
      const envPool = getEnvironmentPool('degoudse');
      
      console.log(`FIXED: De Goudse saved views: entityType='${entityType}'`);
      
      // Force entity filtering to work correctly
      const query = entityType 
        ? `SELECT * FROM degoudse.saved_views WHERE entity_type = $1 ORDER BY created_at DESC`
        : `SELECT * FROM degoudse.saved_views ORDER BY created_at DESC`;
      
      const params = entityType ? [entityType] : [];
      console.log(`FIXED: Executing query: ${query} with params:`, params);
      const result = await envPool.query(query, params);
      console.log(`FIXED: Query returned ${result.rows.length} rows`);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse saved views:', error);
      res.status(500).json({ error: 'Failed to fetch saved views' });
    }
  });

  // NEW ROUTE: Fixed entity filtering for De Goudse saved lists
  app.get('/api/degoudse/saved-lists-filtered', async (req, res) => {
    const entityType = req.query.entity_type as string;
    
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache'); 
    res.set('Expires', '0');
    
    try {
      const envPool = getEnvironmentPool('degoudse');
      
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
    
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache'); 
    res.set('Expires', '0');
    
    try {
      const envPool = getEnvironmentPool('degoudse');
      
      if (entityType) {
        const result = await envPool.query('SELECT * FROM degoudse.saved_lists WHERE entity_type = $1 ORDER BY created_at DESC', [entityType]);
        return res.json(result.rows);
      } else {
        const result = await envPool.query('SELECT * FROM degoudse.saved_lists ORDER BY created_at DESC');
        return res.json(result.rows);
      }
    } catch (error) {
      console.error('De Goudse saved lists error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/degoudse/opportunities', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
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
        GROUP BY o.id, o.title, o.description, o.status, o.stage, o."estimatedValue", 
                 o."expectedCloseDate", o."clientId", o."partnerId", o."productId", 
                 o."ownerId", o.probability, o.type, o."createdAt", o."updatedAt"
        ORDER BY o.id
      `);
      
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
        productCount: parseInt(opp.product_count) || 0
      }));
      
      console.log(`Returning ${opportunities.length} opportunities from De Goudse database`);
      res.json(opportunities);
    } catch (error) {
      console.error('De Goudse opportunities API error:', error);
      res.status(500).json({ message: 'Failed to fetch opportunities for De Goudse environment' });
    }
  });

  // Create opportunity for De Goudse environment
  app.post('/api/degoudse/opportunities', async (req, res) => {
    try {
      console.log('De Goudse opportunity creation request body:', req.body);
      
      const { 
        title, 
        description, 
        clientId,
        productId,
        value,
        probability = 50,
        status = 'Qualifying',
        type = 'New Business',
        closeDate
      } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }
      
      if (!clientId || !productId) {
        return res.status(400).json({ message: 'Customer and product selection are required' });
      }
      
      console.log('Executing De Goudse opportunity insert query...');
      
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        INSERT INTO degoudse.opportunities (
          title, description, "clientId", "productId", status, type, probability, 
          "estimatedValue", "expectedCloseDate", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        ) RETURNING *
      `, [
        title, 
        description, 
        clientId,
        productId,
        status, 
        type, 
        probability,
        value || 0,
        closeDate || null
      ]);
      
      const newOpportunity = result.rows[0];
      console.log('De Goudse opportunity created successfully:', newOpportunity.id);
      
      res.status(201).json({
        id: newOpportunity.id,
        title: newOpportunity.title,
        description: newOpportunity.description,
        status: newOpportunity.status,
        type: newOpportunity.type,
        probability: newOpportunity.probability,
        estimatedValue: newOpportunity.estimatedValue,
        expectedCloseDate: newOpportunity.expectedCloseDate,
        createdAt: newOpportunity.createdAt,
        updatedAt: newOpportunity.updatedAt
      });
    } catch (error) {
      console.error('Detailed error creating De Goudse opportunity:', error);
      res.status(500).json({ message: 'Failed to create opportunity in De Goudse environment' });
    }
  });

  // Get single opportunity for De Goudse environment
  app.get('/api/degoudse/opportunities/:id', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
      
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
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query('SELECT * FROM degoudse.okr_metrics ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error('De Goudse OKR metrics API error:', error);
      res.status(500).json({ message: 'Failed to fetch OKR metrics for De Goudse environment' });
    }
  });

  // De Goudse OKR Tags endpoints
  app.get('/api/degoudse/okr-tags', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query('SELECT * FROM degoudse.okr_tags ORDER BY name ASC');
      res.json(result.rows);
    } catch (error) {
      console.error('De Goudse OKR tags API error:', error);
      res.status(500).json({ message: 'Failed to fetch OKR tags for De Goudse environment' });
    }
  });

  // De Goudse Contacts endpoints
  app.get('/api/degoudse/contacts', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
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
      const envPool = getEnvironmentPool('degoudse');
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
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT id, name, description, initials, contact_name, contact_email, 
               contact_phone, "ownerId", "createdAt", "updatedAt"
        FROM degoudse.vendors 
        ORDER BY name ASC
      `);
      
      const vendors = result.rows.map((vendor: any) => ({
        ...vendor,
        initials: vendor.initials || vendor.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2)
      }));
      
      console.log(`Returning ${vendors.length} vendors from De Goudse database`);
      res.json(vendors);
    } catch (error) {
      console.error('Error fetching De Goudse vendors:', error);
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });

  app.post('/api/degoudse/vendors', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
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
      const envPool = getEnvironmentPool('degoudse');
      
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
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query('SELECT * FROM degoudse.okr_tags ORDER BY name');
      res.json(result.rows);
    } catch (error) {
      console.error('De Goudse OKR tags API error:', error);
      res.status(500).json({ message: 'Failed to fetch OKR tags for De Goudse environment' });
    }
  });

  // De Goudse Users endpoints
  app.get('/api/degoudse/users', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      
      const result = await envPool.query(`
        SELECT id, username, email, full_name, first_name, last_name, 
               avatar_initials, role, department,
               is_active, last_login_at, created_at, updated_at
        FROM degoudse.users 
        WHERE is_active = true
        ORDER BY full_name ASC
      `);
      
      console.log(`Returning ${result.rows.length} users from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/degoudse/users', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const { 
        username, email, firstName, lastName, role, department, 
        password, isActive = true 
      } = req.body;
      
      if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required' });
      }

      const fullName = `${firstName || ''} ${lastName || ''}`.trim() || username;
      const avatarInitials = fullName.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2);
      
      // Use a default password if none provided (for demo purposes)
      const userPassword = password || 'defaultPassword123';
      
      const result = await envPool.query(`
        INSERT INTO degoudse.users (
          username, email, password, full_name, first_name, last_name, avatar_initials,
          role, department, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        ) RETURNING id, username, email, full_name, first_name, last_name, 
                   avatar_initials, role, department, is_active, created_at, updated_at
      `, [
        username, email, userPassword, fullName, firstName || null, lastName || null, avatarInitials,
        role || 'user', department || null, isActive
      ]);
      
      const user = result.rows[0];
      console.log('User created successfully in De Goudse environment:', user);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating De Goudse user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.post('/api/degoudse/okr-tags', async (req, res) => {
    try {
      const { name, color } = req.body;
      const envPool = getEnvironmentPool('degoudse');
      
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
      const envPool = getEnvironmentPool('degoudse');
      
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
      const envPool = getEnvironmentPool('degoudse');
      
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
    try {
      const { entityType } = req.params;
      const envPool = getEnvironmentPool('degoudse');
      
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
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse template assignments:', error);
      res.status(500).json({ error: 'Failed to fetch template assignments' });
    }
  });

  // Get template assignments for a specific entity ID
  app.get('/api/degoudse/template-assignments/:entityType/:entityId', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      console.log(`DEBUG: Fetching template assignments for ${entityType} ${entityId}`);
      const envPool = getEnvironmentPool('degoudse');
      
      const result = await envPool.query(`
        SELECT 
          ta.*,
          om.name as template_name,
          om.description as template_description,
          om.tags
        FROM degoudse.okr_template_assignments ta
        LEFT JOIN degoudse.okr_metrics om ON ta.template_id = om.id
        WHERE ta.entity_type = $1 AND ta.entity_id = $2
        ORDER BY ta.assigned_at DESC
      `, [entityType, parseInt(entityId)]);
      
      console.log(`DEBUG: Found ${result.rows.length} template assignments for ${entityType} ${entityId}:`, result.rows);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching template assignments for entity:', error);
      res.json([]);
    }
  });

  app.post('/api/degoudse/template-assignments', async (req, res) => {
    try {
      const { templateIds, entityType, entityId, assignedBy, notes } = req.body;
      const envPool = getEnvironmentPool('degoudse');
      
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

  // Get existing shared links for a list
  app.get('/api/degoudse/shared-lists/by-list/:listId', async (req, res) => {
    try {
      const { listId } = req.params;
      const envPool = getEnvironmentPool('degoudse');
      
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
      const envPool = getEnvironmentPool('degoudse');
      
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
      const envPool = getEnvironmentPool('degoudse');
      
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
      const envPool = getEnvironmentPool('degoudse');
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
      const envPool = getEnvironmentPool('degoudse');
      
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
              const envPool = getEnvironmentPool('degoudse');
              
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
          const envPool = getEnvironmentPool('degoudse');
          
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
        WHERE table_schema = 'degoudse' AND table_name = 'okr_metrics'
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

  // Database Administration Endpoints
  // These endpoints should not be environment-specific as they manage all environments

  // Get all available environments - only De Goudse
  app.get('/api/admin/environments', async (req, res) => {
    try {
      // Return only De Goudse environment
      const environments = [{
        id: 'degoudse',
        name: 'De Goudse',
        apiBaseUrl: '/api/degoudse',
        databaseId: 'degoudse_db'
      }];

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
        const envPool = getEnvironmentPool(envId);
        
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

      const envPool = getEnvironmentPool(envId);
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

      const sourcePool = getEnvironmentPool(sourceEnvId);
      const targetPool = getEnvironmentPool(targetEnvId);

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

      const envPool = getEnvironmentPool(envId);
      
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

      if (envId === 'degoudse' || envId === 'degoudse') {
        return res.status(400).json({ error: 'Cannot archive protected environments' });
      }

      // Create or update environment metadata table to track archived status
      const envPool = getEnvironmentPool(envId);
      
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

      if (envId === 'degoudse' || envId === 'degoudse') {
        return res.status(400).json({ error: 'Cannot delete protected environments' });
      }

      // Get environment pool
      const envPool = getEnvironmentPool(envId);
      
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

  // OKR Comments API endpoints with environment support
  
  // Get comments for a metric
  app.get('/api/:envId/okr-metrics/:id/comments', async (req, res) => {
    try {
      const envId = req.params.envId;
      const metricId = parseInt(req.params.id);
      const envPool = getEnvironmentPool(envId);
      
      const result = await envPool.query(`
        SELECT c.*, u.username as user_name, m.name as metric_name
        FROM ${envId}.okr_comments c
        LEFT JOIN ${envId}.users u ON c.user_id = u.id
        LEFT JOIN ${envId}.okr_metrics m ON c.metric_id = m.id
        WHERE c.metric_id = $1
        ORDER BY c.created_at DESC
      `, [metricId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching OKR comments:', error);
      res.status(500).json({ error: 'Failed to fetch OKR comments' });
    }
  });

  // Create comment for a metric
  app.post('/api/:envId/okr-metrics/:id/comments', async (req, res) => {
    try {
      const envId = req.params.envId;
      const metricId = parseInt(req.params.id);
      const { comment, user_id, contact_id, partner_id } = req.body;
      const envPool = getEnvironmentPool(envId);
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.okr_comments (metric_id, user_id, contact_id, comment, partner_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [metricId, user_id || 1, contact_id, comment, partner_id]);
      
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

  // Saved Lists API endpoints - redirect to De Goudse
  app.get('/api/saved-lists', (req, res) => {
    const queryParams = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    res.redirect(`/api/degoudse/saved-lists${queryParams}`);
  });

  // REMOVED: Shadow endpoint causing conflicts with environment-specific endpoints
  // Use /api/degoudse/saved-lists instead

  app.put('/api/saved-lists/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, members, filters, is_shared } = req.body;
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
      const result = await db.execute(sql`
        UPDATE ${sql.identifier(envId as string)}.saved_lists 
        SET 
          name = ${name},
          description = ${description},
          members = ${JSON.stringify(members || [])},
          filters = ${JSON.stringify(filters || {})},
          is_shared = ${is_shared || false},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Saved list not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating saved list:', error);
      res.status(500).json({ error: 'Failed to update saved list' });
    }
  });

  app.delete('/api/saved-lists/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
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

  // Saved Views API endpoints - redirect to De Goudse
  app.get('/api/saved-views', (req, res) => {
    const queryParams = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    res.redirect(`/api/degoudse/saved-views${queryParams}`);
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

  app.put('/api/saved-views/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, filters, is_shared } = req.body;
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
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
      const envId = req.headers['x-environment-id'] || 'degoudse';
      
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

  // Activity System API Routes

  // Get activities for a partner (tasks, comments, attachments, OKR comments)
  app.get('/api/:envId/partners/:partnerId/activities', async (req, res) => {
    try {
      const { envId, partnerId } = req.params;
      const envPool = getEnvironmentPool(envId);
      
      // Get tasks
      const tasksResult = await envPool.query(`
        SELECT t.*, u1.full_name as assigned_to_name, u2.full_name as assigned_by_name
        FROM ${envId}.activity_tasks t
        LEFT JOIN ${envId}.users u1 ON t.assigned_to_id = u1.id
        LEFT JOIN ${envId}.users u2 ON t.assigned_by_id = u2.id
        WHERE t.entity_type = 'partner' AND t.entity_id = $1
        ORDER BY t.created_at DESC
      `, [parseInt(partnerId)]);
      
      // Get activity comments
      const commentsResult = await envPool.query(`
        SELECT c.*, u1.full_name as author_name, u2.full_name as assigned_to_name
        FROM ${envId}.activity_comments c
        LEFT JOIN ${envId}.users u1 ON c.author_id = u1.id
        LEFT JOIN ${envId}.users u2 ON c.assigned_to_id = u2.id
        WHERE c.entity_type = 'partner' AND c.entity_id = $1
        ORDER BY c.created_at DESC
      `, [parseInt(partnerId)]);
      
      // Get OKR comments for this partner
      const okrCommentsResult = await envPool.query(`
        SELECT oc.*, u.full_name as author_name, m.name as metric_name, 'okr_comment' as comment_type
        FROM ${envId}.okr_comments oc
        LEFT JOIN ${envId}.users u ON oc.user_id = u.id
        LEFT JOIN ${envId}.okr_metrics m ON oc.metric_id = m.id
        WHERE oc.partner_id = $1
        ORDER BY oc.created_at DESC
      `, [parseInt(partnerId)]);
      
      // Get attachments
      const attachmentsResult = await envPool.query(`
        SELECT a.*, u.full_name as uploaded_by_name
        FROM ${envId}.activity_attachments a
        LEFT JOIN ${envId}.users u ON a.uploaded_by_id = u.id
        WHERE a.entity_type = 'partner' AND a.entity_id = $1
        ORDER BY a.created_at DESC
      `, [parseInt(partnerId)]);
      
      // Combine regular comments and OKR comments
      const allComments = [
        ...commentsResult.rows,
        ...okrCommentsResult.rows.map(okrComment => ({
          ...okrComment,
          content: okrComment.comment,
          okr_metric_name: okrComment.metric_name,
          is_okr_comment: true
        }))
      ];
      
      res.json({
        tasks: tasksResult.rows,
        comments: allComments,
        attachments: attachmentsResult.rows
      });
    } catch (error) {
      console.error('Error fetching partner activities:', error);
      res.status(500).json({ error: 'Failed to fetch partner activities' });
    }
  });

  // Create a new task
  app.post('/api/:envId/activity/tasks', async (req, res) => {
    try {
      const { envId } = req.params;
      const { title, description, entityType, entityId, assignedToId, assignedById, priority, dueDate, visibleToPartner } = req.body;
      const envPool = getEnvironmentPool(envId);
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.activity_tasks (title, description, entity_type, entity_id, assigned_to_id, assigned_by_id, priority, due_date, visible_to_partner, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *
      `, [title, description, entityType, parseInt(entityId), assignedToId, assignedById, priority || 'medium', dueDate, visibleToPartner || false]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // Update task completion status
  app.patch('/api/:envId/activity/tasks/:taskId', async (req, res) => {
    try {
      const { envId, taskId } = req.params;
      const { completed, completedAt } = req.body;
      const envPool = getEnvironmentPool(envId);
      
      const result = await envPool.query(`
        UPDATE ${envId}.activity_tasks 
        SET completed = $1, completed_at = $2, updated_at = NOW()
        WHERE id = $3 
        RETURNING *
      `, [completed, completedAt, parseInt(taskId)]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  // Create a new comment
  app.post('/api/:envId/activity/comments', async (req, res) => {
    try {
      const { envId } = req.params;
      const { content, authorId, entityType, entityId, assignedToId, parentCommentId, isInternal, visibleToPartner } = req.body;
      const envPool = getEnvironmentPool(envId);
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.activity_comments (content, author_id, entity_type, entity_id, assigned_to_id, parent_comment_id, is_internal, visible_to_partner, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *
      `, [content, authorId, entityType, parseInt(entityId), assignedToId, parentCommentId, isInternal || false, visibleToPartner || false]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  // Create a new OKR comment
  app.post('/api/:envId/okr/comments', async (req, res) => {
    try {
      const { envId } = req.params;
      const { metricId, partnerId, comment, userId } = req.body;
      const envPool = getEnvironmentPool(envId);
      
      const result = await envPool.query(`
        INSERT INTO ${envId}.okr_comments (metric_id, user_id, partner_id, comment, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *
      `, [metricId, userId, partnerId, comment]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating OKR comment:', error);
      res.status(500).json({ error: 'Failed to create OKR comment' });
    }
  });

  // Get unified timeline for a partner
  app.get('/api/:envId/partners/:partnerId/timeline', async (req, res) => {
    try {
      const { envId, partnerId } = req.params;
      const envPool = getEnvironmentPool(envId);
      
      const result = await envPool.query(`
        SELECT * FROM ${envId}.unified_activities 
        WHERE entity_type = 'partner' AND entity_id = $1 
        ORDER BY created_at DESC
      `, [parseInt(partnerId)]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching partner timeline:', error);
      res.status(500).json({ error: 'Failed to fetch partner timeline' });
    }
  });

  // Get AI next best actions for a partner
  app.get('/api/:envId/partners/:partnerId/next-actions', async (req, res) => {
    try {
      const { envId, partnerId } = req.params;
      const envPool = getEnvironmentPool(envId);
      
      const result = await envPool.query(`
        SELECT * FROM ${envId}.next_best_actions
        WHERE partner_id = $1 AND status IN ('pending', 'in_progress')
        ORDER BY priority DESC, confidence DESC, created_at DESC
      `, [parseInt(partnerId)]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching next best actions:', error);
      res.status(500).json({ error: 'Failed to fetch next best actions' });
    }
  });

  // Generate AI next best actions for a partner
  app.post('/api/:envId/partners/:partnerId/generate-actions', async (req, res) => {
    try {
      const { envId, partnerId } = req.params;
      const envPool = getEnvironmentPool(envId);
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          error: 'OpenAI API key is required for AI recommendations. Please provide your OpenAI API key.' 
        });
      }
      
      // Get partner context
      const partnerResult = await envPool.query(`
        SELECT * FROM ${envId}.customers WHERE id = $1
      `, [parseInt(partnerId)]);
      
      const partner = partnerResult.rows[0];
      if (!partner) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      
      // Get related data for context
      const [customersResult, opportunitiesResult, tasksResult, commentsResult] = await Promise.all([
        envPool.query(`SELECT * FROM ${envId}.customers WHERE id IN (SELECT customer_id FROM ${envId}.customer_partners WHERE partner_id = $1) LIMIT 5`, [parseInt(partnerId)]),
        envPool.query(`SELECT * FROM ${envId}.opportunities WHERE id IN (SELECT opportunity_id FROM ${envId}.partner_opportunities WHERE partner_id = $1) LIMIT 5`, [parseInt(partnerId)]),
        envPool.query(`SELECT * FROM ${envId}.activity_tasks WHERE entity_type = 'partner' AND entity_id = $1 ORDER BY created_at DESC LIMIT 5`, [parseInt(partnerId)]),
        envPool.query(`SELECT * FROM ${envId}.activity_comments WHERE entity_type = 'partner' AND entity_id = $1 ORDER BY created_at DESC LIMIT 5`, [parseInt(partnerId)])
      ]);
      
      const contextData = {
        partner,
        customers: customersResult.rows,
        opportunities: opportunitiesResult.rows,
        recentTasks: tasksResult.rows,
        recentComments: commentsResult.rows
      };
      
      // Generate AI recommendations using OpenAI
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that analyzes partner relationships and suggests next best actions. Provide specific, actionable recommendations based on the partner context. Respond with JSON containing an array of actions."
          },
          {
            role: "user",
            content: `Analyze this partner context and suggest 3-5 next best actions:
            
            Partner: ${JSON.stringify(partner, null, 2)}
            Customers: ${JSON.stringify(contextData.customers, null, 2)}
            Opportunities: ${JSON.stringify(contextData.opportunities, null, 2)}
            Recent Tasks: ${JSON.stringify(contextData.recentTasks, null, 2)}
            Recent Comments: ${JSON.stringify(contextData.recentComments, null, 2)}
            
            Return a JSON object with an "actions" array. Each action should have: actionType, title, description, priority (low/medium/high/urgent), confidence (0-1), reasoning, and suggestedDate.`
          }
        ],
        response_format: { type: "json_object" },
      });
      
      const aiResult = JSON.parse(response.choices[0].message.content);
      const actions = aiResult.actions || [];
      
      // Save generated actions to database
      const savedActions = [];
      for (const action of actions) {
        const result = await envPool.query(`
          INSERT INTO ${envId}.next_best_actions (partner_id, action_type, title, description, priority, confidence, reasoning, context_data, suggested_date, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *
        `, [
          parseInt(partnerId),
          action.actionType,
          action.title,
          action.description,
          action.priority || 'medium',
          action.confidence || 0.8,
          action.reasoning,
          JSON.stringify(contextData),
          action.suggestedDate
        ]);
        savedActions.push(result.rows[0]);
      }
      
      res.json(savedActions);
    } catch (error) {
      console.error('Error generating AI actions:', error);
      res.status(500).json({ error: 'Failed to generate AI recommendations' });
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
            { name: 'price', type: 'number', isRequired: false },
            { name: 'category', type: 'string', isRequired: false },
            { name: 'sku', type: 'string', isRequired: false },
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
      
      // Get settings from database
      const settings = await UploadSettingsService.getUploadSettings(environmentId, entityType);
      
      // If no settings exist, return default mandatory attributes based on entity type
      if (!settings || settings.length === 0) {
        const defaultSettings = getDefaultMandatoryAttributes(entityType);
        return res.json(defaultSettings);
      }
      
      // Return settings in the format expected by frontend
      res.json(settings);
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

  const httpServer = createServer(app);
  return httpServer;
}
