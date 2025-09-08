// Get all contribution plans from database
require('dotenv').config();
const { Client } = require('pg');

async function getAllContributionPlans() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Get all contribution plans
    console.log('\n📋 All Contribution Plans:');
    const result = await client.query(`
      SELECT * FROM contribution_plans 
      WHERE is_active = true 
      ORDER BY category, accounts_count;
    `);
    
    console.log(`✅ Found ${result.rows.length} active contribution plans:`);
    
    // Group by category
    const plansByCategory = {};
    result.rows.forEach(plan => {
      if (!plansByCategory[plan.category]) {
        plansByCategory[plan.category] = [];
      }
      plansByCategory[plan.category].push(plan);
    });

    // Display by category
    Object.keys(plansByCategory).forEach(category => {
      console.log(`\n💰 ${category.toUpperCase()} PLANS:`);
      plansByCategory[category].forEach((plan, index) => {
        console.log(`\n${index + 1}. ${plan.name}`);
        console.log(`   📊 ${plan.accounts_count} Account${plan.accounts_count > 1 ? 's' : ''}`);
        console.log(`   💳 Registration Fee: ₦${Number(plan.registration_fee).toLocaleString()}`);
        console.log(`   💰 Daily Amount: ₦${Number(plan.daily_amount).toLocaleString()}`);
        console.log(`   📈 Total Contribution: ₦${Number(plan.total_contribution).toLocaleString()}`);
        console.log(`   🎯 Settlement Amount: ₦${Number(plan.settlement_amount).toLocaleString()}`);
        console.log(`   ⏱️ Duration: ${plan.duration_months} months`);
      });
    });

    // Show statistics
    console.log('\n📊 PLAN STATISTICS:');
    Object.keys(plansByCategory).forEach(category => {
      console.log(`${category}: ${plansByCategory[category].length} plans`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n👋 Connection closed');
  }
}

getAllContributionPlans();
