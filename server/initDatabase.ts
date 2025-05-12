import { Pool } from "@neondatabase/serverless";
import { seedEntitySystem } from './seedEntitySystem';

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
    
    // Seed entity system with standard data
    await seedEntitySystem();
    
    return true;
  } catch (error) {
    console.error('Error initializing database schemas:', error);
    return false;
  }
}