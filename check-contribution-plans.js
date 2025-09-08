// check-contribution-plans.js - Check existing contribution plans in the database
const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function checkContributionPlans() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // First, check if contribution_plans table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contribution_plans'
      );
    `;
    
    const tableExists = await client.query(tableExistsQuery);
    console.log('🔍 contribution_plans table exists:', tableExists.rows[0].exists);

    if (tableExists.rows[0].exists) {
      // Get table structure
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'contribution_plans'
        ORDER BY ordinal_position;
      `;
      
      const structure = await client.query(structureQuery);
      console.log('\n📋 Table Structure:');
      console.log('===================');
      structure.rows.forEach(row => {
        console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });

      // Get all existing plans
      const plansQuery = `
        SELECT * FROM contribution_plans ORDER BY daily_amount ASC;
      `;
      
      const plans = await client.query(plansQuery);
      console.log('\n💰 Existing Contribution Plans:');
      console.log('================================');
      
      if (plans.rows.length === 0) {
        console.log('❌ No plans found in the database');
      } else {
        plans.rows.forEach((plan, index) => {
          console.log(`\n${index + 1}. Plan ID: ${plan.id}`);
          console.log(`   Name: ${plan.plan_name}`);
          console.log(`   Daily Amount: ₦${plan.daily_amount ? plan.daily_amount.toLocaleString() : 'N/A'}`);
          console.log(`   Registration Fee: ₦${plan.registration_fee ? plan.registration_fee.toLocaleString() : 'N/A'}`);
          console.log(`   Duration: ${plan.duration_days} days`);
          console.log(`   Total Contribution: ₦${plan.total_contribution ? plan.total_contribution.toLocaleString() : 'N/A'}`);
          console.log(`   Settlement Amount: ₦${plan.settlement_amount ? plan.settlement_amount.toLocaleString() : 'N/A'}`);
          console.log(`   Status: ${plan.status || 'N/A'}`);
          console.log(`   Created: ${plan.created_at || 'N/A'}`);
        });
      }

      // Count plans by category
      const countQuery = `
        SELECT 
          CASE 
            WHEN plan_name ILIKE '%standard%' THEN 'Standard'
            WHEN plan_name ILIKE '%mega%' THEN 'Mega'
            WHEN plan_name ILIKE '%medium%' THEN 'Medium'
            WHEN plan_name ILIKE '%least%' THEN 'Least'
            ELSE 'Other'
          END as category,
          COUNT(*) as count
        FROM contribution_plans 
        GROUP BY category;
      `;
      
      const counts = await client.query(countQuery);
      console.log('\n📊 Plans by Category:');
      console.log('=====================');
      counts.rows.forEach(row => {
        console.log(`${row.category}: ${row.count} plans`);
      });

    } else {
      console.log('\n❌ contribution_plans table does not exist');
      
      // Check what tables do exist
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      const tables = await client.query(tablesQuery);
      console.log('\n📋 Available Tables:');
      console.log('====================');
      tables.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking contribution plans:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkContributionPlans().catch(console.error);
