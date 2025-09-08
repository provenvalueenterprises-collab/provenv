require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: true,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

async function checkContributionPlans() {
  let client;
  
  try {
    console.log('🔗 Connecting to PostgreSQL...');
    client = await pool.connect();
    console.log('✅ Connected successfully');

    // First check if contribution_plans table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contribution_plans'
      );
    `);
    
    console.log('\n📋 Table Existence Check:');
    console.log('contribution_plans table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Get table structure
      console.log('\n📊 Table Structure:');
      const structureQuery = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'contribution_plans'
        ORDER BY ordinal_position;
      `);
      
      structureQuery.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });

      // Get all data
      console.log('\n📋 All Contribution Plans:');
      const dataQuery = await client.query('SELECT * FROM contribution_plans ORDER BY id;');
      
      if (dataQuery.rows.length === 0) {
        console.log('❌ No contribution plans found in the table');
      } else {
        console.log(`✅ Found ${dataQuery.rows.length} contribution plans:`);
        dataQuery.rows.forEach((plan, index) => {
          console.log(`\n${index + 1}. Plan ID: ${plan.id}`);
          console.log(`   Plan Name: ${plan.plan_name || 'N/A'}`);
          console.log(`   Category: ${plan.category || 'N/A'}`);
          console.log(`   Daily Amount: ₦${plan.daily_amount || 'N/A'}`);
          console.log(`   Registration Fee: ₦${plan.registration_fee || 'N/A'}`);
          console.log(`   Settlement Amount: ₦${plan.settlement_amount || 'N/A'}`);
          console.log(`   Duration Days: ${plan.duration_days || 'N/A'}`);
          console.log(`   Description: ${plan.description || 'N/A'}`);
        });
      }
    } else {
      console.log('\n❌ contribution_plans table does not exist');
      
      // Check what tables exist
      console.log('\n📋 Available Tables:');
      const tablesQuery = await client.query(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename;
      `);
      
      tablesQuery.rows.forEach(table => {
        console.log(`- ${table.tablename}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log('\n👋 Connection closed');
  }
}

checkContributionPlans();
