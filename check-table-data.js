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

async function checkTableData() {
  try {
    console.log('🔍 Checking data in profile tables...');

    // Check user_profiles (singular)
    const singularResult = await pool.query('SELECT COUNT(*) as count FROM public.user_profiles;');
    console.log(`public.user_profiles has ${singularResult.rows[0].count} rows`);

    // Check users_profiles (plural)
    const pluralResult = await pool.query('SELECT COUNT(*) as count FROM public.users_profiles;');
    console.log(`public.users_profiles has ${pluralResult.rows[0].count} rows`);

    // Check columns in both tables
    console.log('\n🔍 Columns in public.user_profiles:');
    const singularColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_profiles'
      ORDER BY ordinal_position;
    `);
    singularColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n🔍 Columns in public.users_profiles:');
    const pluralColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users_profiles'
      ORDER BY ordinal_position;
    `);
    pluralColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableData();
