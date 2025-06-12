import { Pool } from '@neondatabase/serverless';
import { getEnvironmentPool } from '../db';
import { 
  InsertUploadSetting, 
  InsertTransformationScript, 
  InsertUploadTemplate,
  UploadSetting,
  TransformationScript,
  UploadTemplate
} from '@shared/schema';

/**
 * Upload Settings Service
 * Manages upload configuration, transformation scripts, and templates
 */

export class UploadSettingsService {
  
  /**
   * Get all upload settings for an entity in an environment
   */
  static async getUploadSettings(environmentId: string, entityType: string): Promise<UploadSetting[]> {
    const pool = getEnvironmentPool(environmentId);
    
    const query = `
      SELECT * FROM upload_settings 
      WHERE environment_id = $1 AND entity_type = $2
      ORDER BY attribute_name
    `;
    
    const result = await pool.query(query, [environmentId, entityType]);
    return result.rows;
  }

  /**
   * Update upload settings for an entity
   */
  static async updateUploadSettings(
    environmentId: string, 
    entityType: string, 
    settings: Array<{ attributeName: string; isMandatory: boolean; dataType?: string }>
  ): Promise<void> {
    const pool = getEnvironmentPool(environmentId);
    
    // Begin transaction
    await pool.query('BEGIN');
    
    try {
      for (const setting of settings) {
        const query = `
          INSERT INTO upload_settings (environment_id, entity_type, attribute_name, is_mandatory, data_type)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (environment_id, entity_type, attribute_name) 
          DO UPDATE SET 
            is_mandatory = EXCLUDED.is_mandatory,
            data_type = EXCLUDED.data_type,
            updated_at = CURRENT_TIMESTAMP
        `;
        
        await pool.query(query, [
          environmentId, 
          entityType, 
          setting.attributeName, 
          setting.isMandatory,
          setting.dataType || 'text'
        ]);
      }
      
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get transformation scripts for an entity type
   */
  static async getTransformationScripts(
    environmentId: string, 
    entityType?: string
  ): Promise<TransformationScript[]> {
    const pool = getEnvironmentPool(environmentId);
    
    let query = `
      SELECT ts.*, u.username as created_by_username
      FROM transformation_scripts ts
      LEFT JOIN users u ON ts.created_by = u.id
      WHERE ts.environment_id = $1 AND ts.is_active = true
    `;
    
    const params: any[] = [environmentId];
    
    if (entityType) {
      query += ` AND ts.entity_type = $2`;
      params.push(entityType);
    }
    
    query += ` ORDER BY ts.name`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Create a new transformation script
   */
  static async createTransformationScript(script: InsertTransformationScript): Promise<TransformationScript> {
    const pool = getEnvironmentPool(script.environmentId);
    
    const query = `
      INSERT INTO transformation_scripts (
        name, description, entity_type, environment_id, 
        script_content, is_active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      script.name,
      script.description,
      script.entityType,
      script.environmentId,
      script.scriptContent,
      script.isActive ?? true,
      script.createdBy
    ]);
    
    return result.rows[0];
  }

  /**
   * Update a transformation script
   */
  static async updateTransformationScript(
    scriptId: number, 
    environmentId: string, 
    updates: Partial<InsertTransformationScript>
  ): Promise<TransformationScript> {
    const pool = getEnvironmentPool(environmentId);
    
    const setClause = [];
    const values = [];
    let paramCount = 1;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });
    
    if (setClause.length === 0) {
      throw new Error('No updates provided');
    }
    
    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(scriptId);
    
    const query = `
      UPDATE transformation_scripts 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount} AND environment_id = $${paramCount + 1}
      RETURNING *
    `;
    
    values.push(environmentId);
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Script not found');
    }
    
    return result.rows[0];
  }

  /**
   * Delete a transformation script
   */
  static async deleteTransformationScript(scriptId: number, environmentId: string): Promise<void> {
    const pool = getEnvironmentPool(environmentId);
    
    const query = `
      UPDATE transformation_scripts 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND environment_id = $2
    `;
    
    await pool.query(query, [scriptId, environmentId]);
  }

  /**
   * Get upload templates for an entity type
   */
  static async getUploadTemplates(
    environmentId: string, 
    entityType?: string,
    userId?: number
  ): Promise<UploadTemplate[]> {
    const pool = getEnvironmentPool(environmentId);
    
    let query = `
      SELECT ut.*, u.username as created_by_username
      FROM upload_templates ut
      LEFT JOIN users u ON ut.created_by = u.id
      WHERE ut.environment_id = $1
    `;
    
    const params: any[] = [environmentId];
    let paramCount = 2;
    
    if (entityType) {
      query += ` AND ut.entity_type = $${paramCount}`;
      params.push(entityType);
      paramCount++;
    }
    
    if (userId) {
      query += ` AND (ut.is_shared = true OR ut.created_by = $${paramCount})`;
      params.push(userId);
    } else {
      query += ` AND ut.is_shared = true`;
    }
    
    query += ` ORDER BY ut.name`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Create a new upload template
   */
  static async createUploadTemplate(template: InsertUploadTemplate): Promise<UploadTemplate> {
    const pool = getEnvironmentPool(template.environmentId);
    
    console.log('Creating template with data:', JSON.stringify(template, null, 2));
    
    const query = `
      INSERT INTO upload_templates (
        template_name, name, description, entity_type, environment_id, 
        template_data, column_mappings, is_shared, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const templateData = JSON.stringify(template.columnMappings);
    
    const result = await pool.query(query, [
      template.name,
      template.name,
      template.description,
      template.entityType,
      template.environmentId,
      templateData,
      templateData,
      template.isShared ?? false,
      template.createdBy
    ]);
    
    console.log('Template created successfully:', result.rows[0]);
    return result.rows[0];
  }

  /**
   * Update an upload template
   */
  static async updateUploadTemplate(
    templateId: number,
    environmentId: string,
    updates: Partial<InsertUploadTemplate>,
    userId: number
  ): Promise<UploadTemplate> {
    const pool = getEnvironmentPool(environmentId);
    
    // Check if user owns the template or it's shared
    const checkQuery = `
      SELECT * FROM upload_templates 
      WHERE id = $1 AND environment_id = $2 AND (created_by = $3 OR is_shared = true)
    `;
    
    const checkResult = await pool.query(checkQuery, [templateId, environmentId, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new Error('Template not found or access denied');
    }
    
    const setClause = [];
    const values = [];
    let paramCount = 1;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'columnMappings') {
          setClause.push(`column_mappings = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          setClause.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });
    
    if (setClause.length === 0) {
      throw new Error('No updates provided');
    }
    
    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(templateId, environmentId);
    
    const query = `
      UPDATE upload_templates 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount} AND environment_id = $${paramCount + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete an upload template
   */
  static async deleteUploadTemplate(
    templateId: number, 
    environmentId: string, 
    userId: number
  ): Promise<void> {
    const pool = getEnvironmentPool(environmentId);
    
    const query = `
      DELETE FROM upload_templates 
      WHERE id = $1 AND environment_id = $2 AND created_by = $3
    `;
    
    const result = await pool.query(query, [templateId, environmentId, userId]);
    
    if (result.rowCount === 0) {
      throw new Error('Template not found or access denied');
    }
  }

  /**
   * Validate transformation script syntax (basic validation)
   */
  static validateScriptSyntax(scriptContent: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic Python syntax checks
    if (!scriptContent.trim()) {
      errors.push('Script content cannot be empty');
    }
    
    // Check for dangerous operations
    const dangerousPatterns = [
      /import\s+os/i,
      /import\s+sys/i,
      /import\s+subprocess/i,
      /exec\s*\(/i,
      /eval\s*\(/i,
      /__import__/i,
      /open\s*\(/i,
      /file\s*\(/i
    ];
    
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(scriptContent)) {
        errors.push(`Dangerous operation detected: ${pattern.source}`);
      }
    });
    
    // Check for valid column references
    const columnRefPattern = /column_\w+/g;
    const columnRefs = scriptContent.match(columnRefPattern);
    
    if (columnRefs && columnRefs.length === 0) {
      errors.push('Script should reference at least one column (e.g., column_name)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}