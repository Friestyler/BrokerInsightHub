import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import {
  entityDefinitions,
  entityAttributes,
  insertEntityAttributeSchema
} from '@shared/schema';

const createEntityAttributeSchema = z.object({
  entityDefinitionId: z.number().int().positive(),
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([
    'text', 'long_text', 'number', 'date', 'datetime',
    'boolean', 'single_select', 'multi_select', 'user_single',
    'user_multi', 'currency', 'percent', 'relationship'
  ]),
  isRequired: z.boolean().default(false),
  isSystemAttribute: z.boolean().default(false),
  defaultValue: z.string().optional(),
  options: z.any().optional(),
  orderIndex: z.number().int().optional(),
  environment: z.string().min(1)
});

// Get all attributes for a specific entity definition
export const getEntityAttributes = async (req: Request, res: Response) => {
  try {
    const { entityDefinitionId } = req.params;
    
    // Validate entity definition exists
    const entityDef = await db.select({ id: entityDefinitions.id })
      .from(entityDefinitions)
      .where(eq(entityDefinitions.id, parseInt(entityDefinitionId)));
    
    if (entityDef.length === 0) {
      return res.status(404).json({ error: 'Entity definition not found' });
    }
    
    const attributes = await db.select().from(entityAttributes)
      .where(eq(entityAttributes.entityDefinitionId, parseInt(entityDefinitionId)))
      .orderBy(entityAttributes.orderIndex);
    
    res.json(attributes);
  } catch (error) {
    console.error('Error fetching entity attributes:', error);
    res.status(500).json({ error: 'Failed to fetch entity attributes' });
  }
};

// Get a specific entity attribute by ID
export const getEntityAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const attribute = await db.select().from(entityAttributes)
      .where(eq(entityAttributes.id, parseInt(id)));
    
    if (attribute.length === 0) {
      return res.status(404).json({ error: 'Entity attribute not found' });
    }
    
    res.json(attribute[0]);
  } catch (error) {
    console.error('Error fetching entity attribute:', error);
    res.status(500).json({ error: 'Failed to fetch entity attribute' });
  }
};

// Create a new entity attribute
export const createEntityAttribute = async (req: Request, res: Response) => {
  try {
    const data = createEntityAttributeSchema.parse(req.body);
    
    // Validate entity definition exists and belongs to the specified environment
    const entityDef = await db.select({ id: entityDefinitions.id })
      .from(entityDefinitions)
      .where(
        and(
          eq(entityDefinitions.id, data.entityDefinitionId),
          eq(entityDefinitions.environment, data.environment)
        )
      );
    
    if (entityDef.length === 0) {
      return res.status(404).json({ 
        error: 'Entity definition not found or does not belong to the specified environment' 
      });
    }
    
    // Check if attribute with the same name already exists for this entity definition
    const existing = await db.select({ id: entityAttributes.id })
      .from(entityAttributes)
      .where(
        and(
          eq(entityAttributes.entityDefinitionId, data.entityDefinitionId),
          eq(entityAttributes.name, data.name)
        )
      );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: `Attribute with name '${data.name}' already exists for this entity definition` 
      });
    }
    
    // Calculate next order index if not provided
    if (!data.orderIndex) {
      const lastAttribute = await db.select({ orderIndex: entityAttributes.orderIndex })
        .from(entityAttributes)
        .where(eq(entityAttributes.entityDefinitionId, data.entityDefinitionId))
        .orderBy(entityAttributes.orderIndex);
      
      const nextOrderIndex = lastAttribute.length > 0 
        ? (lastAttribute[lastAttribute.length - 1].orderIndex || 0) + 1 
        : 1;
      
      data.orderIndex = nextOrderIndex;
    }
    
    const [created] = await db.insert(entityAttributes).values({
      ...data,
      // createdAt and updatedAt will be set by default values
    }).returning();
    
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating entity attribute:', error);
    res.status(500).json({ error: 'Failed to create entity attribute' });
  }
};

// Update an entity attribute
export const updateEntityAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if attribute exists
    const existingAttr = await db.select().from(entityAttributes)
      .where(eq(entityAttributes.id, parseInt(id)));
    
    if (existingAttr.length === 0) {
      return res.status(404).json({ error: 'Entity attribute not found' });
    }
    
    // Check if this is a system attribute that shouldn't be modified
    if (existingAttr[0].isSystemAttribute) {
      // For system attributes, only allow updating isRequired
      const { isRequired } = req.body;
      
      const [updated] = await db.update(entityAttributes)
        .set({ 
          isRequired: isRequired === true || isRequired === 'true',
          updatedAt: new Date()
        })
        .where(eq(entityAttributes.id, parseInt(id)))
        .returning();
      
      return res.json(updated);
    }
    
    // For non-system attributes, allow more extensive updates
    const data = createEntityAttributeSchema.partial().parse(req.body);
    
    // Don't allow changing entityDefinitionId
    delete data.entityDefinitionId;
    
    const [updated] = await db.update(entityAttributes)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(entityAttributes.id, parseInt(id)))
      .returning();
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating entity attribute:', error);
    res.status(500).json({ error: 'Failed to update entity attribute' });
  }
};

// Delete an entity attribute
export const deleteEntityAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if attribute exists and is not a system attribute
    const existingAttr = await db.select().from(entityAttributes)
      .where(eq(entityAttributes.id, parseInt(id)));
    
    if (existingAttr.length === 0) {
      return res.status(404).json({ error: 'Entity attribute not found' });
    }
    
    if (existingAttr[0].isSystemAttribute) {
      return res.status(403).json({ error: 'Cannot delete system attributes' });
    }
    
    // Delete the attribute
    await db.delete(entityAttributes)
      .where(eq(entityAttributes.id, parseInt(id)));
    
    res.json({ message: 'Entity attribute deleted successfully' });
  } catch (error) {
    console.error('Error deleting entity attribute:', error);
    res.status(500).json({ error: 'Failed to delete entity attribute' });
  }
};