import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { 
  entityDefinitions, 
  entityAttributes, 
  relationshipAttributes 
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { getEnvironmentFromRequest } from '../middleware/environmentMiddleware';

const router = Router();

// Get all entity definitions for current environment
router.get('/entity-definitions', async (req, res) => {
  try {
    const environment = getEnvironmentFromRequest(req);
    
    const definitions = await db.select()
      .from(entityDefinitions)
      .where(eq(entityDefinitions.environment, environment));
    
    res.json(definitions);
  } catch (error) {
    console.error('Error fetching entity definitions:', error);
    res.status(500).json({ error: 'Failed to fetch entity definitions' });
  }
});

// Get a specific entity definition
router.get('/entity-definitions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const definition = await storage.getEntityDefinition(parseInt(id));
    
    if (!definition) {
      return res.status(404).json({ error: 'Entity definition not found' });
    }
    
    res.json(definition);
  } catch (error) {
    console.error('Error fetching entity definition:', error);
    res.status(500).json({ error: 'Failed to fetch entity definition' });
  }
});

// Create a new entity definition
router.post('/entity-definitions', async (req, res) => {
  try {
    const environment = getEnvironmentFromRequest(req);
    const definition = await storage.createEntityDefinition({
      ...req.body,
      environment
    });
    
    res.status(201).json(definition);
  } catch (error) {
    console.error('Error creating entity definition:', error);
    res.status(500).json({ error: 'Failed to create entity definition' });
  }
});

// Get attributes for a specific entity
router.get('/entity-attributes/:entityName', async (req, res) => {
  try {
    const { entityName } = req.params;
    const environment = getEnvironmentFromRequest(req);
    
    // First, get the entity definition
    const [definition] = await db.select()
      .from(entityDefinitions)
      .where(
        and(
          eq(entityDefinitions.name, entityName),
          eq(entityDefinitions.environment, environment)
        )
      );
    
    if (!definition) {
      return res.status(404).json({ error: 'Entity definition not found' });
    }
    
    // Then get its attributes
    const attributes = await db.select()
      .from(entityAttributes)
      .where(
        and(
          eq(entityAttributes.entityDefinitionId, definition.id),
          eq(entityAttributes.environment, environment)
        )
      )
      .orderBy(entityAttributes.orderIndex);
    
    res.json(attributes);
  } catch (error) {
    console.error('Error fetching entity attributes:', error);
    res.status(500).json({ error: 'Failed to fetch entity attributes' });
  }
});

// Get a specific attribute
router.get('/entity-attributes/:entityName/:attributeId', async (req, res) => {
  try {
    const { attributeId } = req.params;
    const attribute = await storage.getEntityAttribute(parseInt(attributeId));
    
    if (!attribute) {
      return res.status(404).json({ error: 'Entity attribute not found' });
    }
    
    res.json(attribute);
  } catch (error) {
    console.error('Error fetching entity attribute:', error);
    res.status(500).json({ error: 'Failed to fetch entity attribute' });
  }
});

// Create a new attribute
router.post('/entity-attributes/:entityName', async (req, res) => {
  try {
    const { entityName } = req.params;
    const environment = getEnvironmentFromRequest(req);
    
    // First, get the entity definition
    const [definition] = await db.select()
      .from(entityDefinitions)
      .where(
        and(
          eq(entityDefinitions.name, entityName),
          eq(entityDefinitions.environment, environment)
        )
      );
    
    if (!definition) {
      return res.status(404).json({ error: 'Entity definition not found' });
    }
    
    // Get the highest order index
    const [maxOrder] = await db.select({ 
      maxIdx: db.fn.max(entityAttributes.orderIndex)
    })
    .from(entityAttributes)
    .where(
      and(
        eq(entityAttributes.entityDefinitionId, definition.id),
        eq(entityAttributes.environment, environment)
      )
    );
    
    const nextOrderIndex = (maxOrder?.maxIdx || 0) + 1;
    
    // Create the attribute
    const attribute = await storage.createEntityAttribute({
      ...req.body,
      entityDefinitionId: definition.id,
      orderIndex: nextOrderIndex,
      environment
    });
    
    res.status(201).json(attribute);
  } catch (error) {
    console.error('Error creating entity attribute:', error);
    res.status(500).json({ error: 'Failed to create entity attribute' });
  }
});

// Get relationship attributes
router.get('/relationship-attributes', async (req, res) => {
  try {
    const environment = getEnvironmentFromRequest(req);
    
    const relationships = await storage.getRelationshipAttributes(environment);
    
    // Enrich the relationships with entity and attribute names
    const enrichedRelationships = await Promise.all(relationships.map(async (rel) => {
      const sourceEntity = await storage.getEntityDefinition(rel.sourceEntityId);
      const targetEntity = await storage.getEntityDefinition(rel.targetEntityId);
      const sourceAttribute = await storage.getEntityAttribute(rel.sourceAttributeId);
      const targetAttribute = await storage.getEntityAttribute(rel.targetAttributeId);
      
      return {
        ...rel,
        sourceEntityName: sourceEntity?.name,
        sourceEntityDisplayName: sourceEntity?.displayName,
        targetEntityName: targetEntity?.name,
        targetEntityDisplayName: targetEntity?.displayName,
        sourceAttributeName: sourceAttribute?.name,
        sourceAttributeDisplayName: sourceAttribute?.displayName,
        targetAttributeName: targetAttribute?.name,
        targetAttributeDisplayName: targetAttribute?.displayName
      };
    }));
    
    res.json(enrichedRelationships);
  } catch (error) {
    console.error('Error fetching relationship attributes:', error);
    res.status(500).json({ error: 'Failed to fetch relationship attributes' });
  }
});

// Create a relationship between entities
router.post('/relationship-attributes', async (req, res) => {
  try {
    const {
      sourceEntity,
      targetEntity,
      sourceAttributeName,
      sourceAttributeDisplayName,
      targetAttributeName,
      targetAttributeDisplayName,
      relationshipType,
      isRequired
    } = req.body;
    
    const environment = getEnvironmentFromRequest(req);
    
    // Get entity definitions
    const [sourceEntityDef] = await db.select()
      .from(entityDefinitions)
      .where(
        and(
          eq(entityDefinitions.name, sourceEntity),
          eq(entityDefinitions.environment, environment)
        )
      );
      
    const [targetEntityDef] = await db.select()
      .from(entityDefinitions)
      .where(
        and(
          eq(entityDefinitions.name, targetEntity),
          eq(entityDefinitions.environment, environment)
        )
      );
    
    if (!sourceEntityDef || !targetEntityDef) {
      return res.status(404).json({ error: 'Entity definition not found' });
    }
    
    // Create attributes for both entities
    const sourceAttribute = await storage.createEntityAttribute({
      entityDefinitionId: sourceEntityDef.id,
      name: sourceAttributeName || targetEntity,
      displayName: sourceAttributeDisplayName || targetEntityDef.displayName,
      description: `Related ${targetEntityDef.displayName}`,
      type: 'relationship',
      isRequired,
      isSystemAttribute: false,
      orderIndex: 100, // A high number to put relationships at the end
      environment
    });
    
    const targetAttribute = await storage.createEntityAttribute({
      entityDefinitionId: targetEntityDef.id,
      name: targetAttributeName || sourceEntity,
      displayName: targetAttributeDisplayName || sourceEntityDef.displayName,
      description: `Related ${sourceEntityDef.displayName}`,
      type: 'relationship',
      isRequired: false, // Target side is usually not required
      isSystemAttribute: false,
      orderIndex: 100, // A high number to put relationships at the end
      environment
    });
    
    // Create the relationship
    const relationship = await storage.createRelationshipAttribute({
      sourceEntityId: sourceEntityDef.id,
      targetEntityId: targetEntityDef.id,
      sourceAttributeId: sourceAttribute.id,
      targetAttributeId: targetAttribute.id,
      relationshipType,
      environment
    });
    
    res.status(201).json({
      ...relationship,
      sourceEntityName: sourceEntityDef.name,
      sourceEntityDisplayName: sourceEntityDef.displayName,
      targetEntityName: targetEntityDef.name,
      targetEntityDisplayName: targetEntityDef.displayName,
      sourceAttributeName: sourceAttribute.name,
      sourceAttributeDisplayName: sourceAttribute.displayName,
      targetAttributeName: targetAttribute.name,
      targetAttributeDisplayName: targetAttribute.displayName
    });
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).json({ error: 'Failed to create relationship' });
  }
});

export default router;