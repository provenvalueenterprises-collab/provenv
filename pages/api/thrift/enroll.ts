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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getSession({ req })
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { planId } = req.body

  if (!planId) {
    return res.status(400).json({ message: 'Plan ID is required' })
  }

  let client;
  try {
    client = await pool.connect()

    // Get user profile
    const userQuery = 'SELECT * FROM users_profiles WHERE email = $1'
    const userResult = await client.query(userQuery, [session.user.email])
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' })
    }

    const dbUser = userResult.rows[0]

    // Get plan details
    const planQuery = 'SELECT * FROM contribution_plans WHERE id = $1'
    const planResult = await client.query(planQuery, [planId])
    
    if (planResult.rows.length === 0) {
      return res.status(404).json({ message: 'Plan not found' })
    }

    const plan = planResult.rows[0]

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

    // Create thrift account
    const accountQuery = `
      INSERT INTO thrift_accounts (
        user_id, plan_id, status, start_date, next_contribution_date,
        total_contributed, current_balance, settlement_amount, is_fast_track, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `
    
    const accountData = [
      dbUser.id,
      planId,
      'active',
      new Date().toISOString().split('T')[0],
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      0,
      0,
      plan.settlement_amount,
      false,
      new Date().toISOString()
    ]

    const accountResult = await client.query(accountQuery, accountData)
    const thriftAccount = accountResult.rows[0]

    // Record registration fee transaction
    const transactionQuery = `
      INSERT INTO wallet_transactions (
        user_id, transaction_type, amount, balance_after, description, 
        status, reference, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `

    const transactionData = [
      dbUser.id,
      'registration_fee',
      -plan.registration_fee, // Negative because it's a payment
      -plan.registration_fee,
      `Registration fee for ${plan.name}`,
      'completed',
      `REG-${thriftAccount.id}-${Date.now()}`,
      new Date().toISOString()
    ]

    await client.query(transactionQuery, transactionData)

    return res.status(201).json({
      message: 'Successfully enrolled in thrift plan',
      account: thriftAccount,
      plan: plan
    })

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
