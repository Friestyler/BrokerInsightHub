import { getEnvironmentDb } from './db';
import { sql } from 'drizzle-orm';

/**
 * Quick schema copy from My Qollabi to De Goudse environment
 * This ensures both environments have identical table structures
 */

export async function copySchemaFromMyQollabi(): Promise<void> {
  console.log('🔄 Copying schema from My Qollabi to De Goudse...');
  
  const myqollabiDb = getEnvironmentDb('myqollabi');
  const degoudseDb = getEnvironmentDb('degoudse');

  try {
    // Get the exact CREATE TABLE statements from My Qollabi environment
    const createStatements = [
      // Partners table - copy exact structure
      `CREATE TABLE IF NOT EXISTS partners AS (SELECT * FROM myqollabi.partners WHERE false)`,
      
      // Customers table - copy exact structure  
      `CREATE TABLE IF NOT EXISTS customers AS (SELECT * FROM myqollabi.customers WHERE false)`,
      
      // Opportunities table - copy exact structure
      `CREATE TABLE IF NOT EXISTS opportunities AS (SELECT * FROM myqollabi.opportunities WHERE false)`,
      
      // Products table - copy exact structure
      `CREATE TABLE IF NOT EXISTS products AS (SELECT * FROM myqollabi.products WHERE false)`,
      
      // OKR related tables
      `CREATE TABLE IF NOT EXISTS okr_tags AS (SELECT * FROM myqollabi.okr_tags WHERE false)`,
      `CREATE TABLE IF NOT EXISTS okr_metrics AS (SELECT * FROM myqollabi.okr_metrics WHERE false)`,
      
      // Views and lists
      `CREATE TABLE IF NOT EXISTS saved_views AS (SELECT * FROM myqollabi.saved_views WHERE false)`,
      `CREATE TABLE IF NOT EXISTS saved_lists AS (SELECT * FROM myqollabi.saved_lists WHERE false)`,
      
      // Template assignments
      `CREATE TABLE IF NOT EXISTS template_assignments AS (SELECT * FROM myqollabi.template_assignments WHERE false)`,
    ];

    for (const statement of createStatements) {
      try {
        await degoudseDb.execute(sql.raw(statement));
        console.log('✅ Copied table structure successfully');
      } catch (error) {
        console.log('ℹ️ Table already exists or creating fresh:', error);
      }
    }

    // Add proper sequences and constraints
    const sequenceStatements = [
      `CREATE SEQUENCE IF NOT EXISTS partners_id_seq OWNED BY partners.id`,
      `ALTER TABLE partners ALTER COLUMN id SET DEFAULT nextval('partners_id_seq')`,
      
      `CREATE SEQUENCE IF NOT EXISTS customers_id_seq OWNED BY customers.id`,
      `ALTER TABLE customers ALTER COLUMN id SET DEFAULT nextval('customers_id_seq')`,
      
      `CREATE SEQUENCE IF NOT EXISTS opportunities_id_seq OWNED BY opportunities.id`,
      `ALTER TABLE opportunities ALTER COLUMN id SET DEFAULT nextval('opportunities_id_seq')`,
      
      `CREATE SEQUENCE IF NOT EXISTS products_id_seq OWNED BY products.id`,
      `ALTER TABLE products ALTER COLUMN id SET DEFAULT nextval('products_id_seq')`,
    ];

    for (const statement of sequenceStatements) {
      try {
        await degoudseDb.execute(sql.raw(statement));
      } catch (error) {
        // Sequences may already exist
        console.log('ℹ️ Sequence handling:', error);
      }
    }

    console.log('🎉 Schema copy completed successfully');
  } catch (error) {
    console.error('❌ Schema copy failed:', error);
    throw error;
  }
}