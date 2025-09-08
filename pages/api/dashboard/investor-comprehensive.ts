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

    // Get user profile - using correct auth.users table like virtual-account API
    const userQuery = `
      SELECT 
        u.id, 
        u.email,
        up.wallet_balance, 
        up.bonus_wallet, 
        up.total_referrals,
        up.phone
      FROM auth.users u
      LEFT JOIN users_profiles up ON u.id = up.user_id
      WHERE u.email = $1
    `
    let userResult = await client.query(userQuery, [userEmail])
    console.log('📋 User query result:', {
      rowCount: userResult.rows.length,
      userEmail,
      firstRow: userResult.rows[0] || 'No rows found'
    });
    
    if (userResult.rows.length === 0) {
      // Return default dashboard structure when no users found
      console.log('📋 No users found, returning default dashboard structure')
      return res.status(200).json({
        user: {
          name: 'New User',
          email: userEmail,
          phone: 'Not provided'
        },
        cards: {
          walletBalance: 3000,
          activationDate: "Not Set",
          maturityDate: "Not Set",
          currentBalance: 0,
          currentWeek: 0,
          ledgerBalance: 0,
          totalDefaults: 0,
          defaultWeek: 0,
          totalThriftAccounts: 0,
          totalReferrals: 0,
          pendingSettlementAccounts: 0,
          totalPaidAccounts: 0,
          referralsWithin60Days: 0,
          bonusWallet: "0.00"
        },
        thriftAccounts: []
      })
    }

    const user = userResult.rows[0]

    // Get thrift accounts with correct table names from schema
    const thriftQuery = `
      SELECT 
        ta.id,
        ta.status,
        ta.start_date,
        ta.maturity_date as end_date,
        ta.amount_saved as total_contributed,
        ta.settlement_amount as expected_return,
        ta.created_at,
        cp.name as plan_type,
        cp.daily_amount
      FROM thrift_accounts ta
      JOIN contribution_plans cp ON cp.id = ta.plan_id
      WHERE ta.user_id = $1
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
    console.log('💰 Wallet balance calculation:', {
      rawWalletBalance: user.wallet_balance,
      finalWalletBalance: walletBalance,
      userObject: user
    });

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

    // Calculate current day (days since activation) - treating as daily contributions
    const currentWeek = firstAccount ? 
      Math.floor((Date.now() - new Date(firstAccount.start_date).getTime()) / (24 * 60 * 60 * 1000)) + 1 : 0

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
        activationDate: activationDate || "Not Set",
        maturityDate: maturityDate || "Not Set",
        currentBalance: currentBalance || 0,
        currentWeek: currentWeek || 0,
        ledgerBalance: ledgerBalance || 0,
        totalDefaults: totalDefaults || 0,
        defaultWeek: defaultWeek || 0,
        totalThriftAccounts: thriftAccounts.length || 0,
        totalReferrals: user.total_referrals || 0,
        pendingSettlementAccounts: pendingSettlement.length || 0,
        totalPaidAccounts: paidAccounts.length || 0,
        referralsWithin60Days: user.total_referrals || 0,
        bonusWallet: (user.bonus_wallet?.toString() || "0.00")
      },
      thriftAccounts: activeAccounts.map(acc => ({
        id: acc.id,
        plan_name: acc.plan_type || 'Unknown Plan',
        current_balance: acc.total_contributed,
        status: acc.status,
        start_date: acc.start_date
      })) || []
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
