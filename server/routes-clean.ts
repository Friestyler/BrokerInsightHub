import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { sql } from "drizzle-orm";
import { db } from '@db';
import multer from 'multer';
import { storage } from "./storage";
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';

// Multer configuration for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel, CSV, and PDF files are allowed'), false);
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

  // Only authentic De Goudse environment routes (no shadow routes)
  // These routes serve authentic data from the degoudse schema
  
  // Environment-specific routes for De Goudse
  app.get('/api/degoudse/partners', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM degoudse.partners ORDER BY id
      `);
      console.log(`Returning ${result.rows.length} partners from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse partners:', error);
      res.status(500).json({ message: 'Failed to fetch partners' });
    }
  });

  app.get('/api/degoudse/customers', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM degoudse.customers ORDER BY id
      `);
      console.log(`Returning ${result.rows.length} customers from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse customers:', error);
      res.status(500).json({ message: 'Failed to fetch customers' });
    }
  });

  app.get('/api/degoudse/products', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM degoudse.products ORDER BY id
      `);
      console.log(`Returning ${result.rows.length} products from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  app.get('/api/degoudse/vendors', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM degoudse.vendors ORDER BY id
      `);
      console.log(`Returning ${result.rows.length} vendors from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse vendors:', error);
      res.status(500).json({ message: 'Failed to fetch vendors' });
    }
  });

  app.get('/api/degoudse/contacts', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM degoudse.contacts ORDER BY id
      `);
      console.log(`Returning ${result.rows.length} contacts from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse contacts:', error);
      res.status(500).json({ message: 'Failed to fetch contacts' });
    }
  });

  app.get('/api/degoudse/opportunities', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM degoudse.opportunities ORDER BY id
      `);
      console.log(`Returning ${result.rows.length} opportunities from De Goudse database`);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching De Goudse opportunities:', error);
      res.status(500).json({ message: 'Failed to fetch opportunities' });
    }
  });

  // Other necessary routes that don't serve entity data
  app.get('/api/admin/environments', (req, res) => {
    res.json([
      {
        id: 'degoudse',
        name: 'De Goudse',
        description: 'De Goudse Insurance Environment',
        status: 'active'
      }
    ]);
  });

  // File Upload Endpoint
  app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const fileName = req.file.originalname;
      const fileSize = req.file.size;

      let extractedText = '';
      if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      }

      const document = await storage.createDocument({
        name: fileName,
        filePath: filePath,
        fileSize: fileSize,
        uploadedBy: 1,
        extractedText: extractedText
      });

      res.json({
        message: 'File uploaded successfully',
        fileId: document.id,
        fileName: fileName,
        fileSize: fileSize,
        extractedText: extractedText ? extractedText.substring(0, 500) + '...' : ''
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}