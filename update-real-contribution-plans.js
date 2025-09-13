const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function updateContributionPlansToReal() {
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
    console.log('✅ Database connected successfully');

    // First, check existing plans
    const existingPlansQuery = `SELECT id, name, daily_amount FROM contribution_plans ORDER BY daily_amount LIMIT 10`;
    const existingPlansResult = await client.query(existingPlansQuery);
    console.log('\n=== EXISTING PLANS TO UPDATE ===');
    existingPlansResult.rows.forEach(plan => {
      console.log(`- ${plan.id}: ${plan.name} - ₦${plan.daily_amount}`);
    });

    // Update existing plans with real data instead of deleting
    const realPlansData = [
      {
        name: 'Starter Daily Savings',
        daily_amount: 500,
        duration_days: 30,
        total_amount: 15000,
        description: 'Perfect for beginners - Save ₦500 daily for 30 days',
        category: 'starter'
      },
      {
        name: 'Standard Thrift Plan',
        daily_amount: 1000,
        duration_days: 60,
        total_amount: 60000,
        description: 'Save ₦1,000 daily for 2 months with bonus returns',
        category: 'standard'
      },
      {
        name: 'Premium Savings',
        daily_amount: 2000,
        duration_days: 90,
        total_amount: 180000,
        description: 'High-value daily savings with maximum returns',
        category: 'premium'
      },
      {
        name: 'Fast Track Weekly',
        daily_amount: 3500,
        duration_days: 21,
        total_amount: 73500,
        description: 'Accelerated 3-week savings plan for quick returns',
        category: 'fast-track'
      },
      {
        name: 'Long Term Investment',
        daily_amount: 1500,
        duration_days: 120,
        total_amount: 180000,
        description: '4-month commitment plan with compound benefits',
        category: 'long-term'
      }
    ];

    // Update existing plans in place
    console.log('\n🔄 Updating existing plans with real data...');
    for (let i = 0; i < Math.min(existingPlansResult.rows.length, realPlansData.length); i++) {
      const existingPlan = existingPlansResult.rows[i];
      const newPlanData = realPlansData[i];
      
      const updateQuery = `
        UPDATE contribution_plans 
        SET 
          name = $1,
          daily_amount = $2,
          total_contribution = $3,
          settlement_amount = $4,
          duration_days = $5,
          description = $6,
          category = $7,
          is_active = true
        WHERE id = $8
        RETURNING name, daily_amount
      `;
      
      const result = await client.query(updateQuery, [
        newPlanData.name,
        newPlanData.daily_amount,
        newPlanData.total_amount,
        newPlanData.total_amount * 1.1, // 10% return
        newPlanData.duration_days,
        newPlanData.description,
        newPlanData.category,
        existingPlan.id
      ]);
      
      console.log(`✅ Updated: ${result.rows[0].name} - ₦${result.rows[0].daily_amount}/day`);
    }

    // Add any remaining plans if we have more real plans than existing ones
    if (realPlansData.length > existingPlansResult.rows.length) {
      console.log('\n📦 Adding additional real plans...');
      for (let i = existingPlansResult.rows.length; i < realPlansData.length; i++) {
        const plan = realPlansData[i];
        const insertQuery = `
          INSERT INTO contribution_plans (
            name, daily_amount, total_contribution, settlement_amount, 
            duration_days, description, category, is_active, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
          RETURNING id, name
        `;
        const result = await client.query(insertQuery, [
          plan.name,
          plan.daily_amount,
          plan.total_amount,
          plan.total_amount * 1.1,
          plan.duration_days,
          plan.description,
          plan.category
        ]);
        console.log(`✅ Created: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      }
    }

    console.log('\n✅ All contribution plans updated with real data!');
    
    // Show final results
    const finalPlansQuery = `
      SELECT id, name, daily_amount, duration_days, total_contribution, settlement_amount 
      FROM contribution_plans 
      WHERE is_active = true
      ORDER BY daily_amount
    `;
    const finalPlansResult = await client.query(finalPlansQuery);
    console.log('\n=== UPDATED CONTRIBUTION PLANS ===');
    finalPlansResult.rows.forEach(plan => {
      console.log(`- ${plan.name}: ₦${plan.daily_amount}/day × ${plan.duration_days} days = ₦${plan.total_contribution} (Returns: ₦${plan.settlement_amount})`);
    });

  } catch (error) {
    console.error('❌ Error updating contribution plans:', error.message);
  } finally {
    await client.end();
  }
}

updateContributionPlansToReal();
