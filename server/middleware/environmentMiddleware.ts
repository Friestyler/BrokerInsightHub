import { Request, Response, NextFunction } from 'express';
import { getEnvironmentDb } from '../db';

// Default environment if none specified
const DEFAULT_ENVIRONMENT = 'myqollabi';

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
  
  next();
}