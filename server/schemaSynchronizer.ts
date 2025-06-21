import { db, getEnvironmentDb, getEnvironmentPool } from './db';
import { sql } from 'drizzle-orm';

/**
 * Schema Synchronizer: Ensures all environments have identical database schemas
 * This system maintains consistency across all environments while preserving data isolation
 */

interface TableSchema {
  name: string;
  createStatement: string;
}

// Define the complete schema structure that should exist in all environments
const CORE_SCHEMA: TableSchema[] = [
  {
    name: 'partners',
    createStatement: `
      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        initials TEXT,
        industry TEXT,
        type TEXT,
        size TEXT,
        status TEXT DEFAULT 'active',
        customers TEXT,
        opportunities TEXT,
        location TEXT,
        "contactEmail" TEXT,
        "primaryContact" TEXT,
        partner_type TEXT,
        region TEXT,
        assigned_user_ids INTEGER[] DEFAULT '{}',
        linked_opportunity_ids INTEGER[] DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "customerNames" TEXT
      )
    `
  },
  {
    name: 'customers',
    createStatement: `
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        initials TEXT,
        "ownerId" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'opportunities',
    createStatement: `
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        value NUMERIC,
        stage TEXT,
        probability INTEGER,
        "expectedCloseDate" DATE,
        "actualCloseDate" DATE,
        "clientId" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        client_name TEXT,
        client_id INTEGER,
        partner_names TEXT,
        assigned_user_ids INTEGER[] DEFAULT '{}',
        linked_partner_ids INTEGER[] DEFAULT '{}'
      )
    `
  },
  {
    name: 'products',
    createStatement: `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'okr_tags',
    createStatement: `
      CREATE TABLE IF NOT EXISTS okr_tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#3b82f6',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'okr_metrics',
    createStatement: `
      CREATE TABLE IF NOT EXISTS okr_metrics (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        unit TEXT DEFAULT 'number',
        "targetValue" NUMERIC,
        "realizedValue" NUMERIC DEFAULT 0,
        threshold_low NUMERIC,
        threshold_high NUMERIC,
        timeframe TEXT DEFAULT 'quarterly',
        "displayType" TEXT DEFAULT 'number',
        "isActive" BOOLEAN DEFAULT true,
        tag_ids INTEGER[] DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'saved_views',
    createStatement: `
      CREATE TABLE IF NOT EXISTS saved_views (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "entityType" TEXT NOT NULL,
        filters JSONB DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'saved_lists',
    createStatement: `
      CREATE TABLE IF NOT EXISTS saved_lists (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "entityType" TEXT NOT NULL,
        "entityIds" INTEGER[] DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'template_assignments',
    createStatement: `
      CREATE TABLE IF NOT EXISTS template_assignments (
        id SERIAL PRIMARY KEY,
        template_id INTEGER NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(template_id, entity_type, entity_id)
      )
    `
  },
  {
    name: 'users',
    createStatement: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        "hashedPassword" TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        department TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  }
];

// Available environments that need schema synchronization
const ENVIRONMENTS = ['degoudse', 'baloise'];

/**
 * Synchronizes schema across all environments
 * This ensures all environments have identical table structures
 */
export async function synchronizeSchemas(): Promise<void> {
  console.log('🔄 Starting schema synchronization across all environments...');

  for (const envId of ENVIRONMENTS) {
    try {
      console.log(`📋 Synchronizing schema for environment: ${envId}`);
      const envDb = getEnvironmentDb(envId);

      for (const table of CORE_SCHEMA) {
        try {
          await envDb.execute(sql.raw(table.createStatement));
          console.log(`✅ Table '${table.name}' synchronized in ${envId}`);
        } catch (error) {
          console.error(`❌ Failed to create table '${table.name}' in ${envId}:`, error);
        }
      }

      console.log(`✅ Schema synchronization completed for ${envId}`);
    } catch (error) {
      console.error(`❌ Failed to synchronize schema for environment ${envId}:`, error);
    }
  }

  console.log('🎉 Schema synchronization completed for all environments');
}

/**
 * Checks if all environments have the required tables
 */
export async function validateSchemas(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  for (const envId of ENVIRONMENTS) {
    try {
      const envDb = getEnvironmentDb(envId);
      let allTablesExist = true;

      for (const table of CORE_SCHEMA) {
        try {
          // Try to query the table to see if it exists
          await envDb.execute(sql.raw(`SELECT 1 FROM ${table.name} LIMIT 1`));
        } catch (error) {
          console.log(`Table '${table.name}' missing in ${envId}`);
          allTablesExist = false;
          break;
        }
      }

      results[envId] = allTablesExist;
    } catch (error) {
      console.error(`Failed to validate schema for ${envId}:`, error);
      results[envId] = false;
    }
  }

  return results;
}

/**
 * Gets table counts and relationship counts for all environments for monitoring
 */
export async function getEnvironmentCounts(): Promise<Record<string, Record<string, number>>> {
  const counts: Record<string, Record<string, number>> = {};

  for (const envId of ENVIRONMENTS) {
    counts[envId] = {};
    try {
      const pool = getEnvironmentPool(envId);
      const schemaName = envId;

      // Entity counts
      try {
        const partnersResult = await pool.query(`SELECT COUNT(*) as count FROM ${schemaName}.partners`);
        counts[envId]['partners'] = parseInt(partnersResult.rows[0]?.count || '0');
      } catch (error) {
        counts[envId]['partners'] = 0;
      }

      try {
        const customersResult = await pool.query(`SELECT COUNT(*) as count FROM ${schemaName}.customers`);
        counts[envId]['customers'] = parseInt(customersResult.rows[0]?.count || '0');
      } catch (error) {
        counts[envId]['customers'] = 0;
      }

      try {
        const opportunitiesResult = await pool.query(`SELECT COUNT(*) as count FROM ${schemaName}.opportunities`);
        counts[envId]['opportunities'] = parseInt(opportunitiesResult.rows[0]?.count || '0');
      } catch (error) {
        counts[envId]['opportunities'] = 0;
      }

      try {
        const productsResult = await pool.query(`SELECT COUNT(*) as count FROM ${schemaName}.insurance_products`);
        counts[envId]['products'] = parseInt(productsResult.rows[0]?.count || '0');
      } catch (error) {
        counts[envId]['products'] = 0;
      }

      // Relationship counts
      try {
        const partnerCustomerResult = await pool.query(`SELECT COUNT(*) as count FROM ${schemaName}.partner_customers`);
        counts[envId]['partnerCustomerLinks'] = parseInt(partnerCustomerResult.rows[0]?.count || '0');
      } catch (error) {
        counts[envId]['partnerCustomerLinks'] = 0;
      }

      try {
        const partnerOpportunityResult = await pool.query(`SELECT COUNT(*) as count FROM ${schemaName}.partner_opportunities`);
        counts[envId]['partnerOpportunityLinks'] = parseInt(partnerOpportunityResult.rows[0]?.count || '0');
      } catch (error) {
        counts[envId]['partnerOpportunityLinks'] = 0;
      }

      try {
        const customerOpportunityResult = await pool.query(`SELECT COUNT(*) as count FROM ${schemaName}.customer_opportunities`);
        counts[envId]['customerOpportunityLinks'] = parseInt(customerOpportunityResult.rows[0]?.count || '0');
      } catch (error) {
        counts[envId]['customerOpportunityLinks'] = 0;
      }

      try {
        const opportunityProductResult = await pool.query(`SELECT COUNT(*) as count FROM ${schemaName}.opportunity_products`);
        counts[envId]['opportunityProductLinks'] = parseInt(opportunityProductResult.rows[0]?.count || '0');
      } catch (error) {
        counts[envId]['opportunityProductLinks'] = 0;
      }

    } catch (error) {
      console.error(`Failed to get counts for ${envId}:`, error);
      counts[envId] = { 
        partners: 0, customers: 0, opportunities: 0, products: 0,
        partnerCustomerLinks: 0, partnerOpportunityLinks: 0, 
        customerOpportunityLinks: 0, opportunityProductLinks: 0
      };
    }
  }

  return counts;
}

/**
 * Initialize a new environment with the complete schema
 */
export async function initializeEnvironment(envId: string): Promise<void> {
  console.log(`🚀 Initializing environment: ${envId}`);
  
  try {
    const envDb = getEnvironmentDb(envId);

    for (const table of CORE_SCHEMA) {
      await envDb.execute(sql.raw(table.createStatement));
      console.log(`✅ Created table '${table.name}' in ${envId}`);
    }

    console.log(`🎉 Environment ${envId} initialized successfully`);
  } catch (error) {
    console.error(`❌ Failed to initialize environment ${envId}:`, error);
    throw error;
  }
}