import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// Environment configuration - each environment gets its own dedicated database
interface DatabaseConfig {
  connectionString: string;
  name: string;
}

interface EnvironmentConfig {
  [key: string]: DatabaseConfig;
}

// Configure only De Goudse environment
const environmentConfigs: EnvironmentConfig = {
  // De Goudse - primary environment
  degoudse: {
    connectionString: process.env.DATABASE_URL || '',
    name: 'De Goudse Database'
  }
};

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create HTTP clients for each environment
const clients: Record<string, ReturnType<typeof neon>> = {};
const dbs: Record<string, ReturnType<typeof drizzle>> = {};

// Initialize database connections for all environments using HTTP
Object.entries(environmentConfigs).forEach(([envName, config]) => {
  clients[envName] = neon(config.connectionString);
  dbs[envName] = drizzle(clients[envName], { schema });
});

// Default connections (De Goudse only)
export const sql = clients.degoudse;
export const db = dbs.degoudse;

// Helper function to get database connection for a specific environment
export function getEnvironmentDb(envId = 'degoudse') {
  return dbs[envId] || db;
}

// Helper function to get SQL client for a specific environment
export function getEnvironmentSql(envId = 'degoudse') {
  return clients[envId] || sql;
}