import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

// Create an AsyncLocalStorage instance for storing environment context
export const environmentContext = new AsyncLocalStorage<string>();

// Default environment ID
const DEFAULT_ENVIRONMENT = 'qollabi';

// Middleware to extract and set environment from request
export const environmentMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Extract environment from header or query parameter
  const envFromHeader = req.headers['x-environment'] as string;
  const envFromQuery = req.query.environment as string;
  
  // Determine which environment to use (header, query, or default)
  const environmentId = envFromHeader || envFromQuery || DEFAULT_ENVIRONMENT;
  
  // Store the environment in the async local storage
  environmentContext.run(environmentId, () => {
    next();
  });
};

// Utility function to get the current environment from a request
export const getEnvironmentFromRequest = (req: Request): string => {
  // Try to get from AsyncLocalStorage first
  const envFromContext = environmentContext.getStore();
  if (envFromContext) return envFromContext;
  
  // Fallback to extracting from request
  const envFromHeader = req.headers['x-environment'] as string;
  const envFromQuery = req.query.environment as string;
  
  return envFromHeader || envFromQuery || DEFAULT_ENVIRONMENT;
};