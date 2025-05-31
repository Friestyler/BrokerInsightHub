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
        SELECT c.*, 
               COUNT(DISTINCT pc.partner_id) as partner_count,
               COUNT(DISTINCT co.opportunity_id) as opportunity_count
        FROM degoudse.customers c
        LEFT JOIN degoudse.partner_customers pc ON c.id = pc.customer_id
        LEFT JOIN degoudse.customer_opportunities co ON c.id = co.customer_id
        GROUP BY c.id, c.name, c.description, c.contact_name, c.contact_email, 
                 c.contact_phone, c.owner_id, c.assigned_partner_id, c.created_at, c.updated_at
        ORDER BY c.id
      `);
      
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
      
      console.log(`Returning ${customers.length} customers from De Goudse database`);
      res.json(customers);
    } catch (error) {
      console.error('Error fetching De Goudse customers:', error);
      res.json([]);
    }
  });

  app.get('/api/degoudse/opportunities', async (req, res) => {
    try {
      const envPool = getEnvironmentPool('degoudse');
      const result = await envPool.query(`
        SELECT o.*, 
               STRING_AGG(DISTINCT p.name, ', ') as partner_names,
               STRING_AGG(DISTINCT c.name, ', ') as customer_names
        FROM degoudse.opportunities o
        LEFT JOIN degoudse.partner_opportunities po ON o.id = po.opportunity_id
        LEFT JOIN degoudse.partners p ON p.id = po.partner_id
        LEFT JOIN degoudse.customer_opportunities co ON o.id = co.opportunity_id
        LEFT JOIN degoudse.customers c ON c.id = co.customer_id
        GROUP BY o.id, o.title, o.description, o.stage, o.status, o.estimated_value, 
                 o.expected_close_date, o.assigned_user_ids, o.created_at, o.updated_at
        ORDER BY o.id
      `);

      const opportunities = result.rows.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        stage: opp.stage,
        status: opp.status,
        estimatedValue: opp.estimated_value,
        expectedCloseDate: opp.expected_close_date,
        assignedUserIds: opp.assigned_user_ids,
        createdAt: opp.created_at,
        updatedAt: opp.updated_at,
        partnerNames: opp.partner_names || '',
        customerNames: opp.customer_names || ''
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