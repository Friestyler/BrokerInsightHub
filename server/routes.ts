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
import { db, getEnvironmentPool, getEnvironmentDb } from './db';
import multer from 'multer';
import { copyEnvironmentData } from './initDatabase';
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
  


  // Vendors API - Returns data from myqollabi schema
  app.get('/api/vendors', async (req, res) => {
    try {
      console.log('Fetching vendors from myqollabi schema...');
      const result = await db.execute(sql`SELECT * FROM myqollabi.vendors ORDER BY id`);
      
      const vendors = result.rows.map((vendor: any) => ({
        id: vendor.id,
        name: vendor.name,
        description: vendor.description,
        location: vendor.location,
        contactEmail: vendor.contact_email,
        contactPhone: vendor.contact_phone,
        website: vendor.website,
        createdAt: vendor.created_at,
        updatedAt: vendor.updated_at
      }));
      
      console.log(`Returning ${vendors.length} vendors from myqollabi schema`);
      res.json(vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
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
      console.log('Vendor creation request body:', req.body);
      
      // Validate the request body with all vendor fields
      const { 
        name, 
        description, 
        location,
        contactEmail,
        contactPhone,
        website
      } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
      }
      
      console.log('Executing vendor insert query...');
      
      // Insert into myqollabi.vendors table with existing columns
      const result = await db.execute(sql`
        INSERT INTO myqollabi.vendors (
          name, description, created_at, updated_at
        ) VALUES (
          ${name}, ${description}, NOW(), NOW()
        ) RETURNING *
      `);
      
      console.log('Vendor insert result:', result.rows[0]);
      const vendor = result.rows[0];
      res.status(201).json(vendor);
    } catch (error) {
      console.error('Detailed error creating vendor:', error);
      res.status(500).json({ message: 'Failed to create vendor' });
    }
  });
  
  // Products API - Returns data from myqollabi schema
  app.get('/api/products', async (req, res) => {
    try {
      console.log('Fetching products from myqollabi schema...');
      const result = await db.execute(sql`SELECT * FROM myqollabi.products ORDER BY id`);
      
      const products = result.rows.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        sku: product.sku,
        price: product.price,
        vendorId: product.vendor_id,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
      
      console.log(`Returning ${products.length} products from myqollabi schema`);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  // Opportunities API - Returns data from clean opportunities_clean table
  app.get('/api/opportunities', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT o.*, c.name as client_name 
        FROM myqollabi.opportunities o
        LEFT JOIN myqollabi.customers c ON o.client_id = c.id
        ORDER BY o.id
      `);
      
      const opportunities = result.rows.map((opportunity: any) => ({
        id: opportunity.id,
        title: opportunity.title,
        clientId: opportunity.client_id,
        clientName: opportunity.client_name,
        status: opportunity.status,
        stage: opportunity.stage,
        type: opportunity.type,
        estimatedValue: opportunity.estimated_value,
        probability: opportunity.probability,
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
      }));
      
      console.log(`Returning ${opportunities.length} opportunities from myqollabi table`);
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.json([]);
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
        // Database fields
        partner_type: partner.partner_type,
        region: partner.region,
        assigned_user_ids: partner.assigned_user_ids,
        linked_opportunity_ids: partner.linked_opportunity_ids,
        createdAt: partner.created_at,
        updatedAt: partner.updated_at,
        customerNames: partner.customer_names || ''
      }));
      
      console.log(`Returning ${partners.length} partners with relationship counts from degoudse schema`);
      res.json(partners);
    } catch (error) {
      console.error('De Goudse partners API error:', error);
      res.status(500).json({ message: 'Failed to fetch partners for De Goudse environment' });
    }
  });

  app.get('/api/degoudse/customers', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query('SELECT * FROM degoudse.customers ORDER BY id');
      console.log(`Returning ${result.rows.length} customers from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('De Goudse customers API error:', error);
      res.status(500).json({ message: 'Failed to fetch customers for De Goudse environment' });
    }
  });

  app.get('/api/degoudse/products', async (req, res) => {
    try {
      const degoudseDb = getEnvironmentDb('degoudse');
      const productsList = await degoudseDb.select().from(insuranceProducts);
      console.log(`Returning ${productsList.length} products from De Goudse database`);
      res.json(productsList);
    } catch (error) {
      console.error('De Goudse products API error:', error);
      res.status(500).json({ message: 'Failed to fetch products for De Goudse environment' });
    }
  });

  app.get('/api/degoudse/saved-views', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query('SELECT * FROM degoudse.saved_views ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse saved views:', error);
      res.status(500).json({ error: 'Failed to fetch saved views' });
    }
  });

  app.get('/api/degoudse/saved-lists', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query('SELECT * FROM degoudse.saved_lists ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse saved lists:', error);
      res.status(500).json({ error: 'Failed to fetch saved lists' });
    }
  });

  app.get('/api/degoudse/opportunities', async (req, res) => {
    try {
      const degoudseDb = getEnvironmentDb('degoudse');
      const opportunitiesList = await degoudseDb.select().from(opportunities);
      console.log(`Returning ${opportunitiesList.length} opportunities from De Goudse database`);
      res.json(opportunitiesList);
    } catch (error) {
      console.error('De Goudse opportunities API error:', error);
      res.status(500).json({ message: 'Failed to fetch opportunities for De Goudse environment' });
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
          
          createdOpportunities.push(opportunityResult.rows[0]);
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
      
      const result = await db.execute(sql`
        SELECT * FROM ${sql.identifier(envId as string)}.saved_lists 
        ${entityType ? sql`WHERE entity_type = ${entityType}` : sql``}
        ORDER BY created_at DESC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching saved lists:', error);
      res.status(500).json({ error: 'Failed to fetch saved lists' });
    }
  });

  app.post('/api/saved-lists', async (req, res) => {
    try {
      const { name, description, type, entity_type, members, filters, is_shared } = req.body;
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const created_by = 1; // Default user ID for now
      
      // Handle the array properly for PostgreSQL
      const membersArray = members && Array.isArray(members) ? members : [];
      const envPool = getEnvironmentPool(envId);
      
      const result = await envPool.query(
        `INSERT INTO ${envId}.saved_lists 
         (name, description, type, entity_type, members, filters, is_shared, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [name, description || null, type, entity_type, membersArray, JSON.stringify(filters || {}), is_shared || false, created_by]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating saved list:', error);
      res.status(500).json({ error: 'Failed to create saved list' });
    }
  });

  app.put('/api/saved-lists/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, members, filters, is_shared } = req.body;
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      
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

  // Saved Views API endpoints
  app.get('/api/saved-views', async (req, res) => {
    try {
      const entityType = req.query.entity_type as string;
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const envPool = getEnvironmentPool(envId as string);
      
      let query = `SELECT * FROM ${envId}.saved_views`;
      const params = [];
      
      if (entityType) {
        query += ` WHERE entity_type = $1`;
        params.push(entityType);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const result = await envPool.query(query, params);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching saved views:', error);
      res.status(500).json({ error: 'Failed to fetch saved views' });
    }
  });

  app.post('/api/saved-views', async (req, res) => {
    try {
      const { name, description, entity_type, filters, is_shared } = req.body;
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const created_by = 1; // Default user ID for now
      const envPool = getEnvironmentPool(envId as string);
      
      const result = await envPool.query(
        `INSERT INTO ${envId}.saved_views 
         (name, description, entity_type, filters, is_shared, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, description || null, entity_type, JSON.stringify(filters || {}), is_shared || false, created_by]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating saved view:', error);
      res.status(500).json({ error: 'Failed to create saved view' });
    }
  });

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

  // Contact Management API endpoints
  app.get('/api/contacts', async (req, res) => {
    try {
      const envId = req.headers['x-environment-id'] || 'myqollabi';
      const { linkedEntityType, linkedEntityId } = req.query;
      
      let queryConditions = sql`WHERE is_active = true`;
      if (linkedEntityType) {
        queryConditions = sql`WHERE is_active = true AND linked_entity_type = ${linkedEntityType as string}`;
        if (linkedEntityId) {
          queryConditions = sql`WHERE is_active = true AND linked_entity_type = ${linkedEntityType as string} AND linked_entity_id = ${parseInt(linkedEntityId as string)}`;
        }
      }
      
      const result = await db.execute(sql`
        SELECT id, first_name, last_name, email, phone, 
               company, position, linked_entity_type, 
               linked_entity_id, notes, is_active, 
               created_at, updated_at
        FROM ${sql.identifier(envId as string)}.contacts 
        ${queryConditions}
        ORDER BY first_name ASC, last_name ASC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
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
        notes, isActive 
      } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO ${sql.identifier(envId as string)}.contacts (
          first_name, last_name, email, phone, 
          company, position, linked_entity_type, linked_entity_id,
          notes, is_active, created_at, updated_at
        ) VALUES (
          ${firstName}, ${lastName}, ${email || null}, 
          ${phone || null}, ${company || null}, ${position || null},
          ${linkedEntityType || null}, ${linkedEntityId || null}, 
          ${notes || null}, ${isActive !== false}, NOW(), NOW()
        ) RETURNING id, first_name, last_name, email, phone, 
                   company, position, linked_entity_type, 
                   linked_entity_id, notes, is_active, 
                   created_at, updated_at
      `);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
