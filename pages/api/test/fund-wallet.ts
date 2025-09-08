// Test API to manually add funds to wallet for debugging
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { amount } = req.body
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' })
    }

    const testReference = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`🧪 Testing manual wallet funding for ${session.user.email} with amount: ${amount}`)

    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    })

    await client.connect()
    console.log('✅ Connected to database for manual funding')

    // Get user
    const userQuery = `SELECT id, email FROM auth.users WHERE email = $1`
    const userResult = await client.query(userQuery, [session.user.email])
    
    if (userResult.rows.length === 0) {
      await client.end()
      return res.status(404).json({ error: 'User not found' })
    }

    const user = userResult.rows[0]
    console.log(`👤 Found user: ${user.id} (${user.email})`)

    // Get current balance
    const balanceQuery = `SELECT wallet_balance FROM public.users_profiles WHERE user_id = $1`
    const balanceResult = await client.query(balanceQuery, [user.id])
    
    if (balanceResult.rows.length === 0) {
      await client.end()
      return res.status(404).json({ error: 'User profile not found' })
    }

    const currentBalance = parseFloat(balanceResult.rows[0].wallet_balance || 0)
    const newBalance = currentBalance + parseFloat(amount.toString())

    console.log(`💰 Current balance: ${currentBalance}, Adding: ${amount}, New balance: ${newBalance}`)

    await client.query('BEGIN')

    try {
      // Update wallet balance
      const updateQuery = `
        UPDATE public.users_profiles 
        SET wallet_balance = $1, updated_at = NOW()
        WHERE user_id = $2
        RETURNING wallet_balance
      `
      const updateResult = await client.query(updateQuery, [newBalance, user.id])
      console.log(`✅ Updated wallet balance to: ${updateResult.rows[0].wallet_balance}`)

      // Add transaction record
      const transactionQuery = `
        INSERT INTO public.wallet_transactions (
          user_id, transaction_type, type, amount, 
          balance_before, balance_after, reference, 
          status, description, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `
      const transactionResult = await client.query(transactionQuery, [
        user.id, 'CREDIT', 'credit', amount,
        currentBalance, newBalance, testReference,
        'completed', 'Manual test wallet funding'
      ])

      console.log(`📝 Created transaction record: ${transactionResult.rows[0].id}`)

      await client.query('COMMIT')
      await client.end()

      console.log('🎉 Manual wallet funding completed successfully!')

      res.status(200).json({
        success: true,
        message: 'Test wallet funding successful',
        data: {
          previousBalance: currentBalance,
          newBalance: updateResult.rows[0].wallet_balance,
          amount: amount,
          reference: testReference,
          transaction: transactionResult.rows[0]
        }
      })

    } catch (error) {
      await client.query('ROLLBACK')
      await client.end()
      throw error
    }

  } catch (error) {
    console.error('❌ Test wallet funding error:', error)
    res.status(500).json({ 
      error: 'Test funding failed',
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
