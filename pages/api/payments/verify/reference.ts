import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]'
import { Client } from 'pg'

async function verifyFlutterwavePayment(reference: string) {
  try {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('📡 Flutterwave verification response:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Flutterwave verification error:', error);
    throw error;
  }
}

async function updateWalletBalance(userEmail: string, amount: number, reference: string) {
  try {
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    })

    await client.connect()

    const userQuery = `
      SELECT u.id, u.email, up.wallet_balance 
      FROM users u 
      JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1
    `
    const userResult = await client.query(userQuery, [userEmail])

    if (userResult.rows.length === 0) {
      await client.end()
      console.error('❌ User not found for wallet update:', userEmail)
      return
    }

    const user = userResult.rows[0]
    
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
    const newBalance = currentBalance + parseFloat(amount.toString())

    await client.query('BEGIN')

    try {
      const updateQuery = `
        UPDATE users_profiles 
        SET 
          wallet_balance = $1,
          updated_at = NOW()
        WHERE user_id = $2
        RETURNING wallet_balance
      `
      
      await client.query(updateQuery, [newBalance, user.id])

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
      
      await client.query(transactionQuery, [
        user.id,
        'CREDIT',
        'credit',
        amount,
        currentBalance,
        newBalance,
        reference,
        'completed',
        'Wallet funding via payment verification'
      ])

      await client.query('COMMIT')

      console.log(`✅ Wallet updated via verification: ${user.email} +₦${amount} (New balance: ₦${newBalance})`)

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }

    await client.end()

  } catch (error) {
    console.error('❌ Wallet update error:', error)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;

    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({ message: 'Payment reference is required' });
    }

    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('🔍 Verifying payment:', reference, 'for user:', session.user.email)

    const verification = await verifyFlutterwavePayment(reference);

    if (verification.status === 'success') {
      const paymentData = verification.data;
      const isSuccessful = paymentData.status === 'successful';

      if (isSuccessful) {
        console.log('✅ Payment verified successfully, updating wallet...', {
          reference: paymentData.tx_ref,
          amount: paymentData.amount,
          customer: paymentData.customer?.email
        })

        await updateWalletBalance(session.user.email, paymentData.amount, reference)
      }

      res.status(200).json({
        success: true,
        verified: isSuccessful,
        paymentData: {
          reference: paymentData.tx_ref,
          amount: paymentData.amount,
          status: paymentData.status,
          customer: paymentData.customer,
        },
      });
    } else {
      res.status(200).json({
        success: false,
        verified: false,
        message: verification.message || 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      message: 'Failed to verify payment',
    });
  }
}
