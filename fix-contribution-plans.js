const { Pool } = require('pg')

// PostgreSQL connection pool using credentials from .env.nextauth
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20,
})

async function fixContributionPlans() {
  let client;
  try {
    console.log('🔗 Connecting to PostgreSQL...')
    client = await pool.connect()

    // First, check if contribution_plans table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contribution_plans'
      );
    `
    const tableExists = await client.query(checkTableQuery)
    console.log('📋 Table exists:', tableExists.rows[0].exists)

    if (!tableExists.rows[0].exists) {
      console.log('📦 Creating contribution_plans table...')
      const createTableQuery = `
        CREATE TABLE public.contribution_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          accounts_count INTEGER NOT NULL DEFAULT 1,
          registration_fee INTEGER NOT NULL,
          daily_amount INTEGER NOT NULL,
          total_contribution INTEGER NOT NULL,
          settlement_amount INTEGER NOT NULL,
          duration_months INTEGER NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
      await client.query(createTableQuery)
      console.log('✅ Table created successfully')
    }

    // Check current data
    const currentDataQuery = 'SELECT * FROM contribution_plans ORDER BY category, daily_amount'
    const currentData = await client.query(currentDataQuery)
    console.log('📊 Current plans count:', currentData.rows.length)
    
    if (currentData.rows.length > 0) {
      console.log('📋 Current plans:')
      currentData.rows.forEach(plan => {
        console.log(`- ${plan.name}: ₦${plan.daily_amount} daily, ₦${plan.registration_fee} reg fee, ₦${plan.settlement_amount} settlement`)
      })
    }

    // Clear existing plans and insert correct ones
    await client.query('DELETE FROM contribution_plans')
    console.log('🗑️ Cleared existing plans')

    // Insert the correct contribution packages based on user specifications
    const correctPlans = [
      // Standard Plans
      {
        name: 'Standard',
        category: 'standard',
        accounts_count: 1,
        registration_fee: 5000,
        daily_amount: 1000,
        total_contribution: 365000, // 1000 * 365 days
        settlement_amount: 500000,
        duration_months: 12
      },
      {
        name: 'Standard2',
        category: 'standard',
        accounts_count: 1,
        registration_fee: 10000,
        daily_amount: 2000,
        total_contribution: 730000, // 2000 * 365 days
        settlement_amount: 1000000,
        duration_months: 12
      },
      // Other Plans
      {
        name: 'Medium',
        category: 'other',
        accounts_count: 1,
        registration_fee: 5000,
        daily_amount: 500,
        total_contribution: 182500, // 500 * 365 days
        settlement_amount: 250000,
        duration_months: 12
      },
      {
        name: 'Least',
        category: 'other',
        accounts_count: 1,
        registration_fee: 5000,
        daily_amount: 250,
        total_contribution: 91250, // 250 * 365 days
        settlement_amount: 125000,
        duration_months: 12
      }
    ]

    console.log('📝 Inserting correct contribution plans...')
    
    for (const plan of correctPlans) {
      const insertQuery = `
        INSERT INTO contribution_plans (
          name, category, accounts_count, registration_fee, daily_amount, 
          total_contribution, settlement_amount, duration_months, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `
      await client.query(insertQuery, [
        plan.name,
        plan.category,
        plan.accounts_count,
        plan.registration_fee,
        plan.daily_amount,
        plan.total_contribution,
        plan.settlement_amount,
        plan.duration_months,
        true
      ])
      console.log(`✅ Inserted ${plan.name} plan`)
    }

    // Verify the new data
    const verifyQuery = 'SELECT * FROM contribution_plans ORDER BY category, daily_amount'
    const verifyData = await client.query(verifyQuery)
    
    console.log('\n📋 Final contribution plans:')
    verifyData.rows.forEach(plan => {
      const profit = plan.settlement_amount - plan.total_contribution
      const profitPercentage = Math.round((profit / plan.total_contribution) * 100)
      console.log(`- ${plan.name}:`)
      console.log(`  • Daily: ₦${plan.daily_amount.toLocaleString()}`)
      console.log(`  • Registration: ₦${plan.registration_fee.toLocaleString()}`)
      console.log(`  • Total Contribution: ₦${plan.total_contribution.toLocaleString()}`)
      console.log(`  • Settlement: ₦${plan.settlement_amount.toLocaleString()}`)
      console.log(`  • Profit: ₦${profit.toLocaleString()} (${profitPercentage}% return)`)
      console.log('')
    })

    console.log('🎉 Contribution plans fixed successfully!')

  } catch (error) {
    console.error('❌ Error fixing contribution plans:', error)
  } finally {
    if (client) {
      client.release()
    }
    await pool.end()
  }
}

fixContributionPlans()
