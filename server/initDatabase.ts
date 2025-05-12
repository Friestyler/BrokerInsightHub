import { Pool } from "@neondatabase/serverless";
import { seedEntitySystem } from './seedEntitySystem';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@shared/schema';
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Push database schema using drizzle-kit
 */
async function createEntityTables() {
  try {
    console.log('Creating entity tables manually...');
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Create enum types
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
          CREATE TYPE relationship_type AS ENUM ('one_to_many', 'many_to_one', 'many_to_many');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attribute_type') THEN
          CREATE TYPE attribute_type AS ENUM (
            'text', 'long_text', 'number', 'date', 'datetime', 'boolean', 
            'single_select', 'multi_select', 'user_single', 'user_multi', 
            'currency', 'percent', 'relationship'
          );
        END IF;
      END
      $$;
    `);
    
    // Create entity_definitions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entity_definitions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        table_name TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        environment TEXT NOT NULL
      );
    `);
    
    // Create entity_attributes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entity_attributes (
        id SERIAL PRIMARY KEY,
        entity_definition_id INTEGER NOT NULL REFERENCES entity_definitions(id),
        name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        type attribute_type NOT NULL,
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        is_system_attribute BOOLEAN NOT NULL DEFAULT FALSE,
        default_value TEXT,
        options JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        order_index INTEGER NOT NULL,
        environment TEXT NOT NULL
      );
    `);
    
    // Create relationship_attributes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS relationship_attributes (
        id SERIAL PRIMARY KEY,
        source_entity_id INTEGER NOT NULL REFERENCES entity_definitions(id),
        target_entity_id INTEGER NOT NULL REFERENCES entity_definitions(id),
        source_attribute_id INTEGER NOT NULL REFERENCES entity_attributes(id),
        target_attribute_id INTEGER NOT NULL REFERENCES entity_attributes(id),
        relationship_type relationship_type NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        environment TEXT NOT NULL
      );
    `);
    
    // Create entity_attribute_values table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entity_attribute_values (
        id SERIAL PRIMARY KEY,
        entity_id INTEGER NOT NULL,
        entity_type TEXT NOT NULL,
        attribute_id INTEGER NOT NULL REFERENCES entity_attributes(id),
        value TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        environment TEXT NOT NULL
      );
    `);
    
    console.log('Entity tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating entity tables:', error);
    return false;
  }
}

/**
 * Initializes schemas for all environments
 */
export async function initializeSchemas() {
  try {
    console.log('Initializing database schemas for all environments...');
    
    const envSchemas = ['qollabi', 'acme', 'globex', 'oceanic'];
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL not found in environment');
    }
    
    const pool = new Pool({ connectionString });
    
    // Create schemas for all environments
    for (const schema of envSchemas) {
      await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
      console.log(`Schema "${schema}" created or verified.`);
    }
    
    console.log('All database schemas initialized successfully');
    
    // Create entity tables
    const tablesCreated = await createEntityTables();
    
    if (tablesCreated) {
      // Once tables are created, seed entity system with standard data
      await seedEntitySystem();
    } else {
      console.log('Skipping entity system seeding due to table creation failure');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing database schemas:', error);
    return false;
  }
}