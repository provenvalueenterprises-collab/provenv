// pages/api/payments/simulate-success.ts - For testing payment success in development
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
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { amount, reference } = req.body;

    if (!amount || !reference) {
      return res.status(400).json({ message: 'Amount and reference are required' });
    }

    // Check if we're in development mode
    const isDevelopmentMode = process.env.FLUTTERWAVE_SECRET_KEY?.includes('SANDBOXDEMOKEY') || 
                             process.env.FLUTTERWAVE_SECRET_KEY?.includes('test') ||
                             process.env.NODE_ENV === 'development';

    if (!isDevelopmentMode) {
      return res.status(400).json({ message: 'This endpoint is only available in development mode' });
    }

    console.log('🧪 Simulating successful payment:', { amount, reference, user: session.user.email });

    // Update wallet balance for test payment
    await updateWalletBalance(session.user.email, parseFloat(amount), reference);

    res.status(200).json({
      success: true,
      verified: true,
      paymentData: {
        reference: reference,
        amount: parseFloat(amount),
        status: 'successful',
        customer: { email: session.user.email },
      },
    });

  } catch (error) {
    console.error('❌ Test payment simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate payment',
    });
  }
}

async function updateWalletBalance(userEmail: string, amount: number, reference: string) {
  try {
    // Create PostgreSQL client
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    })

    await client.connect()

    // Get user and current wallet balance
    const userQuery = `
      SELECT u.id, u.email, up.wallet_balance 
      FROM auth.users u 
      LEFT JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1
    `
    const userResult = await client.query(userQuery, [userEmail])

    if (userResult.rows.length === 0) {
      await client.end()
      console.error('❌ User not found for wallet update:', userEmail)
      throw new Error('User not found')
    }

    const user = userResult.rows[0]
    
    // Check if transaction already exists
    const existingTxQuery = `
      SELECT * FROM wallet_transactions 
      WHERE reference = $1 AND user_id = $2
    `
    const existingTx = await client.query(existingTxQuery, [reference, user.id])

    if (existingTx.rows.length > 0) {
      await client.end()
      console.log('⚠️ Transaction already processed:', reference)
      return
    }

    const currentBalance = parseFloat(user.wallet_balance || 0)
    const newBalance = currentBalance + amount

    // Start transaction
    await client.query('BEGIN')

    try {
      // Update wallet balance
      const updateQuery = `
        UPDATE users_profiles 
        SET wallet_balance = $1, updated_at = NOW() 
        WHERE user_id = $2
      `
      await client.query(updateQuery, [newBalance, user.id])

      // Insert wallet transaction record
      const insertTxQuery = `
        INSERT INTO wallet_transactions (
          user_id, amount, transaction_type, reference, status, 
          description, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `
      await client.query(insertTxQuery, [
        user.id,
        amount,
        'credit',
        reference,
        'successful',
        `Test wallet funding - ₦${amount.toLocaleString()}`
      ])

      // Commit transaction
      await client.query('COMMIT')
      
      console.log('✅ Test wallet balance updated:', {
        user: userEmail,
        previousBalance: currentBalance,
        newBalance: newBalance,
        amount: amount,
        reference: reference
      })

    } catch (updateError) {
      await client.query('ROLLBACK')
      throw updateError
    }

    await client.end()

  } catch (error) {
    console.error('❌ Database error during wallet update:', error)
    throw error
  }
}
