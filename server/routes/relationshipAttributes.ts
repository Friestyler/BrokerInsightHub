import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import {
  entityDefinitions,
  entityAttributes,
  relationshipAttributes,
  insertRelationshipAttributeSchema,
  insertEntityAttributeSchema
} from '@shared/schema';

// Schema for creating a relationship attribute with simplified inputs
const createRelationshipSchema = z.object({
  sourceEntityId: z.number().int().positive(),
  targetEntityId: z.number().int().positive(),
  sourceAttributeName: z.string().min(1),
  targetAttributeName: z.string().min(1),
  relationshipType: z.enum(['one_to_many', 'many_to_one', 'many_to_many']),
  environment: z.string().min(1)
});

// Get all relationship attributes for a specific environment
export const getRelationshipAttributes = async (req: Request, res: Response) => {
  try {
    const environment = req.query.environment as string;
    
    if (!environment) {
      return res.status(400).json({ error: 'Environment parameter is required' });
    }
    
    // Join with entity definitions and attributes to get their display names
    const relationships = await db.select({
      id: relationshipAttributes.id,
      sourceEntityId: relationshipAttributes.sourceEntityId,
      targetEntityId: relationshipAttributes.targetEntityId,
      sourceAttributeId: relationshipAttributes.sourceAttributeId,
      targetAttributeId: relationshipAttributes.targetAttributeId,
      relationshipType: relationshipAttributes.relationshipType,
      environment: relationshipAttributes.environment,
      createdAt: relationshipAttributes.createdAt,
      updatedAt: relationshipAttributes.updatedAt,
      // Include related entity and attribute information
      sourceEntity: entityDefinitions,
      targetEntity: entityDefinitions,
      sourceAttribute: entityAttributes,
      targetAttribute: entityAttributes
    })
    .from(relationshipAttributes)
    .where(eq(relationshipAttributes.environment, environment))
    .leftJoin(
      entityDefinitions,
      eq(relationshipAttributes.sourceEntityId, entityDefinitions.id)
    )
    .leftJoin(
      entityDefinitions,
      eq(relationshipAttributes.targetEntityId, entityDefinitions.id)
    )
    .leftJoin(
      entityAttributes,
      eq(relationshipAttributes.sourceAttributeId, entityAttributes.id)
    )
    .leftJoin(
      entityAttributes,
      eq(relationshipAttributes.targetAttributeId, entityAttributes.id)
    );
    
    res.json(relationships);
  } catch (error) {
    console.error('Error fetching relationship attributes:', error);
    res.status(500).json({ error: 'Failed to fetch relationship attributes' });
  }
};

// Get a specific relationship attribute by ID
export const getRelationshipAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const relationship = await db.select().from(relationshipAttributes)
      .where(eq(relationshipAttributes.id, parseInt(id)));
    
    if (relationship.length === 0) {
      return res.status(404).json({ error: 'Relationship attribute not found' });
    }
    
    res.json(relationship[0]);
  } catch (error) {
    console.error('Error fetching relationship attribute:', error);
    res.status(500).json({ error: 'Failed to fetch relationship attribute' });
  }
};

// Create a new relationship attribute with bidirectional connection
export const createRelationshipAttribute = async (req: Request, res: Response) => {
  try {
    // Parse and validate input
    const data = createRelationshipSchema.parse(req.body);
    
    // Validate both entity definitions exist and belong to the specified environment
    const sourceEntity = await db.select()
      .from(entityDefinitions)
      .where(
        and(
          eq(entityDefinitions.id, data.sourceEntityId),
          eq(entityDefinitions.environment, data.environment)
        )
      );
    
    const targetEntity = await db.select()
      .from(entityDefinitions)
      .where(
        and(
          eq(entityDefinitions.id, data.targetEntityId),
          eq(entityDefinitions.environment, data.environment)
        )
      );
    
    if (sourceEntity.length === 0 || targetEntity.length === 0) {
      return res.status(404).json({ 
        error: 'One or both entity definitions not found or do not belong to the specified environment' 
      });
    }
    
    // Start a database transaction
    let sourceAttributeId, targetAttributeId;
    
    // Create source attribute first (or find if exists)
    let sourceAttribute = await db.select()
      .from(entityAttributes)
      .where(
        and(
          eq(entityAttributes.entityDefinitionId, data.sourceEntityId),
          eq(entityAttributes.name, data.sourceAttributeName)
        )
      );
    
    if (sourceAttribute.length === 0) {
      // Calculate next order index
      const lastSourceAttr = await db.select({ orderIndex: entityAttributes.orderIndex })
        .from(entityAttributes)
        .where(eq(entityAttributes.entityDefinitionId, data.sourceEntityId))
        .orderBy(entityAttributes.orderIndex);
      
      const sourceOrderIndex = lastSourceAttr.length > 0 
        ? (lastSourceAttr[lastSourceAttr.length - 1].orderIndex || 0) + 1 
        : 1;
      
      // Create the source attribute
      const [newSourceAttr] = await db.insert(entityAttributes).values({
        entityDefinitionId: data.sourceEntityId,
        name: data.sourceAttributeName,
        displayName: data.targetAttributeName, // Use target entity name for better UX
        description: `Related ${targetEntity[0].displayName}`,
        type: 'relationship',
        isRequired: false,
        isSystemAttribute: false,
        orderIndex: sourceOrderIndex,
        environment: data.environment
      }).returning();
      
      sourceAttributeId = newSourceAttr.id;
    } else {
      sourceAttributeId = sourceAttribute[0].id;
    }
    
    // Create target attribute
    let targetAttribute = await db.select()
      .from(entityAttributes)
      .where(
        and(
          eq(entityAttributes.entityDefinitionId, data.targetEntityId),
          eq(entityAttributes.name, data.targetAttributeName)
        )
      );
    
    if (targetAttribute.length === 0) {
      // Calculate next order index
      const lastTargetAttr = await db.select({ orderIndex: entityAttributes.orderIndex })
        .from(entityAttributes)
        .where(eq(entityAttributes.entityDefinitionId, data.targetEntityId))
        .orderBy(entityAttributes.orderIndex);
      
      const targetOrderIndex = lastTargetAttr.length > 0 
        ? (lastTargetAttr[lastTargetAttr.length - 1].orderIndex || 0) + 1 
        : 1;
      
      // Create the target attribute
      const [newTargetAttr] = await db.insert(entityAttributes).values({
        entityDefinitionId: data.targetEntityId,
        name: data.targetAttributeName,
        displayName: data.sourceAttributeName, // Use source entity name for better UX
        description: `Related ${sourceEntity[0].displayName}`,
        type: 'relationship',
        isRequired: false,
        isSystemAttribute: false,
        orderIndex: targetOrderIndex,
        environment: data.environment
      }).returning();
      
      targetAttributeId = newTargetAttr.id;
    } else {
      targetAttributeId = targetAttribute[0].id;
    }
    
    // Check if relationship already exists
    const existingRelationship = await db.select()
      .from(relationshipAttributes)
      .where(
        and(
          eq(relationshipAttributes.sourceEntityId, data.sourceEntityId),
          eq(relationshipAttributes.targetEntityId, data.targetEntityId),
          eq(relationshipAttributes.sourceAttributeId, sourceAttributeId),
          eq(relationshipAttributes.targetAttributeId, targetAttributeId)
        )
      );
    
    if (existingRelationship.length > 0) {
      return res.status(409).json({ 
        error: 'A relationship between these entities with these attributes already exists' 
      });
    }
    
    // Create the relationship
    const [relationship] = await db.insert(relationshipAttributes).values({
      sourceEntityId: data.sourceEntityId,
      targetEntityId: data.targetEntityId,
      sourceAttributeId: sourceAttributeId,
      targetAttributeId: targetAttributeId,
      relationshipType: data.relationshipType,
      environment: data.environment
    }).returning();
    
    res.status(201).json(relationship);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating relationship attribute:', error);
    res.status(500).json({ error: 'Failed to create relationship attribute' });
  }
};

// Update a relationship attribute
export const updateRelationshipAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { relationshipType } = req.body;
    
    if (!relationshipType) {
      return res.status(400).json({ error: 'relationshipType is required' });
    }
    
    const [updated] = await db.update(relationshipAttributes)
      .set({
        relationshipType,
        updatedAt: new Date()
      })
      .where(eq(relationshipAttributes.id, parseInt(id)))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Relationship attribute not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating relationship attribute:', error);
    res.status(500).json({ error: 'Failed to update relationship attribute' });
  }
};

// Delete a relationship attribute
export const deleteRelationshipAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First get the relationship to know which attributes to delete
    const relationship = await db.select()
      .from(relationshipAttributes)
      .where(eq(relationshipAttributes.id, parseInt(id)));
    
    if (relationship.length === 0) {
      return res.status(404).json({ error: 'Relationship attribute not found' });
    }
    
    const rel = relationship[0];
    
    // Delete the relationship
    await db.delete(relationshipAttributes)
      .where(eq(relationshipAttributes.id, parseInt(id)));
    
    // Delete the source and target attributes if they are not system attributes
    const sourceAttr = await db.select().from(entityAttributes)
      .where(eq(entityAttributes.id, rel.sourceAttributeId));
    
    const targetAttr = await db.select().from(entityAttributes)
      .where(eq(entityAttributes.id, rel.targetAttributeId));
    
    if (sourceAttr.length > 0 && !sourceAttr[0].isSystemAttribute) {
      await db.delete(entityAttributes)
        .where(eq(entityAttributes.id, rel.sourceAttributeId));
    }
    
    if (targetAttr.length > 0 && !targetAttr[0].isSystemAttribute) {
      await db.delete(entityAttributes)
        .where(eq(entityAttributes.id, rel.targetAttributeId));
    }
    
    res.json({ message: 'Relationship attribute deleted successfully' });
  } catch (error) {
    console.error('Error deleting relationship attribute:', error);
    res.status(500).json({ error: 'Failed to delete relationship attribute' });
  }
};