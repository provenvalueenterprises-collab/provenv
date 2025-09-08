// pages/api/wallet/test-credit.ts - Test endpoint to credit wallet in development
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { Client } from 'pg'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if we're in development mode
    const isDevelopmentMode = process.env.FLUTTERWAVE_SECRET_KEY?.includes('SANDBOXDEMOKEY') || 
                             process.env.FLUTTERWAVE_SECRET_KEY?.includes('test') ||
                             process.env.NODE_ENV === 'development';

    if (!isDevelopmentMode) {
      return res.status(400).json({ message: 'This endpoint is only available in development mode' });
    }

    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    console.log('🧪 Test crediting wallet:', { amount, user: session.user.email });

    // Update wallet balance
    const result = await creditWalletBalance(session.user.email, parseFloat(amount));

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `₦${amount.toLocaleString()} has been credited to your wallet`,
        newBalance: result.newBalance,
        transaction: result.transaction
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('❌ Test wallet credit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to credit wallet'
    });
  }
}

async function creditWalletBalance(userEmail: string, amount: number) {
  try {
    // Create PostgreSQL client
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: false // Use same connection as working APIs
    })

    await client.connect()

    // Get user and current wallet balance
    const userQuery = `
      SELECT u.id, u.email, up.wallet_balance 
      FROM users u 
      JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1
    `
    const userResult = await client.query(userQuery, [userEmail])

    if (userResult.rows.length === 0) {
      await client.end()
      return { success: false, message: 'User not found' }
    }

    const user = userResult.rows[0]
    const currentBalance = parseFloat(user.wallet_balance || 0)
    const newBalance = currentBalance + amount
    const reference = `TEST_CREDIT_${Date.now()}_${user.id}`

    // Start transaction
    await client.query('BEGIN')

    try {
      // Update wallet balance
      const updateQuery = `
        UPDATE users_profiles 
        SET 
          wallet_balance = $1,
          updated_at = NOW()
        WHERE user_id = $2
        RETURNING wallet_balance
      `
      
      await client.query(updateQuery, [newBalance, user.id])

      // Log transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_id, 
          transaction_type,
          type, 
          amount, 
          balance_before,
          balance_after,
          reference, 
          status, 
          description,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `
      
      const txResult = await client.query(transactionQuery, [
        user.id,
        'CREDIT',
        'credit',
        amount,
        currentBalance,
        newBalance,
        reference,
        'completed',
        'Test wallet credit - Development mode'
      ])

      // Commit transaction
      await client.query('COMMIT')

      console.log(`✅ Test wallet credited: ${user.email} +₦${amount} (New balance: ₦${newBalance})`)

      await client.end()

      return { 
        success: true, 
        newBalance: newBalance,
        transaction: txResult.rows[0]
      }

    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK')
      await client.end()
      throw error
    }

  } catch (error) {
    console.error('❌ Wallet credit error:', error)
    return { success: false, message: 'Failed to update wallet balance' }
  }
}
