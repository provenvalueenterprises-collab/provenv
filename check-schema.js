import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    console.log('🔍 Checking table schemas...');

    // Check what schemas exist
    const schemas = await pool.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema';
    `);

    console.log('Available schemas:');
    schemas.rows.forEach(row => {
      console.log(`   - ${row.schema_name}`);
    });

    // Check users table in different schemas
    for (const schema of schemas.rows) {
      const result = await pool.query(`
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_name = 'users' AND table_schema = '${schema.schema_name}';
      `);

      if (result.rows.length > 0) {
        console.log(`Users table found in schema: ${schema.schema_name}`);
      }
    }

    // Try to query the users table directly
    console.log('\n🔍 Trying direct query on users table...');
    const directQuery = await pool.query('SELECT id, email, display_name FROM users LIMIT 1;');
    console.log('Direct query successful, found', directQuery.rows.length, 'rows');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
