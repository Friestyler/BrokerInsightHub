import { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'http';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { sql } from 'drizzle-orm';
import { db, getEnvironmentDb, getEnvironmentPool } from './db';
import { initializeEnvironment, synchronizeSchemas, getEnvironmentCounts } from './schemaSynchronizer';
import { copyEnvironmentData } from './initDatabase';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const fileUpload = multer({
  dest: 'uploads/',
  fileFilter: (req: any, file: any, cb: any) => {
    // Accept PDF files and Excel files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Excel files are allowed'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Default API routes - redirect to De Goudse environment (our primary environment)
  app.get('/api/partners', (req, res) => res.redirect('/api/degoudse/partners'));
  app.get('/api/customers', (req, res) => res.redirect('/api/degoudse/customers'));
  app.get('/api/opportunities', (req, res) => res.redirect('/api/degoudse/opportunities'));
  app.get('/api/products', (req, res) => res.redirect('/api/degoudse/products'));
  app.get('/api/vendors', (req, res) => res.redirect('/api/degoudse/vendors'));
  app.get('/api/saved-lists', (req, res) => res.redirect('/api/degoudse/saved-lists'));
  app.get('/api/saved-views', (req, res) => res.redirect('/api/degoudse/saved-views'));

  // Helper functions for De Goudse data processing
  function getIndustryFromDescription(description: string): string {
    if (!description) return 'Other';
    const desc = description.toLowerCase();
    if (desc.includes('insurance')) return 'Insurance';
    if (desc.includes('mortgage') || desc.includes('hypotheek')) return 'Financial Services';
    if (desc.includes('financial')) return 'Financial Services';
    return 'Other';
  }

  function getTypeFromDescription(description: string): string {
    if (!description) return 'Partner';
    const desc = description.toLowerCase();
    if (desc.includes('broker')) return 'Broker';
    if (desc.includes('agent')) return 'Agent';
    if (desc.includes('underwriter')) return 'Underwriter';
    return 'Partner';
  }

  function getSizeFromDescription(description: string): string {
    return 'medium'; // Default size for now
  }

  // De Goudse environment API routes (our primary working environment)
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
      res.json([]);
    }
  });

  app.get('/api/degoudse/customers', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT c.id, c.name, c.description, c."ownerId", c."createdAt", c."updatedAt",
               COUNT(DISTINCT pc.partner_id) as partner_count,
               COUNT(DISTINCT co.opportunity_id) as opportunity_count
        FROM degoudse.customers c
        LEFT JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN degoudse.customer_opportunities co ON c.id = co.customer_id
        GROUP BY c.id, c.name, c.description, c."ownerId", c."createdAt", c."updatedAt"
        ORDER BY c.id
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
        const partnerIds = customerPartners.map((p: any) => p.partner_id).join(',');
        
        return {
          id: customer.id,
          name: customer.name,
          description: customer.description,
          ownerId: customer.ownerId,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
          partnerNames: partnerNames || '',
          partnerIds: partnerIds || '',
          partnerCount: parseInt(customer.partner_count) || 0,
          opportunityCount: parseInt(customer.opportunity_count) || 0
        };
      });
      
      console.log(`Returning ${customers.length} customers from De Goudse database`);
      res.json(customers);
    } catch (error) {
      console.error('Error fetching De Goudse customers:', error);
      res.json([]);
    }
  });

  // Partner relationship endpoints
  app.get('/api/degoudse/partners/:id/customers', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT c.* 
        FROM degoudse.customers c
        JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        WHERE pc.partner_id = $1
        ORDER BY c.name
      `, [partnerId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching partner customers:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/partners/:id/opportunities', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT o.* 
        FROM degoudse.opportunities o
        JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
        WHERE po.partner_id = $1
        ORDER BY o.title
      `, [partnerId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching partner opportunities:', error);
      res.json([]);
    }
  });

  // Customer relationship endpoints
  app.get('/api/degoudse/customers/:id/partners', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT p.* 
        FROM degoudse.partners p
        JOIN degoudse.partner_customers pc ON p.id = pc.partner_id
        WHERE pc.customer_id = $1
        ORDER BY p.name
      `, [customerId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching customer partners:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/customers/:id/opportunities', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT o.* 
        FROM degoudse.opportunities o
        JOIN degoudse.customer_opportunities co ON o.id = co.opportunity_id
        WHERE co.customer_id = $1
        ORDER BY o.title
      `, [customerId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching customer opportunities:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/customers/:id/products', async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT DISTINCT p.* 
        FROM degoudse.products p
        JOIN degoudse.opportunity_products op ON p.id = op.product_id
        JOIN degoudse.opportunities o ON o.id = op.opportunity_id
        JOIN degoudse.customer_opportunities co ON o.id = co.opportunity_id
        WHERE co.customer_id = $1
        ORDER BY p.name
      `, [customerId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching customer products:', error);
      res.json([]);
    }
  });

  // Opportunity relationship endpoints
  app.get('/api/degoudse/opportunities/:id/partners', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT p.* 
        FROM degoudse.partners p
        JOIN degoudse.partner_opportunities po ON p.id = po.partner_id
        WHERE po.opportunity_id = $1
        ORDER BY p.name
      `, [opportunityId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching opportunity partners:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/opportunities/:id/customers', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT c.* 
        FROM degoudse.customers c
        JOIN degoudse.customer_opportunities co ON c.id = co.customer_id
        WHERE co.opportunity_id = $1
        ORDER BY c.name
      `, [opportunityId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching opportunity customers:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/opportunities/:id/products', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT p.* 
        FROM degoudse.products p
        JOIN degoudse.opportunity_products op ON p.id = op.product_id
        WHERE op.opportunity_id = $1
        ORDER BY p.name
      `, [opportunityId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching opportunity products:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/opportunities', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT o.*, 
               STRING_AGG(DISTINCT p.name, ', ') as partner_names,
               STRING_AGG(DISTINCT c.name, ', ') as customer_names,
               COALESCE(COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN p.id END), 0) as partner_count,
               COALESCE(COUNT(DISTINCT CASE WHEN c.id IS NOT NULL THEN c.id END), 0) as customer_count,
               COALESCE(COUNT(DISTINCT CASE WHEN pr.id IS NOT NULL THEN pr.id END), 0) as product_count
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
        LEFT JOIN degoudse.partners p ON p.id = po.partner_id
        LEFT JOIN degoudse.customer_opportunities co ON o.id = co.opportunity_id
        LEFT JOIN degoudse.customers c ON c.id = co.customer_id
        LEFT JOIN degoudse.opportunity_products op ON o.id = op.opportunity_id
        LEFT JOIN degoudse.products pr ON pr.id = op.product_id
        GROUP BY o.id, o.title, o.description, o.stage, o.status, o."estimatedValue", 
                 o."expectedCloseDate", o."ownerId", o."createdAt", o."updatedAt"
        ORDER BY o.id
      `);

      const opportunities = result.rows.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        stage: opp.stage,
        status: opp.status,
        estimatedValue: opp.estimatedValue,
        expectedCloseDate: opp.expectedCloseDate,
        ownerId: opp.ownerId,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
        partnerNames: opp.partner_names || '',
        customerNames: opp.customer_names || '',
        partnerCount: parseInt(opp.partner_count) || 0,
        customerCount: parseInt(opp.customer_count) || 0,
        productCount: parseInt(opp.product_count) || 0
      }));

      console.log(`Returning ${opportunities.length} opportunities from De Goudse database`);
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching De Goudse opportunities:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/products', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT * FROM degoudse.products ORDER BY id
      `);
      
      console.log(`Returning ${result.rows.length} products from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse products:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/vendors', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT * FROM degoudse.vendors ORDER BY id
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse vendors:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/saved-lists', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT * FROM degoudse.saved_lists ORDER BY id
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse saved lists:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/saved-views', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT * FROM degoudse.saved_views ORDER BY id
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse saved views:', error);
      res.json([]);
    }
  });

  // OKR Template Assignments API endpoints for De Goudse
  app.get('/api/degoudse/template-assignments/:entityType/:entityId', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const envPool = getEnvironmentPool('degoudse');
      
      const result = await envPool.query(`
        SELECT 
          ta.*,
          om.name as template_name,
          om.description as template_description,
          om.tags
        FROM degoudse.template_assignments ta
        LEFT JOIN degoudse.okr_metrics om ON ta.template_id = om.id
        WHERE ta.entity_type = $1 AND ta.entity_id = $2
        ORDER BY ta.assigned_at DESC
      `, [entityType, parseInt(entityId)]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse template assignments:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/template-assignments/:entityType', async (req, res) => {
    try {
      const { entityType } = req.params;
      const envPool = getEnvironmentPool('degoudse');
      
      const result = await envPool.query(`
        SELECT 
          ta.*,
          om.name as template_name,
          om.description as template_description,
          om.tags
        FROM degoudse.template_assignments ta
        LEFT JOIN degoudse.okr_metrics om ON ta.template_id = om.id
        WHERE ta.entity_type = $1
        ORDER BY ta.assigned_at DESC
      `, [entityType]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse template assignments:', error);
      res.json([]);
    }
  });

  app.post('/api/degoudse/template-assignments', async (req, res) => {
    try {
      const { templateIds, entityType, entityId, assignedBy, notes } = req.body;
      const envPool = getEnvironmentPool('degoudse');
      
      if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
        return res.status(400).json({ error: 'Template IDs are required' });
      }
      
      const assignments = [];
      
      for (const templateId of templateIds) {
        const result = await envPool.query(`
          INSERT INTO degoudse.template_assignments 
          (template_id, entity_type, entity_id, assigned_by, assigned_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          RETURNING *
        `, [templateId, entityType, parseInt(entityId), assignedBy || 'system']);
        assignments.push(result.rows[0]);
      }
      
      res.status(201).json(assignments);
    } catch (error) {
      console.error('Error creating De Goudse template assignments:', error);
      res.status(500).json({ error: 'Failed to create template assignments' });
    }
  });

  // Environment management routes
  app.get('/api/admin/environments', async (req, res) => {
    try {
      // Return only De Goudse as our primary environment
      const environments = [{
        id: 'degoudse',
        name: 'De Goudse',
        apiBase: '/api/degoudse',
        description: 'Primary De Goudse environment with uploaded wizard data',
        status: 'active',
        isPrimary: true
      }];
      
      res.json(environments);
    } catch (error) {
      console.error('Error fetching environments:', error);
      res.json([]);
    }
  });

  // Database status check
  app.get('/api/database-status', async (req: Request, res: Response) => {
    try {
      const counts = await getEnvironmentCounts();
      res.json({
        status: 'connected',
        environments: counts
      });
    } catch (error) {
      console.error('Database status check failed:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed' 
      });
    }
  });

  const server = createServer(app);
  return server;
}