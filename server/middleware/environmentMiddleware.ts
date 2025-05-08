import { Request, Response, NextFunction } from 'express';
import { getEnvironmentDb } from '../db';
import { AsyncLocalStorage } from 'async_hooks';

// Default environment if none specified
const DEFAULT_ENVIRONMENT = 'myqollabi';

// Create async local storage to store the current request context
const requestStorage = new AsyncLocalStorage<Request>();

// Make the storage globally available
declare global {
  var requestStorage: AsyncLocalStorage<Request>;
}

// Assign to global for access from other modules
global.requestStorage = requestStorage;

// Middleware to determine the environment for the current request
export function environmentMiddleware(req: Request, res: Response, next: NextFunction) {
  let envId = DEFAULT_ENVIRONMENT;
  
  // Check for environment in the request header
  const envHeader = req.headers['x-environment'] as string;
  if (envHeader) {
    envId = envHeader;
  }
  
  // Check for environment in the URL path
  // Format: /api/env-{environment}/resource
  const envPathMatch = req.path.match(/^\/api\/env-([^/]+)/);
  if (envPathMatch) {
    envId = envPathMatch[1];
    // Rewrite the URL path to remove the environment prefix
    req.url = req.url.replace(`/env-${envId}`, '');
  }
  
  // Store the current environment ID in the request object for later use
  (req as any).environmentId = envId;
  
  // Store the appropriate database connection in the request object
  (req as any).db = getEnvironmentDb(envId);
  
  // Run the next middleware in the request context
  requestStorage.run(req, next);
}