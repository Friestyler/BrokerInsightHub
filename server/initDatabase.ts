import { pool } from './db';

// Only De Goudse schema - our primary environment
const schemas = ['degoudse'];

/**
 * Initializes schemas for all environments
 */
export async function initializeSchemas() {
  let retries = 3;
  let lastError;

  while (retries > 0) {
    try {
      console.log('Initializing database schemas for all environments...');
      
      // Connect to the database with timeout
      const client = await pool.connect();
      
      try {
        // Test the connection first
        await client.query('SELECT 1');
        console.log('Database connection established successfully');
        
        // Create schemas for each environment if they don't exist
        for (const schema of schemas) {
          await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
          console.log(`Schema "${schema}" created or verified.`);
        }
        
        console.log('All database schemas initialized successfully');
        return; // Success, exit function
      } finally {
        client.release();
      }
    } catch (error) {
      lastError = error;
      retries--;
      console.error(`Database initialization attempt failed (${3 - retries}/3):`, error);
      
      if (retries > 0) {
        console.log(`Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.error('Failed to initialize database after 3 attempts');
  throw lastError;
}

/**
 * Copies all data from source environment to target environment
 * This ensures complete data isolation between environments
 */
export async function copyEnvironmentData(sourceSchema: string, targetSchema: string) {
  try {
    console.log(`Copying data from "${sourceSchema}" to "${targetSchema}"...`);
    
    // Get all tables in the source schema
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ${sourceSchema}
      AND table_type = 'BASE TABLE'
    `;
    
    const tables = tablesResult.map((row: any) => row.table_name);
    
    for (const tableName of tables) {
      // Copy table structure
      await sql`
        CREATE TABLE IF NOT EXISTS ${sql(`${targetSchema}.${tableName}`)}
        (LIKE ${sql(`${sourceSchema}.${tableName}`)} INCLUDING ALL)
      `;
      
      // Copy data
      await sql`
        INSERT INTO ${sql(`${targetSchema}.${tableName}`)}
        SELECT * FROM ${sql(`${sourceSchema}.${tableName}`)}
        ON CONFLICT DO NOTHING
      `;
      
      console.log(`Copied table "${tableName}" from ${sourceSchema} to ${targetSchema}`);
    }
    
    console.log(`Environment copy completed: ${sourceSchema} → ${targetSchema}`);
  } catch (error) {
    console.error(`Error copying environment data from ${sourceSchema} to ${targetSchema}:`, error);
    throw error;
  }
}