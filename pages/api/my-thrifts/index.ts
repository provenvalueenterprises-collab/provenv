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

  const session = await getSession({ req })
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  let client;
  try {
    client = await pool.connect()

    // Get user profile
    const userQuery = `
      SELECT user_id, email, first_name, last_name, phone 
      FROM users_profiles up
      WHERE email = $1
    `
    const userResult = await client.query(userQuery, [session.user.email])
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' })
    }

    const userProfile = userResult.rows[0]

    // Get user's thrift accounts with plan details
    const thriftAccountsQuery = `
      SELECT 
        ta.id,
        ta.status,
        ta.start_date,
        ta.last_contribution_date,
        ta.amount_saved as total_contributed,
        ta.amount_saved as current_balance,
        ta.settlement_amount,
        ta.is_fast_track,
        ta.created_at,
        cp.name as plan_name,
        cp.daily_amount,
        cp.settlement_amount as plan_settlement_amount,
        cp.registration_fee,
        cp.duration_months,
        cp.category,
        (CURRENT_DATE - ta.start_date::date) as days_active,
        CASE 
          WHEN ta.status = 'active' AND cp.duration_months IS NOT NULL 
          THEN LEAST(100, ((CURRENT_DATE - ta.start_date::date) / (cp.duration_months * 30.0)) * 100)
          ELSE 0
        END as completion_percentage,
        CASE 
          WHEN ta.last_contribution_date IS NOT NULL 
          THEN (ta.last_contribution_date::date + INTERVAL '1 day')::date
          ELSE (ta.start_date::date + INTERVAL '1 day')::date
        END as next_contribution_date
      FROM thrift_accounts ta
      JOIN contribution_plans cp ON cp.id = ta.plan_id
      WHERE ta.user_id = $1
      ORDER BY ta.created_at DESC
    `
    const thriftResult = await client.query(thriftAccountsQuery, [userProfile.user_id])

    // Get recent contributions for each thrift account
    const contributionsQuery = `
      SELECT 
        dc.id,
        dc.thrift_account_id,
        dc.amount,
        dc.contribution_date,
        dc.status,
        dc.created_at,
        ta.id as account_id
      FROM daily_contributions dc
      JOIN thrift_accounts ta ON ta.id = dc.thrift_account_id
      WHERE ta.user_id = $1
      ORDER BY dc.contribution_date DESC
      LIMIT 50
    `
    const contributionsResult = await client.query(contributionsQuery, [userProfile.user_id])

    // Get settlement accounts for completed thrifts
    const settlementQuery = `
      SELECT 
        sa.id,
        sa.thrift_account_id,
        sa.account_number,
        sa.bank_name,
        sa.account_name,
        sa.settlement_amount,
        sa.status,
        sa.settlement_date,
        ta.id as account_id,
        cp.name as plan_name
      FROM settlement_accounts sa
      JOIN thrift_accounts ta ON ta.id = sa.thrift_account_id
      JOIN contribution_plans cp ON cp.id = ta.plan_id
      WHERE ta.user_id = $1
      ORDER BY sa.settlement_date DESC
    `
    const settlementResult = await client.query(settlementQuery, [userProfile.user_id])

    // Organize data
    const thriftAccounts = thriftResult.rows.map(account => ({
      ...account,
      contributions: contributionsResult.rows.filter(c => c.thrift_account_id === account.id),
      settlement: settlementResult.rows.find(s => s.thrift_account_id === account.id)
    }))

    // Calculate summary statistics
    const activeAccounts = thriftAccounts.filter(acc => acc.status === 'active')
    const completedAccounts = thriftAccounts.filter(acc => acc.status === 'settled')
    const maturedAccounts = thriftAccounts.filter(acc => acc.status === 'matured')

    const totalContributed = thriftAccounts.reduce((sum, acc) => sum + parseFloat(acc.total_contributed || 0), 0)
    const totalExpectedSettlement = thriftAccounts.reduce((sum, acc) => sum + parseFloat(acc.settlement_amount || 0), 0)
    const totalSettled = completedAccounts.reduce((sum, acc) => sum + parseFloat(acc.settlement_amount || 0), 0)

    return res.status(200).json({
      success: true,
      user: {
        name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User',
        email: userProfile.email,
        phone: userProfile.phone
      },
      summary: {
        total_accounts: thriftAccounts.length,
        active_accounts: activeAccounts.length,
        completed_accounts: completedAccounts.length,
        matured_accounts: maturedAccounts.length,
        total_contributed: totalContributed,
        total_expected_settlement: totalExpectedSettlement,
        total_settled: totalSettled,
        pending_settlement: totalExpectedSettlement - totalSettled
      },
      thrift_accounts: thriftAccounts,
      recent_contributions: contributionsResult.rows.slice(0, 10),
      settlement_accounts: settlementResult.rows
    })

  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      client.release()
    }
  }
}
