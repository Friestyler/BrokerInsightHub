import { db } from './db';
import { 
  entityDefinitions, 
  entityAttributes, 
  relationshipAttributes 
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Creates standard entity definitions for all environments
 */
export async function seedEntityDefinitions() {
  console.log('Seeding entity definitions...');

  // List of environments
  const environments = ['qollabi', 'acme', 'globex', 'oceanic'];
  
  // Standard entity definitions to create
  const standardEntities = [
    {
      name: 'customers',
      displayName: 'Customers',
      description: 'Organizations that purchase your products or services',
      tableName: 'customers'
    },
    {
      name: 'partners',
      displayName: 'Partners',
      description: 'Organizations that collaborate with your business',
      tableName: 'partners'
    },
    {
      name: 'opportunities',
      displayName: 'Opportunities',
      description: 'Potential sales or deals',
      tableName: 'opportunities'
    },
    {
      name: 'projects',
      displayName: 'Projects',
      description: 'Specific initiatives or engagements',
      tableName: 'projects'
    },
    {
      name: 'contacts',
      displayName: 'Contacts',
      description: 'Individual people associated with customers or partners',
      tableName: 'contacts'
    }
  ];

  // Create entity definitions for each environment
  for (const environment of environments) {
    console.log(`Seeding entity definitions for ${environment} environment...`);
    
    for (const entity of standardEntities) {
      // Check if entity definition already exists
      const existing = await db.select()
        .from(entityDefinitions)
        .where(
          eq(entityDefinitions.name, entity.name) && 
          eq(entityDefinitions.environment, environment)
        );
      
      if (existing.length === 0) {
        // Create the entity definition
        await db.insert(entityDefinitions).values({
          ...entity,
          environment: environment,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Created entity definition: ${entity.displayName} for ${environment}`);
      } else {
        console.log(`Entity definition ${entity.displayName} already exists for ${environment}`);
      }
    }
  }
}

/**
 * Creates standard attributes for entity definitions
 */
export async function seedStandardAttributes() {
  console.log('Seeding standard attributes...');

  // List of environments
  const environments = ['qollabi', 'acme', 'globex', 'oceanic'];
  
  for (const environment of environments) {
    console.log(`Seeding standard attributes for ${environment} environment...`);
    
    // Get all entity definitions for this environment
    const definitions = await db.select()
      .from(entityDefinitions)
      .where(eq(entityDefinitions.environment, environment));
    
    for (const definition of definitions) {
      // Get standard attributes for this entity type
      const standardAttributes = getStandardAttributesForEntity(definition.name);
      
      // Create standard attributes
      for (let index = 0; index < standardAttributes.length; index++) {
        const attr = standardAttributes[index];
        // Check if attribute already exists
        const existing = await db.select()
          .from(entityAttributes)
          .where(
            eq(entityAttributes.entityDefinitionId, definition.id) && 
            eq(entityAttributes.name, attr.name) &&
            eq(entityAttributes.environment, environment)
          );
        
        if (existing.length === 0) {
          // Create the attribute
          await db.insert(entityAttributes).values({
            entityDefinitionId: definition.id,
            name: attr.name,
            displayName: attr.displayName,
            description: attr.description,
            type: attr.type as any, // Type cast to solve LSP issue
            isRequired: attr.isRequired,
            isSystemAttribute: attr.isSystemAttribute,
            defaultValue: attr.defaultValue,
            options: attr.options,
            orderIndex: index + 1,
            environment: environment,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`Created attribute: ${attr.displayName} for ${definition.displayName} in ${environment}`);
        } else {
          console.log(`Attribute ${attr.displayName} already exists for ${definition.displayName} in ${environment}`);
        }
      }
    }
  }
}

/**
 * Creates standard relationship attributes between entities
 */
export async function seedRelationshipAttributes() {
  console.log('Seeding relationship attributes...');

  // List of environments
  const environments = ['qollabi', 'acme', 'globex', 'oceanic'];
  
  // Standard relationships to create
  const standardRelationships = [
    {
      sourceEntity: 'customers',
      targetEntity: 'partners',
      sourceAttribute: 'partners',
      targetAttribute: 'customers',
      relationshipType: 'many_to_many' as const
    },
    {
      sourceEntity: 'opportunities',
      targetEntity: 'customers',
      sourceAttribute: 'customers',
      targetAttribute: 'opportunities',
      relationshipType: 'many_to_one' as const
    },
    {
      sourceEntity: 'opportunities',
      targetEntity: 'partners',
      sourceAttribute: 'partners',
      targetAttribute: 'opportunities',
      relationshipType: 'many_to_many' as const
    }
  ];

  for (const environment of environments) {
    console.log(`Seeding relationship attributes for ${environment} environment...`);
    
    for (const relationship of standardRelationships) {
      // Get entity definitions
      const sourceEntity = await db.select()
        .from(entityDefinitions)
        .where(
          eq(entityDefinitions.name, relationship.sourceEntity) && 
          eq(entityDefinitions.environment, environment)
        );
      
      const targetEntity = await db.select()
        .from(entityDefinitions)
        .where(
          eq(entityDefinitions.name, relationship.targetEntity) && 
          eq(entityDefinitions.environment, environment)
        );
      
      if (sourceEntity.length === 0 || targetEntity.length === 0) {
        console.log(`Skipping relationship: ${relationship.sourceEntity} -> ${relationship.targetEntity} (entity not found)`);
        continue;
      }
      
      // Check if source attribute exists and create if needed
      let sourceAttribute = await db.select()
        .from(entityAttributes)
        .where(
          eq(entityAttributes.entityDefinitionId, sourceEntity[0].id) && 
          eq(entityAttributes.name, relationship.sourceAttribute) &&
          eq(entityAttributes.environment, environment)
        );
      
      if (sourceAttribute.length === 0) {
        const result = await db.insert(entityAttributes).values({
          entityDefinitionId: sourceEntity[0].id,
          name: relationship.sourceAttribute,
          displayName: capitalize(relationship.sourceAttribute),
          description: `Related ${relationship.targetEntity}`,
          type: 'relationship',
          isRequired: false,
          isSystemAttribute: false,
          orderIndex: 100, // Put relationships at the end
          environment: environment,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        sourceAttribute = result;
        console.log(`Created source attribute: ${relationship.sourceAttribute} for ${relationship.sourceEntity} in ${environment}`);
      }
      
      // Check if target attribute exists and create if needed
      let targetAttribute = await db.select()
        .from(entityAttributes)
        .where(
          eq(entityAttributes.entityDefinitionId, targetEntity[0].id) && 
          eq(entityAttributes.name, relationship.targetAttribute) &&
          eq(entityAttributes.environment, environment)
        );
      
      if (targetAttribute.length === 0) {
        const result = await db.insert(entityAttributes).values({
          entityDefinitionId: targetEntity[0].id,
          name: relationship.targetAttribute,
          displayName: capitalize(relationship.targetAttribute),
          description: `Related ${relationship.sourceEntity}`,
          type: 'relationship',
          isRequired: false,
          isSystemAttribute: false,
          orderIndex: 100, // Put relationships at the end
          environment: environment,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        targetAttribute = result;
        console.log(`Created target attribute: ${relationship.targetAttribute} for ${relationship.targetEntity} in ${environment}`);
      }
      
      // Check if relationship already exists
      const existingRelationship = await db.select()
        .from(relationshipAttributes)
        .where(
          eq(relationshipAttributes.sourceEntityId, sourceEntity[0].id) && 
          eq(relationshipAttributes.targetEntityId, targetEntity[0].id) &&
          eq(relationshipAttributes.sourceAttributeId, sourceAttribute[0].id) &&
          eq(relationshipAttributes.targetAttributeId, targetAttribute[0].id) &&
          eq(relationshipAttributes.environment, environment)
        );
      
      if (existingRelationship.length === 0) {
        // Create the relationship
        await db.insert(relationshipAttributes).values({
          sourceEntityId: sourceEntity[0].id,
          targetEntityId: targetEntity[0].id,
          sourceAttributeId: sourceAttribute[0].id,
          targetAttributeId: targetAttribute[0].id,
          relationshipType: relationship.relationshipType,
          environment: environment,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Created relationship: ${relationship.sourceEntity}.${relationship.sourceAttribute} <-> ${relationship.targetEntity}.${relationship.targetAttribute} in ${environment}`);
      } else {
        console.log(`Relationship already exists: ${relationship.sourceEntity}.${relationship.sourceAttribute} <-> ${relationship.targetEntity}.${relationship.targetAttribute} in ${environment}`);
      }
    }
  }
}

/**
 * Returns standard attributes for a given entity type
 */
function getStandardAttributesForEntity(entityType: string): Array<{
  name: string;
  displayName: string;
  description: string;
  type: string;
  isRequired: boolean;
  isSystemAttribute: boolean;
  defaultValue?: string;
  options?: any;
}> {
  // Common attributes for all entities
  const commonAttributes = [
    {
      name: 'name',
      displayName: 'Name',
      description: 'The official name',
      type: 'text',
      isRequired: true,
      isSystemAttribute: true
    },
    {
      name: 'description',
      displayName: 'Description',
      description: 'A brief description',
      type: 'long_text',
      isRequired: false,
      isSystemAttribute: true
    },
    {
      name: 'owner',
      displayName: 'Owner',
      description: 'The primary user responsible for managing this entity',
      type: 'user_single',
      isRequired: false,
      isSystemAttribute: true
    },
    {
      name: 'team',
      displayName: 'Team',
      description: 'Users associated with this entity',
      type: 'user_multi',
      isRequired: true,
      isSystemAttribute: true
    }
  ];
  
  // Entity-specific attributes
  switch(entityType) {
    case 'opportunities':
      return [
        ...commonAttributes,
        {
          name: 'amount',
          displayName: 'Amount',
          description: 'The estimated total sale amount',
          type: 'currency',
          isRequired: false,
          isSystemAttribute: true
        },
        {
          name: 'stage',
          displayName: 'Stage',
          description: 'Current stage in the sales process',
          type: 'single_select',
          isRequired: false,
          isSystemAttribute: true,
          options: JSON.stringify({
            options: [
              { value: 'closed-won', label: 'Closed-Won' },
              { value: 'closed-lost', label: 'Closed-Lost' }
            ]
          })
        },
        {
          name: 'probability',
          displayName: 'Probability',
          description: 'The likelihood that opportunity will close',
          type: 'percent',
          isRequired: false,
          isSystemAttribute: true
        }
      ];
    case 'contacts':
      return [
        ...commonAttributes,
        {
          name: 'email',
          displayName: 'Email',
          description: 'Contact email address',
          type: 'text',
          isRequired: false,
          isSystemAttribute: true
        },
        {
          name: 'phone',
          displayName: 'Phone',
          description: 'Contact phone number',
          type: 'text',
          isRequired: false,
          isSystemAttribute: true
        }
      ];
    default:
      return commonAttributes;
  }
}

// Helper function to capitalize first letter
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Seeds all entity-related data
 */
export async function seedEntitySystem() {
  try {
    console.log('Seeding entity system...');
    
    // Create entity definitions first
    await seedEntityDefinitions();
    
    // Then create standard attributes
    await seedStandardAttributes();
    
    // Finally create relationships
    await seedRelationshipAttributes();
    
    console.log('Entity system seeding completed successfully');
  } catch (error) {
    console.error('Error seeding entity system:', error);
    throw error;
  }
}