import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  console.log('🚀 Investor Dashboard API called')
  
  const session = await getSession({ req })
  console.log('🔐 Session check:', session ? 'Found' : 'Not found')
  console.log('📧 Session email:', session?.user?.email)

  // For now, let's try to get real data with a fallback approach
  const userEmail = session?.user?.email || 'realsammy86@gmail.com'
  console.log('👤 Using email for data fetch:', userEmail)

  let client;
  try {
    console.log('🔗 Connecting to PostgreSQL for investor dashboard...')
    client = await pool.connect()
    console.log('✅ Direct PostgreSQL connection established')

    // Get user profile - using working table structure like stats-direct.ts
    const userQuery = `
      SELECT id, phone, wallet_balance, bonus_wallet, total_referrals
      FROM public.users_profiles 
      WHERE phone = $1 OR id = (SELECT id FROM public.users_profiles LIMIT 1)
    `
    let userResult = await client.query(userQuery, ['+234 123 456 7890'])
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'No users found in database',
        suggestion: 'You need to create sample data first'
      })
    }

    const user = userResult.rows[0]

    // Get thrift plans with correct table names from schema
    const thriftQuery = `
      SELECT 
        tp.id,
        tp.plan_type,
        tp.daily_amount,
        tp.start_date,
        tp.end_date,
        tp.total_contributed,
        tp.expected_return,
        tp.status,
        tp.created_at
      FROM thrift_plans tp
      WHERE tp.user_id = $1
    `
    const thriftResult = await client.query(thriftQuery, [user.id])
    const thriftAccounts = thriftResult.rows
    console.log('🏦 Found thrift plans:', thriftAccounts.length)

    // Get wallet transactions - using correct table structure
    const transQuery = `
      SELECT amount, transaction_type, balance_after, created_at 
      FROM wallet_transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `
    const transResult = await client.query(transQuery, [user.id])
    const transactions = transResult.rows
    console.log('💰 Found wallet transactions:', transactions.length)

    // Calculate data using correct schema column names
    const activeAccounts = thriftAccounts.filter(acc => acc.status === 'active')
    const paidAccounts = thriftAccounts.filter(acc => acc.status === 'completed')
    const pendingSettlement = thriftAccounts.filter(acc => acc.status === 'paused')
    
    // Use wallet_balance from user_profiles directly
    const walletBalance = user.wallet_balance || 0

    // Calculate current balance from real thrift account data
    const currentBalance = activeAccounts.reduce((sum, acc) => sum + parseFloat(acc.total_contributed || 0), 0)
    
    // Calculate ledger balance (total amount saved across all accounts)
    const ledgerBalance = thriftAccounts.reduce((sum, acc) => sum + parseFloat(acc.total_contributed || 0), 0)

    // Find earliest activation date and maturity date
    const firstAccount = activeAccounts.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )[0]

    const activationDate = firstAccount ? 
      new Date(firstAccount.start_date).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric' 
      }) : 'Not Set'

    // Use end_date from schema
    const maturityDate = firstAccount ? 
      new Date(firstAccount.end_date).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric' 
      }) : 'Not Set'

    // Calculate current week (weeks since activation)
    const currentWeek = firstAccount ? 
      Math.floor((Date.now() - new Date(firstAccount.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1 : 0

    // For now, set defaults to 0 since this schema doesn't have defaults tracking
    const totalDefaults = 0
    const defaultWeek = 0

    const dashboardData = {
      user: {
        name: 'Samuel Ekele',  // hardcoded for now
        email: 'realsammy86@gmail.com',  // hardcoded for now
        phone: user.phone || 'Not provided'
      },
      cards: {
        walletBalance: Math.max(0, walletBalance),
        activationDate,
        maturityDate,
        currentBalance,
        currentWeek,
        ledgerBalance,
        totalDefaults,
        defaultWeek,
        totalThriftAccounts: thriftAccounts.length,
        totalReferrals: user.total_referrals || 0,
        pendingSettlementAccounts: pendingSettlement.length,
        totalPaidAccounts: paidAccounts.length,
        referralsWithin60Days: user.total_referrals || 0, // simplified for now
        bonusWallet: user.bonus_wallet || 0
      },
      thriftAccounts: activeAccounts.map(acc => ({
        id: acc.id,
        plan_name: acc.plan_type || 'Unknown Plan',
        current_balance: acc.total_contributed,
        status: acc.status,
        start_date: acc.start_date
      }))
    }

    console.log('📈 Investor dashboard data prepared:', JSON.stringify(dashboardData, null, 2))
    return res.status(200).json(dashboardData)

  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error)
    return res.status(500).json({ 
      message: 'Database connection failed', 
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error' 
    })

  } finally {
    if (client) {
      client.release()
    }
  }
}
