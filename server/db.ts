import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

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

// Create a pool for each environment
const pools: Record<string, Pool> = {};
const dbs: Record<string, ReturnType<typeof drizzle>> = {};

// Initialize database connections for all environments
Object.entries(environmentConfigs).forEach(([envName, config]) => {
  pools[envName] = new Pool({ connectionString: config.connectionString });
  dbs[envName] = drizzle({ client: pools[envName], schema });
});

// Default connections (De Goudse only)
export const pool = pools.degoudse;
export const db = dbs.degoudse;

// Helper function to get database connection for a specific environment
export function getEnvironmentDb(envId = 'degoudse') {
  return dbs[envId] || db;
}

// Helper function to get database pool for a specific environment
export function getEnvironmentPool(envId = 'degoudse') {
  return pools[envId] || pool;
}