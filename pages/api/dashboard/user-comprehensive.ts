// API endpoint for comprehensive user dashboard data
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🎯 User Dashboard API: Starting comprehensive data fetch...')
    
    // Get session
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('👤 User Dashboard API: Fetching data for:', session.user.email)

    // Connect to database
    const client = await pool.connect()
    console.log('🔌 User Dashboard API: Database connected')

    try {
      // Get user profile with wallet information
      const userQuery = `
        SELECT 
          up.*,
          u.email,
          u.display_name as name
        FROM users_profiles up
        JOIN auth.users u ON u.id = up.user_id::uuid
        WHERE u.email = $1
      `
      const userResult = await client.query(userQuery, [session.user.email])
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User profile not found' })
      }

      const userProfile = userResult.rows[0]
      console.log('👤 User found:', userProfile.email)

      // Get user's thrift accounts
      const thriftAccountsQuery = `
        SELECT 
          ta.*,
          cp.name as plan_name,
          cp.daily_amount,
          cp.settlement_amount,
          cp.registration_fee
        FROM thrift_accounts ta
        JOIN contribution_plans cp ON cp.id = ta.plan_id
        WHERE ta.user_id = $1
        ORDER BY ta.created_at DESC
      `
      const thriftResult = await client.query(thriftAccountsQuery, [userProfile.user_id])
      
      // Get recent wallet transactions
      const transactionsQuery = `
        SELECT *
        FROM wallet_transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `
      const transactionsResult = await client.query(transactionsQuery, [userProfile.user_id])

      // Get daily contributions for current active accounts
      const contributionsQuery = `
        SELECT 
          dc.*,
          ta.account_number,
          cp.name as plan_name
        FROM daily_contributions dc
        JOIN thrift_accounts ta ON ta.id = dc.thrift_account_id
        JOIN contribution_plans cp ON cp.id = ta.plan_id
        WHERE ta.user_id = $1
        ORDER BY dc.contribution_date DESC
        LIMIT 20
      `
      const contributionsResult = await client.query(contributionsQuery, [userProfile.user_id])

      // Get referrals data
      const referralsQuery = `
        SELECT 
          COUNT(*) as total_referrals,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '60 days' THEN 1 END) as referrals_within_60_days
        FROM users_profiles
        WHERE referred_by = $1
      `
      const referralsResult = await client.query(referralsQuery, [userProfile.user_id])

      // Get settlement accounts (matured accounts)
      const settlementQuery = `
        SELECT 
          ta.*,
          cp.name as plan_name,
          cp.settlement_amount
        FROM thrift_accounts ta
        JOIN contribution_plans cp ON cp.id = ta.plan_id
        WHERE ta.user_id = $1 AND ta.status IN ('matured', 'settled')
        ORDER BY ta.maturity_date DESC
      `
      const settlementResult = await client.query(settlementQuery, [userProfile.user_id])

      // Calculate dashboard statistics
      const activeAccounts = thriftResult.rows.filter(account => account.status === 'active')
      const paidAccounts = thriftResult.rows.filter(account => account.status === 'settled')
      const pendingSettlement = thriftResult.rows.filter(account => account.status === 'matured')
      
      // Calculate total defaults (missed contributions)
      const totalDefaults = contributionsResult.rows.filter(contrib => contrib.status === 'defaulted').length
      
      // Calculate current week for active accounts
      const currentWeekData = activeAccounts.map(account => {
        const startDate = new Date(account.start_date)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return {
          ...account,
          current_week: Math.ceil(diffDays / 7)
        }
      })

      const dashboardData = {
        // User Profile Information
        user: {
          id: userProfile.user_id,
          email: userProfile.email,
          name: userProfile.name,
          phone: userProfile.phone,
          walletBalance: parseFloat(userProfile.wallet_balance) || 0,
          bonusWallet: parseFloat(userProfile.bonus_wallet) || 0,
          referralCode: userProfile.referral_code,
          fastTrackEligible: userProfile.fast_track_eligible,
          fastTrackActivated: userProfile.fast_track_activated,
          virtualAccount: userProfile.virtual_account_number,
          memberSince: userProfile.created_at
        },

        // Dashboard Cards Data
        cards: {
          walletBalance: parseFloat(userProfile.wallet_balance) || 0,
          bonusWallet: parseFloat(userProfile.bonus_wallet) || 0,
          totalThriftAccounts: thriftResult.rows.length,
          totalReferrals: referralsResult.rows[0]?.total_referrals || 0,
          referralsWithin60Days: referralsResult.rows[0]?.referrals_within_60_days || 0,
          pendingSettlementAccounts: pendingSettlement.length,
          totalPaidAccounts: paidAccounts.length,
          totalDefaults: totalDefaults,
          activeAccounts: activeAccounts.length
        },

        // Active Thrift Accounts
        activeThrifts: currentWeekData,

        // Recent Transactions
        recentTransactions: transactionsResult.rows.map(tx => ({
          id: tx.id,
          type: tx.transaction_type,
          amount: parseFloat(tx.amount),
          description: tx.description,
          date: tx.created_at,
          status: tx.status,
          reference: tx.reference,
          balanceBefore: parseFloat(tx.balance_before),
          balanceAfter: parseFloat(tx.balance_after)
        })),

        // Recent Contributions
        recentContributions: contributionsResult.rows.map(contrib => ({
          id: contrib.id,
          accountNumber: contrib.account_number,
          planName: contrib.plan_name,
          amount: parseFloat(contrib.amount),
          date: contrib.contribution_date,
          status: contrib.status,
          week: contrib.week_number
        })),

        // Settlement Accounts
        settlementAccounts: settlementResult.rows.map(account => ({
          id: account.id,
          accountNumber: account.account_number,
          planName: account.plan_name,
          currentAmount: parseFloat(account.amount_saved),
          settlementAmount: parseFloat(account.settlement_amount),
          maturityDate: account.maturity_date,
          status: account.status
        })),

        // Summary Statistics
        summary: {
          totalContributed: activeAccounts.reduce((sum, acc) => sum + (parseFloat(acc.amount_saved) || 0), 0),
          expectedSettlement: activeAccounts.reduce((sum, acc) => sum + (parseFloat(acc.settlement_amount) || 0), 0),
          completionPercentage: activeAccounts.length > 0 
            ? Math.round((activeAccounts.reduce((sum, acc) => sum + acc.current_week, 0) / (activeAccounts.length * 52)) * 100)
            : 0
        },

        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          host: process.env.DB_HOST
        }
      }

      console.log('✅ User Dashboard API: Comprehensive data prepared successfully')
      res.status(200).json(dashboardData)

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ User Dashboard API Error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
