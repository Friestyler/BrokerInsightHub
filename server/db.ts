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

// Configure multiple environments with proper database isolation
const environmentConfigs: EnvironmentConfig = {
  // My Qollabi - uses the main database
  myqollabi: {
    connectionString: process.env.DATABASE_URL || '',
    name: 'My Qollabi Database'
  },
  // De Goudse - independent environment (for now uses same DB but will be migrated)
  degoudse: {
    connectionString: process.env.DATABASE_URL || '',
    name: 'De Goudse Database'
  },
  // ACME CO - independent environment
  acme: {
    connectionString: process.env.DATABASE_URL || '',
    name: 'ACME Database'
  },
  // Additional environments
  globex: {
    connectionString: process.env.DATABASE_URL || '',
    name: 'Globex Database'
  },
  oceanic: {
    connectionString: process.env.DATABASE_URL || '',
    name: 'Oceanic Database'
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

// Default connections (My Qollabi)
export const pool = pools.myqollabi;
export const db = dbs.myqollabi;

// Helper function to get database connection for a specific environment
export function getEnvironmentDb(envId = 'myqollabi') {
  return dbs[envId] || db;
}

// Helper function to get database pool for a specific environment
export function getEnvironmentPool(envId = 'myqollabi') {
  return pools[envId] || pool;
}