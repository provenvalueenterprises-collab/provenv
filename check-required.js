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

async function checkRequiredFields() {
  try {
    console.log('🔍 Checking required fields in auth.users...');

    // Check NOT NULL columns
    const notNullColumns = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'auth' AND table_name = 'users'
      AND is_nullable = 'NO'
      ORDER BY ordinal_position;
    `);

    console.log('NOT NULL columns in auth.users:');
    notNullColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) DEFAULT: ${row.column_default || 'NONE'}`);
    });

    // Check avatar_url values
    const avatars = await pool.query(`
      SELECT DISTINCT avatar_url
      FROM auth.users
      WHERE avatar_url IS NOT NULL AND avatar_url != ''
      LIMIT 5;
    `);

    console.log('\nExisting avatar_url values:');
    avatars.rows.forEach(row => {
      console.log(`   - '${row.avatar_url}'`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRequiredFields();
