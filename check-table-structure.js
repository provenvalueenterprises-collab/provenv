// Script to check the actual structure of users_profiles table
const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function checkTableStructure() {
  console.log('🔍 Checking users_profiles table structure...');

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get all columns in users_profiles table
    const result = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'users_profiles' 
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    console.log('📊 users_profiles table columns:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
    });

    // Also check what data currently exists
    const dataCheck = await client.query('SELECT * FROM public.users_profiles LIMIT 3');
    console.log(`\n📋 Current data (${dataCheck.rows.length} rows):`);
    dataCheck.rows.forEach((row, index) => {
      console.log(`   Row ${index + 1}:`, Object.keys(row));
    });

  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

checkTableStructure();
