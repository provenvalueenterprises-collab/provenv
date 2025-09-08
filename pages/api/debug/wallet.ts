// Debug API to check wallet status and transactions
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log(`🔍 Debug wallet check for: ${session.user.email}`)

    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    })

    await client.connect()

    // Get user info
    const userQuery = `SELECT id, email, created_at FROM auth.users WHERE email = $1`
    const userResult = await client.query(userQuery, [session.user.email])
    
    if (userResult.rows.length === 0) {
      await client.end()
      return res.status(404).json({ error: 'User not found in auth.users' })
    }

    const user = userResult.rows[0]

    // Get user profile
    const profileQuery = `
      SELECT user_id, full_name, phone_number, wallet_balance, 
             created_at, updated_at 
      FROM public.users_profiles 
      WHERE user_id = $1
    `
    const profileResult = await client.query(profileQuery, [user.id])

    // Get recent wallet transactions
    const transactionsQuery = `
      SELECT id, transaction_type, type, amount, balance_before, 
             balance_after, reference, status, description, created_at
      FROM public.wallet_transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `
    const transactionsResult = await client.query(transactionsQuery, [user.id])

    await client.end()

    const debugInfo = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profileResult.rows.length > 0 ? profileResult.rows[0] : null,
      transactions: transactionsResult.rows,
      summary: {
        hasProfile: profileResult.rows.length > 0,
        currentBalance: profileResult.rows.length > 0 ? profileResult.rows[0].wallet_balance : 'No profile',
        transactionCount: transactionsResult.rows.length,
        lastTransaction: transactionsResult.rows.length > 0 ? transactionsResult.rows[0].created_at : null
      }
    }

    console.log('🔍 Debug info prepared:', JSON.stringify(debugInfo.summary, null, 2))

    res.status(200).json(debugInfo)

  } catch (error) {
    console.error('❌ Debug wallet error:', error)
    res.status(500).json({ 
      error: 'Debug failed',
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
