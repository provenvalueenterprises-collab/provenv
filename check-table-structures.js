const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function checkTableStructures() {
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
    
    console.log('🔍 CHECKING TABLE STRUCTURES FOR MY-THRIFTS API');
    console.log('='.repeat(60));
    
    // Check thrift_accounts table structure
    const thriftColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'thrift_accounts' 
      ORDER BY ordinal_position
    `);
    console.log('\n📊 THRIFT_ACCOUNTS table columns:');
    thriftColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check contribution_plans table structure  
    const planColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'contribution_plans' 
      ORDER BY ordinal_position
    `);
    console.log('\n📋 CONTRIBUTION_PLANS table columns:');
    planColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check users_profiles table structure
    const userColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users_profiles' 
      ORDER BY ordinal_position
    `);
    console.log('\n👤 USERS_PROFILES table columns:');
    userColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check daily_contributions table structure
    const dailyColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'daily_contributions' 
      ORDER BY ordinal_position
    `);
    console.log('\n📅 DAILY_CONTRIBUTIONS table columns:');
    dailyColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Table structure analysis complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTableStructures();
