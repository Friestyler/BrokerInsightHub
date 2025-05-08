import { pool } from './db';

// The list of schemas to ensure exist
const schemas = ['qollabi', 'acme', 'globex', 'oceanic'];

/**
 * Initializes schemas for all environments
 */
export async function initializeSchemas() {
  try {
    console.log('Initializing database schemas for all environments...');
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Create schemas for each environment if they don't exist
      for (const schema of schemas) {
        await client.query(`
          CREATE SCHEMA IF NOT EXISTS "${schema}";
        `);
        console.log(`Schema "${schema}" created or verified.`);
      }
      
      console.log('All database schemas initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database schemas:', error);
    throw error;
  }
}