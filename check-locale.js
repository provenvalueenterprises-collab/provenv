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

async function checkLocaleValues() {
  try {
    console.log('🔍 Checking locale values in auth.users...');

    // Check what locale values exist
    const locales = await pool.query(`
      SELECT DISTINCT locale
      FROM auth.users
      WHERE locale IS NOT NULL
      LIMIT 10;
    `);

    console.log('Existing locale values:');
    locales.rows.forEach(row => {
      console.log(`   - '${row.locale}'`);
    });

    // Check the column default
    const defaultCheck = await pool.query(`
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'locale';
    `);

    console.log('\nLocale column default:', defaultCheck.rows[0]?.column_default);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkLocaleValues();
