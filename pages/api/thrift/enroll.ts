import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { Pool } from 'pg'

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  let session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    console.log('❌ No valid session found, retrying...')
    
    // Try to get session one more time in case of timing issue
    const retrySession = await getServerSession(req, res, authOptions)
    if (!retrySession?.user?.email) {
      console.log('❌ No valid session found on retry')
      return res.status(401).json({ 
        message: 'Unauthorized',
        hint: 'Session may have expired, please log in again'
      })
    }
    
    console.log('✅ Session found on retry')
    session = retrySession
  }

  const { planId } = req.body

  if (!planId) {
    return res.status(400).json({ message: 'Plan ID is required' })
  }

  let client;
  try {
    client = await pool.connect()

    console.log('🔑 Processing enrollment for user:', session.user.email)

    // Get user profile using auth.users table (consistent with other APIs)
    const userQuery = `
      SELECT u.id, u.email, u.display_name, up.wallet_balance, up.phone, up.nin
      FROM auth.users u
      LEFT JOIN users_profiles up ON u.id = up.user_id  
      WHERE u.email = $1
    `
    const userResult = await client.query(userQuery, [session.user.email])
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found in auth.users table:', session.user.email)
      return res.status(404).json({ message: 'User profile not found' })
    }

    const dbUser = userResult.rows[0]
    console.log('✅ User found:', { id: dbUser.id, email: dbUser.email, wallet_balance: dbUser.wallet_balance })

    // Get plan details
    const planQuery = 'SELECT * FROM contribution_plans WHERE id = $1'
    const planResult = await client.query(planQuery, [planId])
    
    if (planResult.rows.length === 0) {
      console.log('❌ Plan not found:', planId)
      return res.status(404).json({ message: 'Plan not found' })
    }

    const plan = planResult.rows[0]
    console.log('📋 Plan details:', { id: plan.id, name: plan.name, registration_fee: plan.registration_fee })

    // Check if user has sufficient wallet balance for registration fee
    const currentBalance = parseFloat(dbUser.wallet_balance || '0')
    const registrationFee = parseFloat(plan.registration_fee || '0')
    
    console.log('💰 Balance check:', { 
      currentBalance, 
      registrationFee, 
      sufficient: currentBalance >= registrationFee 
    })
    
    if (currentBalance < registrationFee) {
      console.log('💰 Insufficient funds:', { required: registrationFee, available: currentBalance })
      return res.status(400).json({ 
        message: `Insufficient wallet balance. Registration fee: ₦${registrationFee.toLocaleString()}, Available: ₦${currentBalance.toLocaleString()}`,
        required: registrationFee,
        available: currentBalance
      })
    }

    // Check if user already has an active account with this plan
    const existingQuery = `
      SELECT id FROM thrift_accounts 
      WHERE user_id = $1 AND plan_id = $2 AND status = 'active'
    `
    const existingResult = await client.query(existingQuery, [dbUser.id, planId])

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'You already have an active account with this plan' 
      })
    }

    // Create thrift account with robust error handling
    console.log('📝 Creating thrift account for plan:', plan.name)
    
    try {
      // First, check if thrift_accounts table exists and get its structure
      const tableExistsQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'thrift_accounts'
      `
      const tableExists = await client.query(tableExistsQuery)
      
      if (tableExists.rows.length === 0) {
        console.log('⚠️ thrift_accounts table does not exist! Creating it now...')
        
        // Create the table
        await client.query(`
          CREATE TABLE public.thrift_accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            plan_id UUID NOT NULL REFERENCES contribution_plans(id) ON DELETE CASCADE,
            status VARCHAR(50) NOT NULL DEFAULT 'active',
            start_date DATE NOT NULL DEFAULT CURRENT_DATE,
            next_contribution_date DATE,
            total_contributed DECIMAL(15,2) DEFAULT 0,
            current_balance DECIMAL(15,2) DEFAULT 0,
            settlement_amount DECIMAL(15,2),
            is_fast_track BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `)
        
        // Create indexes
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_thrift_accounts_user_id ON public.thrift_accounts(user_id);
          CREATE INDEX IF NOT EXISTS idx_thrift_accounts_plan_id ON public.thrift_accounts(plan_id);
          CREATE INDEX IF NOT EXISTS idx_thrift_accounts_status ON public.thrift_accounts(status);
        `)
        
        console.log('✅ thrift_accounts table created successfully')
      }
      
      // Get column information to ensure we use the right columns
      const columnsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'thrift_accounts'
        ORDER BY ordinal_position
      `
      const columnsResult = await client.query(columnsQuery)
      const availableColumns = columnsResult.rows.map(r => r.column_name)
      console.log('📋 Available columns in thrift_accounts:', availableColumns)

      // Build INSERT statement based on available columns
      const essentialColumns = ['user_id', 'plan_id', 'status', 'start_date']
      const optionalColumns = ['account_number', 'maturity_date', 'next_contribution_date', 'total_contributed', 'current_balance', 'settlement_amount', 'is_fast_track', 'total_weeks', 'current_week', 'amount_saved', 'total_defaults']
      
      const columnsToInsert = essentialColumns.filter(col => availableColumns.includes(col))
      const optionalColumnsToInsert = optionalColumns.filter(col => availableColumns.includes(col))
      
      const allColumnsToInsert = [...columnsToInsert, ...optionalColumnsToInsert]
      const placeholders = allColumnsToInsert.map((_, index) => `$${index + 1}`).join(', ')
      
      const accountQuery = `
        INSERT INTO thrift_accounts (${allColumnsToInsert.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `
      
      // Build data array based on columns we're inserting
      const accountData = []
      
      // Essential data
      if (availableColumns.includes('user_id')) accountData.push(dbUser.id)
      if (availableColumns.includes('plan_id')) accountData.push(planId)
      if (availableColumns.includes('status')) accountData.push('active')
      if (availableColumns.includes('start_date')) accountData.push(new Date().toISOString().split('T')[0])
      
      // Handle required fields that might be marked as optional in our list
      if (availableColumns.includes('account_number')) {
        // Generate a unique account number
        const timestamp = Date.now().toString()
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
        const accountNumber = `THR${timestamp.slice(-8)}${randomSuffix}`
        accountData.push(accountNumber)
        console.log('🔢 Generated account number:', accountNumber)
      }
      
      if (availableColumns.includes('maturity_date')) {
        // Calculate maturity date based on plan duration
        const durationMonths = plan.duration_months || 12 // Default to 12 months if not specified
        const maturityDate = new Date()
        maturityDate.setMonth(maturityDate.getMonth() + durationMonths)
        const maturityDateString = maturityDate.toISOString().split('T')[0]
        accountData.push(maturityDateString)
        console.log('📅 Calculated maturity date:', maturityDateString, `(${durationMonths} months from now)`)
      }
      
      // Other optional columns
      if (availableColumns.includes('next_contribution_date')) {
        accountData.push(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      }
      if (availableColumns.includes('total_contributed')) accountData.push(0)
      if (availableColumns.includes('current_balance')) accountData.push(0)
      if (availableColumns.includes('settlement_amount')) accountData.push(parseFloat(plan.settlement_amount))
      if (availableColumns.includes('is_fast_track')) accountData.push(false)
      if (availableColumns.includes('total_weeks')) {
        // Calculate total days based on plan duration (treating 'total_weeks' as total_days)
        const durationMonths = plan.duration_months || 12 // Default to 12 months if not specified
        accountData.push(durationMonths * 30) // Approximate days per month (360 days for 12 months)
      }
      if (availableColumns.includes('current_week')) accountData.push(0) // Starting at day 0
      if (availableColumns.includes('amount_saved')) accountData.push(0)
      if (availableColumns.includes('total_defaults')) accountData.push(0)

      console.log('💾 Inserting thrift account with query:', accountQuery)
      console.log('💾 Data values:', accountData)

      const accountResult = await client.query(accountQuery, accountData)
      const thriftAccount = accountResult.rows[0]
      console.log('✅ Thrift account created:', { id: thriftAccount.id, status: thriftAccount.status })

      // Deduct registration fee from wallet balance  
      const newBalance = currentBalance - registrationFee
      const updateBalanceQuery = `
        UPDATE users_profiles 
        SET wallet_balance = $1 
        WHERE user_id = $2
      `
      await client.query(updateBalanceQuery, [newBalance, dbUser.id])
      console.log('💰 Wallet balance updated:', { old: currentBalance, new: newBalance, deducted: registrationFee })

      // Record registration fee transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_id, transaction_type, type, amount, balance_before, balance_after, 
          description, status, reference, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `

      const transactionData = [
        dbUser.id,
        'DEBIT',
        'debit',
        registrationFee, // Positive amount since type indicates debit
        currentBalance,
        newBalance,
        `Registration fee for ${plan.name}`,
        'completed',
        `REG-${thriftAccount.id}-${Date.now()}`,
        new Date().toISOString()
      ]

      await client.query(transactionQuery, transactionData)
      console.log('📝 Transaction recorded for registration fee')

      return res.status(201).json({
        message: 'Successfully enrolled in thrift plan',
        account: thriftAccount,
        plan: plan
      })

    } catch (tableError) {
      console.error('Table structure error:', tableError)
      return res.status(500).json({ 
        message: 'Database table configuration error',
        error: tableError instanceof Error ? tableError.message : 'Unknown table error'
      })
    }

  } catch (error) {
    console.error('Enrollment error:', error)
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      client.release()
    }
  }
}
