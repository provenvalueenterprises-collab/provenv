const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function seedRealContributionPlans() {
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

    // First, let's see the current structure of contribution_plans
    const schemaQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'contribution_plans' 
      ORDER BY ordinal_position
    `;
    const schemaResult = await client.query(schemaQuery);
    console.log('\n=== CONTRIBUTION_PLANS TABLE STRUCTURE ===');
    schemaResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    // Check existing plans
    const existingPlansQuery = `SELECT * FROM contribution_plans ORDER BY id LIMIT 5`;
    const existingPlansResult = await client.query(existingPlansQuery);
    console.log('\n=== EXISTING PLANS ===');
    if (existingPlansResult.rows.length > 0) {
      existingPlansResult.rows.forEach(plan => {
        console.log(`- ${plan.id}: ${plan.name} - ₦${plan.daily_amount}`);
      });
    } else {
      console.log('No existing plans found');
    }

    // Create real contribution plans for your fintech platform
    const realPlans = [
      {
        name: 'Starter Daily Savings',
        daily_amount: 500,
        duration_days: 30,
        total_amount: 15000,
        description: 'Perfect for beginners - Save ₦500 daily for 30 days'
      },
      {
        name: 'Standard Thrift Plan',
        daily_amount: 1000,
        duration_days: 60,
        total_amount: 60000,
        description: 'Save ₦1,000 daily for 2 months with bonus returns'
      },
      {
        name: 'Premium Savings',
        daily_amount: 2000,
        duration_days: 90,
        total_amount: 180000,
        description: 'High-value daily savings with maximum returns'
      },
      {
        name: 'Fast Track Weekly',
        daily_amount: 3500,
        duration_days: 21,
        total_amount: 73500,
        description: 'Accelerated 3-week savings plan for quick returns'
      },
      {
        name: 'Long Term Investment',
        daily_amount: 1500,
        duration_days: 120,
        total_amount: 180000,
        description: '4-month commitment plan with compound benefits'
      }
    ];

    // Check if we need to add columns
    const hasColumns = schemaResult.rows.some(col => col.column_name === 'duration_days');
    
    if (!hasColumns) {
      console.log('\n🔧 Adding missing columns to contribution_plans...');
      await client.query(`
        ALTER TABLE contribution_plans 
        ADD COLUMN IF NOT EXISTS duration_days INTEGER,
        ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2),
        ADD COLUMN IF NOT EXISTS description TEXT
      `);
      console.log('✅ Columns added successfully');
    }

    // Clear existing plans and add real ones
    console.log('\n🧹 Clearing existing plans...');
    await client.query('DELETE FROM contribution_plans');
    
    console.log('📦 Inserting real contribution plans...');
    for (const plan of realPlans) {
      const insertQuery = `
        INSERT INTO contribution_plans (name, daily_amount, duration_days, total_amount, description, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, name
      `;
      const result = await client.query(insertQuery, [
        plan.name,
        plan.daily_amount,
        plan.duration_days,
        plan.total_amount,
        plan.description
      ]);
      console.log(`✅ Created plan: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }

    // Update existing thrift accounts to use real plan IDs
    console.log('\n🔄 Updating existing thrift accounts to use real plans...');
    const newPlansQuery = `SELECT id, name FROM contribution_plans ORDER BY daily_amount`;
    const newPlansResult = await client.query(newPlansQuery);
    
    if (newPlansResult.rows.length > 0) {
      // Assign first plan to all existing thrift accounts for now
      const firstPlanId = newPlansResult.rows[0].id;
      const updateQuery = `UPDATE thrift_accounts SET plan_id = $1 WHERE plan_id IS NOT NULL`;
      const updateResult = await client.query(updateQuery, [firstPlanId]);
      console.log(`✅ Updated ${updateResult.rowCount} thrift accounts to use plan: ${newPlansResult.rows[0].name}`);
    }

    console.log('\n✅ Real contribution plans setup complete!');
    
    // Show final results
    const finalPlansQuery = `SELECT id, name, daily_amount, duration_days, total_amount FROM contribution_plans ORDER BY daily_amount`;
    const finalPlansResult = await client.query(finalPlansQuery);
    console.log('\n=== FINAL CONTRIBUTION PLANS ===');
    finalPlansResult.rows.forEach(plan => {
      console.log(`- ${plan.name}: ₦${plan.daily_amount}/day × ${plan.duration_days} days = ₦${plan.total_amount}`);
    });

  } catch (error) {
    console.error('❌ Error setting up contribution plans:', error.message);
  } finally {
    await client.end();
  }
}

seedRealContributionPlans();
