import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { Client } from 'pg'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { amount, reference, description = 'Wallet funding' } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' })
    }

    console.log('💰 Processing wallet funding:', {
      email: session.user.email,
      amount,
      reference
    })

    // Create PostgreSQL client
    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
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
    const userResult = await client.query(userQuery, [session.user.email])

    if (userResult.rows.length === 0) {
      await client.end()
      console.log(`❌ User not found for wallet funding: ${session.user.email}`)
      return res.status(404).json({ 
        error: 'User profile not found. Please complete your profile setup first.',
        code: 'USER_PROFILE_REQUIRED'
      })
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
      return res.status(400).json({ error: 'Transaction already processed' })
    }

    const currentBalance = parseFloat(user.wallet_balance || 0)
    const newBalance = currentBalance + parseFloat(amount)

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
      
      const updateResult = await client.query(updateQuery, [newBalance, user.id])

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
      
      const transactionResult = await client.query(transactionQuery, [
        user.id,
        'credit',
        amount,
        reference,
        'completed',
        description
      ])

      // Commit transaction
      await client.query('COMMIT')

      console.log(`✅ Wallet funded successfully: ${user.email} +₦${amount} (New balance: ₦${newBalance})`)

      res.status(200).json({
        success: true,
        message: 'Wallet funded successfully',
        data: {
          previousBalance: currentBalance,
          newBalance: newBalance,
          amountAdded: parseFloat(amount),
          transaction: transactionResult.rows[0]
        }
      })

    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK')
      throw error
    }

    await client.end()

  } catch (error) {
    console.error('❌ Wallet funding error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}
