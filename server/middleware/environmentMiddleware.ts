import { Request, Response, NextFunction } from 'express';
import { getEnvironmentDb } from '../db';
import { AsyncLocalStorage } from 'async_hooks';

// Default environment if none specified
const DEFAULT_ENVIRONMENT = 'degoudse';

// Create async local storage to store the current request context
const requestStorage = new AsyncLocalStorage<Request>();

// Make the storage globally available
declare global {
  var requestStorage: AsyncLocalStorage<Request>;
}

// Assign to global for access from other modules
global.requestStorage = requestStorage;

// Middleware to determine the environment for the current request - only De Goudse
export function environmentMiddleware(req: Request, res: Response, next: NextFunction) {
  const envId = DEFAULT_ENVIRONMENT; // Always use degoudse
  
  // Store the current environment ID in the request object for later use
  (req as any).environmentId = envId;
  
  // Store the appropriate database connection in the request object
  (req as any).db = getEnvironmentDb(envId);
  
  // Run the next middleware in the request context
  requestStorage.run(req, next);
}