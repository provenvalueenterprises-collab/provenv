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

async function inspectUsersTable() {
  try {
    console.log('🔍 Inspecting users table structure...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Columns in users:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? 'DEFAULT ' + row.column_default : ''}`);
    });

    console.log('\n📊 Sample data from users:');
    const sample = await pool.query('SELECT id, email, created_at FROM users LIMIT 5;');
    sample.rows.forEach(row => {
      console.log(`   - ID: ${row.id}, Email: ${row.email}, Created: ${row.created_at}`);
    });

  } catch (error) {
    console.error('❌ Error inspecting users table:', error.message);
  } finally {
    await pool.end();
  }
}

inspectUsersTable();
