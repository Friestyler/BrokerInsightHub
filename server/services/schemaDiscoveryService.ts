import { Pool } from '@neondatabase/serverless';
import { getEnvironmentPool } from '../db';

export interface EntityAttribute {
  name: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string | null;
  maxLength: number | null;
  isArray: boolean;
}

export interface EntitySchema {
  entityType: string;
  tableName: string;
  attributes: EntityAttribute[];
}

/**
 * Discovers all entities and their attributes for a given environment
 */
export async function discoverEntitySchemas(environmentId: string): Promise<EntitySchema[]> {
  const pool = getEnvironmentPool(environmentId);
  
  // Define the core entities we support for uploads
  const supportedEntities = [
    'opportunities',
    'partners', 
    'customers',
    'vendors',
    'products',
    'users',
    'contacts'
  ];

  const schemas: EntitySchema[] = [];

  for (const tableName of supportedEntities) {
    try {
      const attributes = await getTableAttributes(pool, environmentId, tableName);
      if (attributes.length > 0) {
        schemas.push({
          entityType: tableName,
          tableName,
          attributes
        });
      }
    } catch (error) {
      console.warn(`Failed to discover schema for ${tableName} in ${environmentId}:`, error);
    }
  }

  return schemas;
}

/**
 * Gets detailed attribute information for a specific table
 */
async function getTableAttributes(pool: Pool, schemaName: string, tableName: string): Promise<EntityAttribute[]> {
  const query = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length,
      CASE 
        WHEN data_type = 'ARRAY' THEN true
        WHEN data_type LIKE '%[]' THEN true
        ELSE false
      END as is_array
    FROM information_schema.columns 
    WHERE table_schema = $1 AND table_name = $2
    ORDER BY ordinal_position;
  `;

  const result = await pool.query(query, [schemaName, tableName]);
  
  return result.rows.map(row => ({
    name: row.column_name,
    dataType: mapPostgresTypeToGeneric(row.data_type),
    isNullable: row.is_nullable === 'YES',
    defaultValue: row.column_default,
    maxLength: row.character_maximum_length,
    isArray: row.is_array
  }));
}

/**
 * Maps PostgreSQL data types to generic types for validation
 */
function mapPostgresTypeToGeneric(pgType: string): string {
  const typeMap: Record<string, string> = {
    'integer': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'serial': 'number',
    'bigserial': 'number',
    'numeric': 'number',
    'decimal': 'number',
    'real': 'number',
    'double precision': 'number',
    'text': 'text',
    'varchar': 'text',
    'character varying': 'text',
    'char': 'text',
    'character': 'text',
    'boolean': 'boolean',
    'timestamp': 'timestamp',
    'timestamptz': 'timestamp',
    'timestamp with time zone': 'timestamp',
    'timestamp without time zone': 'timestamp',
    'date': 'date',
    'time': 'time',
    'json': 'json',
    'jsonb': 'json',
    'uuid': 'text',
    'ARRAY': 'array'
  };

  // Handle array types
  if (pgType.endsWith('[]')) {
    const baseType = pgType.slice(0, -2);
    return typeMap[baseType] || 'text';
  }

  return typeMap[pgType] || 'text';
}

/**
 * Gets the current upload settings for an entity in an environment
 */
export async function getUploadSettings(environmentId: string, entityType: string): Promise<Record<string, boolean>> {
  const pool = getEnvironmentPool(environmentId);
  
  try {
    const query = `
      SELECT attribute_name, is_mandatory 
      FROM upload_settings 
      WHERE environment_id = $1 AND entity_type = $2
    `;
    
    const result = await pool.query(query, [environmentId, entityType]);
    
    const settings: Record<string, boolean> = {};
    result.rows.forEach(row => {
      settings[row.attribute_name] = row.is_mandatory;
    });
    
    return settings;
  } catch (error) {
    console.warn(`Failed to get upload settings for ${entityType} in ${environmentId}:`, error);
    return {};
  }
}

/**
 * Updates upload settings for an entity attribute
 */
export async function updateUploadSetting(
  environmentId: string, 
  entityType: string, 
  attributeName: string, 
  isMandatory: boolean,
  dataType?: string
): Promise<void> {
  const pool = getEnvironmentPool(environmentId);
  
  const query = `
    INSERT INTO upload_settings (environment_id, entity_type, attribute_name, is_mandatory, data_type)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (environment_id, entity_type, attribute_name) 
    DO UPDATE SET 
      is_mandatory = EXCLUDED.is_mandatory,
      data_type = EXCLUDED.data_type,
      updated_at = CURRENT_TIMESTAMP
  `;
  
  await pool.query(query, [environmentId, entityType, attributeName, isMandatory, dataType]);
}

/**
 * Gets available environments
 */
export function getAvailableEnvironments(): string[] {
  return ['degoudse', 'acme', 'myqollabi'];
}

/**
 * Validates if an entity type is supported
 */
export function isSupportedEntityType(entityType: string): boolean {
  const supportedTypes = [
    'opportunities',
    'partners', 
    'customers',
    'vendors',
    'products',
    'users',
    'contacts'
  ];
  
  return supportedTypes.includes(entityType);
}