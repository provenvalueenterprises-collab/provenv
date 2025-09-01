// Inspect database table structure
// Run with: npx ts-node inspect-db.js

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function inspectDatabase() {
  console.log('🔍 Inspecting Database Structure...\n');

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
  });

  try {
    // Get all tables
    console.log('1️⃣ Getting all tables...');
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check if users_profiles table exists
    const hasUsersProfiles = tablesResult.rows.some(row => row.table_name === 'users_profiles');
    console.log(`\n✅ users_profiles table exists: ${hasUsersProfiles}`);

    if (hasUsersProfiles) {
      // Get columns for users_profiles table
      console.log('\n2️⃣ Inspecting users_profiles table structure...');
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users_profiles'
        ORDER BY ordinal_position;
      `);

      console.log('📋 Columns in users_profiles:');
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });

      // Try to get a sample row
      console.log('\n3️⃣ Getting sample data...');
      const sampleResult = await pool.query(`
        SELECT * FROM users_profiles LIMIT 1;
      `);

      if (sampleResult.rows.length > 0) {
        console.log('📊 Sample row:');
        console.log(JSON.stringify(sampleResult.rows[0], null, 2));
      } else {
        console.log('📊 No data in users_profiles table');
      }
    }

  } catch (error) {
    console.error('❌ Database inspection failed:', error);
  } finally {
    await pool.end();
  }
}

inspectDatabase().catch(console.error);
