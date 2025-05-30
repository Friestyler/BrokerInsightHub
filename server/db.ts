import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Environment configuration
interface DatabaseConfig {
  connectionString: string;
  schema: string; // Schema name for isolation within the database
}

interface EnvironmentConfig {
  [key: string]: DatabaseConfig;
}

// Configure multiple environments
const environmentConfigs: EnvironmentConfig = {
  // Default environment (My Qollabi) - uses the main schema
  myqollabi: {
    connectionString: process.env.DATABASE_URL || '',
    schema: 'myqollabi'
  },
  // De Goudse environment - completely independent copy of My Qollabi
  degoudse: {
    connectionString: process.env.DATABASE_URL || '',
    schema: 'degoudse'
  },
  // ACME CO environment - uses a dedicated schema for isolation
  acme: {
    connectionString: process.env.DATABASE_URL || '',
    schema: 'acme'
  },
  // Additional environments
  globex: {
    connectionString: process.env.DATABASE_URL || '',
    schema: 'globex'
  },
  oceanic: {
    connectionString: process.env.DATABASE_URL || '',
    schema: 'oceanic'
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

// Default connections
export const pool = pools.myqollabi;
export const db = dbs.myqollabi;

// Helper function to get database connection for a specific environment
export function getEnvironmentDb(envId = 'myqollabi') {
  return dbs[envId] || db; // Fall back to default if environment not found
}

// Helper function to get pool for a specific environment
export function getEnvironmentPool(envId = 'myqollabi') {
  return pools[envId] || pool; // Fall back to default if environment not found
}