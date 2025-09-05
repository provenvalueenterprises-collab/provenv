// pages/api/payments/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { monnifyService } from '../../../lib/monnify';
import { Client } from 'pg';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      eventType,
      eventData: {
        paymentReference,
        amountPaid,
        totalPayable,
        paymentStatus,
        customer: { email },
      },
    } = req.body;

    console.log('🔔 Monnify webhook received:', {
      eventType,
      paymentReference,
      paymentStatus,
      amountPaid,
      customerEmail: email
    });

    // Verify the webhook is from Monnify (you should implement signature verification)
    // const isValidSignature = verifyWebhookSignature(req.headers, req.body);

    if (eventType === 'SUCCESSFUL_TRANSACTION' && paymentStatus === 'PAID') {
      // Verify payment with Monnify
      const verification = await monnifyService.verifyPayment(paymentReference);

      if (verification.requestSuccessful &&
          verification.responseBody.paymentStatus === 'PAID') {

        console.log('💰 Processing successful payment via webhook:', {
          reference: paymentReference,
          amount: amountPaid,
          email: email
        })

        // Update wallet balance
        await updateWalletBalanceFromWebhook(email, amountPaid, paymentReference)

        console.log('✅ Payment processed successfully via webhook:', paymentReference);
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ status: 'error' });
  }
}

async function updateWalletBalanceFromWebhook(userEmail: string, amount: number, reference: string) {
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
      FROM users u 
      JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1
    `
    const userResult = await client.query(userQuery, [userEmail])

    if (userResult.rows.length === 0) {
      await client.end()
      console.error('❌ User not found for webhook wallet update:', userEmail)
      return
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
      console.log('⚠️ Webhook transaction already processed:', reference)
      return
    }

    const currentBalance = parseFloat(user.wallet_balance || 0)
    const newBalance = currentBalance + parseFloat(amount.toString())

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
          type, 
          amount, 
          reference, 
          status, 
          description,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `
      
      await client.query(transactionQuery, [
        user.id,
        'credit',
        amount,
        reference,
        'completed',
        'Wallet funding via Monnify webhook'
      ])

      // Commit transaction
      await client.query('COMMIT')

      console.log(`✅ Wallet updated via webhook: ${user.email} +₦${amount} (New balance: ₦${newBalance})`)

    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK')
      throw error
    }

    await client.end()

  } catch (error) {
    console.error('❌ Webhook wallet update error:', error)
  }
}
