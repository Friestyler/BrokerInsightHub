import { db } from './db';
import { entityDefinitions, entityAttributes, relationshipAttributes } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Creates standard entity definitions for all environments
 */
export async function seedEntityDefinitions() {
  const environments = ['myqollabi', 'acme', 'globex', 'oceanic'];
  
  // Standard entity types across all environments
  const standardEntities = [
    {
      name: 'customer',
      displayName: 'Customer',
      description: 'A client organization that purchases products or services',
      tableName: 'customers',
    },
    {
      name: 'partner',
      displayName: 'Partner',
      description: 'A business partner organization that provides complementary services',
      tableName: 'partners',
    },
    {
      name: 'opportunity',
      displayName: 'Opportunity',
      description: 'A potential sale or deal being pursued',
      tableName: 'opportunities',
    },
    {
      name: 'project',
      displayName: 'Project',
      description: 'An implementation or delivery initiative',
      tableName: 'projects',
    },
    {
      name: 'contact',
      displayName: 'Contact',
      description: 'An individual affiliated with a customer or partner',
      tableName: 'contacts',
    }
  ];
  
  console.log('Seeding entity definitions for environments:', environments);
  
  // For each environment, create the standard entities
  for (const environment of environments) {
    for (const entity of standardEntities) {
      // Check if entity definition already exists
      const existing = await db.select({ id: entityDefinitions.id })
        .from(entityDefinitions)
        .where(
          eq(entityDefinitions.name, entity.name) &&
          eq(entityDefinitions.environment, environment)
        );
      
      if (existing.length === 0) {
        await db.insert(entityDefinitions).values({
          ...entity,
          environment,
        });
        console.log(`Created entity definition ${entity.name} for ${environment}`);
      } else {
        console.log(`Entity definition ${entity.name} already exists for ${environment}`);
      }
    }
  }
  
  console.log('Entity definitions created successfully');
}

/**
 * Creates standard attributes for entity definitions
 */
export async function seedStandardAttributes() {
  const environments = ['myqollabi', 'acme', 'globex', 'oceanic'];
  
  console.log('Seeding standard attributes for all environments');
  
  for (const environment of environments) {
    // Get all entity definitions for this environment
    const entitiesResult = await db.select()
      .from(entityDefinitions)
      .where(eq(entityDefinitions.environment, environment));
    
    for (const entity of entitiesResult) {
      const standardAttributes = getStandardAttributesForEntity(entity.name);
      
      // Add standard attributes for this entity
      for (let i = 0; i < standardAttributes.length; i++) {
        const attribute = standardAttributes[i];
        
        // Check if attribute already exists
        const existing = await db.select({ id: entityAttributes.id })
          .from(entityAttributes)
          .where(
            eq(entityAttributes.entityDefinitionId, entity.id) &&
            eq(entityAttributes.name, attribute.name)
          );
        
        if (existing.length === 0) {
          await db.insert(entityAttributes).values({
            entityDefinitionId: entity.id,
            name: attribute.name,
            displayName: attribute.displayName,
            description: attribute.description,
            type: attribute.type,
            isRequired: attribute.isRequired ?? false,
            isSystemAttribute: true, // Mark as system attribute
            defaultValue: attribute.defaultValue,
            options: attribute.options,
            orderIndex: i + 1,
            environment,
          });
          console.log(`Created standard attribute ${attribute.name} for ${entity.name} in ${environment}`);
        } else {
          console.log(`Standard attribute ${attribute.name} already exists for ${entity.name} in ${environment}`);
        }
      }
    }
  }
  
  console.log('Standard attributes created successfully');
}

/**
 * Creates standard relationship attributes between entities
 */
export async function seedRelationshipAttributes() {
  const environments = ['myqollabi', 'acme', 'globex', 'oceanic'];
  
  // Standard relationships between entities
  const standardRelationships = [
    {
      sourceEntityName: 'customer',
      targetEntityName: 'partner',
      sourceAttributeName: 'partners',
      targetAttributeName: 'customers',
      relationshipType: 'many_to_many' as const,
    },
    {
      sourceEntityName: 'opportunity',
      targetEntityName: 'customer',
      sourceAttributeName: 'customers',
      targetAttributeName: 'opportunities',
      relationshipType: 'many_to_many' as const,
    },
    {
      sourceEntityName: 'opportunity',
      targetEntityName: 'partner',
      sourceAttributeName: 'partners',
      targetAttributeName: 'opportunities',
      relationshipType: 'many_to_many' as const,
    },
    {
      sourceEntityName: 'project',
      targetEntityName: 'customer',
      sourceAttributeName: 'customers',
      targetAttributeName: 'projects',
      relationshipType: 'many_to_many' as const,
    },
    {
      sourceEntityName: 'project',
      targetEntityName: 'partner',
      sourceAttributeName: 'partners',
      targetAttributeName: 'projects',
      relationshipType: 'many_to_many' as const,
    },
    {
      sourceEntityName: 'contact',
      targetEntityName: 'customer',
      sourceAttributeName: 'customers',
      targetAttributeName: 'contacts',
      relationshipType: 'many_to_many' as const,
    },
  ];
  
  console.log('Seeding relationship attributes for all environments');
  
  for (const environment of environments) {
    // For each standard relationship
    for (const relationship of standardRelationships) {
      // Get the entity definitions
      const sourceEntity = await db.select()
        .from(entityDefinitions)
        .where(
          eq(entityDefinitions.name, relationship.sourceEntityName) &&
          eq(entityDefinitions.environment, environment)
        );
      
      const targetEntity = await db.select()
        .from(entityDefinitions)
        .where(
          eq(entityDefinitions.name, relationship.targetEntityName) &&
          eq(entityDefinitions.environment, environment)
        );
      
      if (sourceEntity.length === 0 || targetEntity.length === 0) {
        console.log(`Cannot create relationship: entities not found for ${relationship.sourceEntityName} or ${relationship.targetEntityName} in ${environment}`);
        continue;
      }
      
      const sourceEntityId = sourceEntity[0].id;
      const targetEntityId = targetEntity[0].id;
      
      // Check if source attribute exists
      let sourceAttribute = await db.select()
        .from(entityAttributes)
        .where(
          eq(entityAttributes.entityDefinitionId, sourceEntityId) &&
          eq(entityAttributes.name, relationship.sourceAttributeName)
        );
      
      // Create source attribute if it doesn't exist
      let sourceAttributeId: number;
      if (sourceAttribute.length === 0) {
        const [newSourceAttr] = await db.insert(entityAttributes).values({
          entityDefinitionId: sourceEntityId,
          name: relationship.sourceAttributeName,
          displayName: capitalize(relationship.targetAttributeName),
          description: `Related ${targetEntity[0].displayName}`,
          type: 'relationship',
          isRequired: false,
          isSystemAttribute: true,
          orderIndex: 100, // Place at the end
          environment,
        }).returning();
        
        sourceAttributeId = newSourceAttr.id;
        console.log(`Created source attribute ${relationship.sourceAttributeName} for ${relationship.sourceEntityName} in ${environment}`);
      } else {
        sourceAttributeId = sourceAttribute[0].id;
        console.log(`Source attribute ${relationship.sourceAttributeName} already exists for ${relationship.sourceEntityName} in ${environment}`);
      }
      
      // Check if target attribute exists
      let targetAttribute = await db.select()
        .from(entityAttributes)
        .where(
          eq(entityAttributes.entityDefinitionId, targetEntityId) &&
          eq(entityAttributes.name, relationship.targetAttributeName)
        );
      
      // Create target attribute if it doesn't exist
      let targetAttributeId: number;
      if (targetAttribute.length === 0) {
        const [newTargetAttr] = await db.insert(entityAttributes).values({
          entityDefinitionId: targetEntityId,
          name: relationship.targetAttributeName,
          displayName: capitalize(relationship.sourceAttributeName),
          description: `Related ${sourceEntity[0].displayName}`,
          type: 'relationship',
          isRequired: false,
          isSystemAttribute: true,
          orderIndex: 100, // Place at the end
          environment,
        }).returning();
        
        targetAttributeId = newTargetAttr.id;
        console.log(`Created target attribute ${relationship.targetAttributeName} for ${relationship.targetEntityName} in ${environment}`);
      } else {
        targetAttributeId = targetAttribute[0].id;
        console.log(`Target attribute ${relationship.targetAttributeName} already exists for ${relationship.targetEntityName} in ${environment}`);
      }
      
      // Check if relationship already exists
      const existingRelationship = await db.select()
        .from(relationshipAttributes)
        .where(
          eq(relationshipAttributes.sourceEntityId, sourceEntityId) &&
          eq(relationshipAttributes.targetEntityId, targetEntityId) &&
          eq(relationshipAttributes.sourceAttributeId, sourceAttributeId) &&
          eq(relationshipAttributes.targetAttributeId, targetAttributeId) &&
          eq(relationshipAttributes.environment, environment)
        );
      
      if (existingRelationship.length === 0) {
        await db.insert(relationshipAttributes).values({
          sourceEntityId,
          targetEntityId,
          sourceAttributeId,
          targetAttributeId,
          relationshipType: relationship.relationshipType,
          environment,
        });
        console.log(`Created relationship between ${relationship.sourceEntityName} and ${relationship.targetEntityName} in ${environment}`);
      } else {
        console.log(`Relationship between ${relationship.sourceEntityName} and ${relationship.targetEntityName} already exists in ${environment}`);
      }
    }
  }
  
  console.log('Relationship attributes created successfully');
}

/**
 * Returns standard attributes for a given entity type
 */
function getStandardAttributesForEntity(entityType: string): Array<{
  name: string;
  displayName: string;
  description: string;
  type: string;
  isRequired?: boolean;
  defaultValue?: string;
  options?: any;
}> {
  // Common attributes for all entity types
  const commonAttributes = [
    {
      name: 'name',
      displayName: 'Name',
      description: 'The name of the entity',
      type: 'text',
      isRequired: true,
    },
    {
      name: 'description',
      displayName: 'Description',
      description: 'A detailed description',
      type: 'long_text',
    },
    {
      name: 'owner',
      displayName: 'Owner',
      description: 'The user who owns this entity',
      type: 'user_single',
    },
    {
      name: 'status',
      displayName: 'Status',
      description: 'Current status',
      type: 'single_select',
      options: ['Active', 'Inactive', 'Archived'],
      defaultValue: 'Active',
    },
    {
      name: 'created_date',
      displayName: 'Created Date',
      description: 'When this entity was created',
      type: 'datetime',
    },
    {
      name: 'last_modified_date',
      displayName: 'Last Modified Date',
      description: 'When this entity was last modified',
      type: 'datetime',
    },
  ];
  
  // Entity-specific attributes
  switch (entityType) {
    case 'customer':
      return [
        ...commonAttributes,
        {
          name: 'industry',
          displayName: 'Industry',
          description: 'The industry this customer belongs to',
          type: 'single_select',
          options: ['Insurance', 'Banking', 'Healthcare', 'Manufacturing', 'Retail', 'Technology', 'Other'],
        },
        {
          name: 'annual_revenue',
          displayName: 'Annual Revenue',
          description: 'Estimated annual revenue',
          type: 'currency',
        },
        {
          name: 'employees',
          displayName: 'Number of Employees',
          description: 'Approximate number of employees',
          type: 'number',
        },
        {
          name: 'website',
          displayName: 'Website',
          description: 'Company website URL',
          type: 'text',
        },
      ];
    
    case 'partner':
      return [
        ...commonAttributes,
        {
          name: 'partner_type',
          displayName: 'Partner Type',
          description: 'Type of partnership',
          type: 'single_select',
          options: ['Reseller', 'Service Provider', 'Technology Partner', 'Alliance', 'Other'],
        },
        {
          name: 'territory',
          displayName: 'Territory',
          description: 'Geographical coverage area',
          type: 'text',
        },
        {
          name: 'partnership_level',
          displayName: 'Partnership Level',
          description: 'Level of partnership',
          type: 'single_select',
          options: ['Platinum', 'Gold', 'Silver', 'Bronze'],
        },
      ];
    
    case 'opportunity':
      return [
        ...commonAttributes,
        {
          name: 'amount',
          displayName: 'Opportunity Amount',
          description: 'Potential value of the opportunity',
          type: 'currency',
        },
        {
          name: 'stage',
          displayName: 'Stage',
          description: 'Current sales stage',
          type: 'single_select',
          options: ['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Negotiation', 'Closed Won', 'Closed Lost'],
          defaultValue: 'Prospecting',
        },
        {
          name: 'probability',
          displayName: 'Probability',
          description: 'Likelihood of closing (%)',
          type: 'percent',
        },
        {
          name: 'close_date',
          displayName: 'Expected Close Date',
          description: 'When the opportunity is expected to close',
          type: 'date',
        },
      ];
    
    case 'project':
      return [
        ...commonAttributes,
        {
          name: 'start_date',
          displayName: 'Start Date',
          description: 'Project start date',
          type: 'date',
        },
        {
          name: 'end_date',
          displayName: 'End Date',
          description: 'Project end date',
          type: 'date',
        },
        {
          name: 'budget',
          displayName: 'Budget',
          description: 'Project budget',
          type: 'currency',
        },
        {
          name: 'project_type',
          displayName: 'Project Type',
          description: 'Type of project',
          type: 'single_select',
          options: ['Implementation', 'Integration', 'Consulting', 'Support', 'Other'],
        },
      ];
    
    case 'contact':
      return [
        ...commonAttributes,
        {
          name: 'email',
          displayName: 'Email',
          description: 'Email address',
          type: 'text',
        },
        {
          name: 'phone',
          displayName: 'Phone',
          description: 'Phone number',
          type: 'text',
        },
        {
          name: 'title',
          displayName: 'Job Title',
          description: 'Professional title',
          type: 'text',
        },
        {
          name: 'department',
          displayName: 'Department',
          description: 'Department or function',
          type: 'text',
        },
      ];
    
    default:
      return commonAttributes;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Seeds all entity-related data
 */
export async function seedEntitySystem() {
  try {
    await seedEntityDefinitions();
    await seedStandardAttributes();
    await seedRelationshipAttributes();
    console.log('Entity system seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding entity system:', error);
    return false;
  }
}