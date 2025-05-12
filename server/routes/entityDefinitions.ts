import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import {
  entityDefinitions,
  entityAttributes,
  insertEntityDefinitionSchema,
  insertEntityAttributeSchema
} from '@shared/schema';

const createEntityDefinitionSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  tableName: z.string().min(1),
  environment: z.string().min(1)
});

// Get all entity definitions for a specific environment
export const getEntityDefinitions = async (req: Request, res: Response) => {
  try {
    const environment = req.query.environment as string;
    
    if (!environment) {
      return res.status(400).json({ error: 'Environment parameter is required' });
    }
    
    const definitions = await db.select().from(entityDefinitions)
      .where(eq(entityDefinitions.environment, environment));
    
    res.json(definitions);
  } catch (error) {
    console.error('Error fetching entity definitions:', error);
    res.status(500).json({ error: 'Failed to fetch entity definitions' });
  }
};

// Get a specific entity definition by ID
export const getEntityDefinition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const definition = await db.select().from(entityDefinitions)
      .where(eq(entityDefinitions.id, parseInt(id)));
    
    if (definition.length === 0) {
      return res.status(404).json({ error: 'Entity definition not found' });
    }
    
    res.json(definition[0]);
  } catch (error) {
    console.error('Error fetching entity definition:', error);
    res.status(500).json({ error: 'Failed to fetch entity definition' });
  }
};

// Create a new entity definition
export const createEntityDefinition = async (req: Request, res: Response) => {
  try {
    const data = createEntityDefinitionSchema.parse(req.body);
    
    // Check if entity with the same name already exists in this environment
    const existing = await db.select({ id: entityDefinitions.id })
      .from(entityDefinitions)
      .where(
        eq(entityDefinitions.name, data.name) &&
        eq(entityDefinitions.environment, data.environment)
      );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: `Entity definition with name '${data.name}' already exists in this environment` 
      });
    }
    
    const now = new Date();
    const [created] = await db.insert(entityDefinitions).values({
      ...data,
      createdAt: now,
      updatedAt: now
    }).returning();
    
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating entity definition:', error);
    res.status(500).json({ error: 'Failed to create entity definition' });
  }
};

// Update an entity definition
export const updateEntityDefinition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = createEntityDefinitionSchema.partial().parse(req.body);
    
    const [updated] = await db.update(entityDefinitions)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(entityDefinitions.id, parseInt(id)))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Entity definition not found' });
    }
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating entity definition:', error);
    res.status(500).json({ error: 'Failed to update entity definition' });
  }
};

// Delete an entity definition
export const deleteEntityDefinition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if there are any attributes for this entity
    const attributes = await db.select({ id: entityAttributes.id })
      .from(entityAttributes)
      .where(eq(entityAttributes.entityDefinitionId, parseInt(id)));
    
    if (attributes.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete entity definition with existing attributes. Delete attributes first.' 
      });
    }
    
    const deleted = await db.delete(entityDefinitions)
      .where(eq(entityDefinitions.id, parseInt(id)))
      .returning({ id: entityDefinitions.id });
    
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Entity definition not found' });
    }
    
    res.json({ message: 'Entity definition deleted successfully' });
  } catch (error) {
    console.error('Error deleting entity definition:', error);
    res.status(500).json({ error: 'Failed to delete entity definition' });
  }
};