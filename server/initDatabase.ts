import { pool } from './db';

// The list of schemas to ensure exist
const schemas = ['qollabi', 'degoudse', 'acme', 'globex', 'oceanic'];

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

/**
 * Copies all data from source environment to target environment
 * This ensures complete data isolation between environments
 */
export async function copyEnvironmentData(sourceSchema: string, targetSchema: string) {
  try {
    console.log(`Copying data from "${sourceSchema}" to "${targetSchema}"...`);
    
    const client = await pool.connect();
    
    try {
      // Get all tables in the source schema
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_type = 'BASE TABLE'
      `, [sourceSchema]);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      
      for (const tableName of tables) {
        // Copy table structure
        await client.query(`
          CREATE TABLE IF NOT EXISTS "${targetSchema}"."${tableName}" 
          (LIKE "${sourceSchema}"."${tableName}" INCLUDING ALL)
        `);
        
        // Copy data
        await client.query(`
          INSERT INTO "${targetSchema}"."${tableName}" 
          SELECT * FROM "${sourceSchema}"."${tableName}"
          ON CONFLICT DO NOTHING
        `);
        
        console.log(`Copied table "${tableName}" from ${sourceSchema} to ${targetSchema}`);
      }
      
      console.log(`Environment copy completed: ${sourceSchema} → ${targetSchema}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error copying environment data from ${sourceSchema} to ${targetSchema}:`, error);
    throw error;
  }
}