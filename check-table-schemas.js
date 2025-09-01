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

async function checkTableSchemas() {
  try {
    console.log('🔍 Checking table schemas...');

    // Check users_profiles table schema
    const profilesResult = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name = 'users_profiles';
    `);

    console.log('users_profiles table found in schemas:');
    profilesResult.rows.forEach(row => {
      console.log(`   - ${row.table_schema}.${row.table_name}`);
    });

    // Check columns in auth.users
    console.log('\n🔍 Checking auth.users columns...');
    const authUsers = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'auth' AND table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('Columns in auth.users:');
    authUsers.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Check columns in public.users_profiles
    console.log('\n🔍 Checking public.users_profiles columns...');
    const profilesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users_profiles'
      ORDER BY ordinal_position;
    `);

    console.log('Columns in public.users_profiles:');
    profilesColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableSchemas();
