import { Client } from 'pg'
const Flutterwave = require('flutterwave-node-v3')

const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const signature = req.headers['verif-hash']
    
    if (!signature || signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
      return res.status(401).json({ error: 'Unauthorized webhook' })
    }

    const payload = req.body

    console.log('🔔 Received Flutterwave webhook:', payload.event)

    // Handle successful transfer/payment events
    if (payload.event === 'transfer.completed' || payload.event === 'charge.completed') {
      const { data } = payload

      if (data.status === 'successful') {
        console.log('💰 Processing successful payment:', data.tx_ref, 'Amount:', data.amount)

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

        // Find user by virtual account number or transaction reference
        let userQuery, queryParams

        if (data.account_number) {
          userQuery = `
            SELECT u.id, u.email, up.wallet_balance, va.account_number as virtual_account_number 
            FROM users u 
            JOIN users_profiles up ON u.id = up.user_id
            JOIN virtual_accounts va ON u.id = va.user_id 
            WHERE va.account_number = $1 AND va.is_active = true
          `
          queryParams = [data.account_number]
        } else {
          // Extract user ID from transaction reference if available
          const userIdMatch = data.tx_ref.match(/VA_\d+_(.+)/)
          if (userIdMatch) {
            userQuery = `
              SELECT u.id, u.email, up.wallet_balance 
              FROM users u 
              JOIN users_profiles up ON u.id = up.user_id 
              WHERE u.id = $1
            `
            queryParams = [userIdMatch[1]]
          } else {
            await client.end()
            return res.status(400).json({ error: 'Cannot identify user' })
          }
        }

        const userResult = await client.query(userQuery, queryParams)

        if (userResult.rows.length === 0) {
          await client.end()
          return res.status(404).json({ error: 'User not found' })
        }

        const user = userResult.rows[0]
        const currentBalance = parseFloat(user.wallet_balance || 0)
        const newBalance = currentBalance + parseFloat(data.amount)

        // Update wallet balance
        const updateQuery = `
          UPDATE users_profiles 
          SET 
            wallet_balance = $1,
            updated_at = NOW()
          WHERE user_id = $2
          RETURNING *
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
        `
        
        await client.query(transactionQuery, [
          user.id,
          'credit',
          data.amount,
          data.tx_ref,
          'completed',
          `Wallet funding via virtual account - ${data.account_number || 'Transfer'}`
        ])

        await client.end()

        console.log(`✅ Wallet credited: ${user.email} +₦${data.amount} (New balance: ₦${newBalance})`)

        res.status(200).json({ success: true, message: 'Wallet credited successfully' })
      } else {
        res.status(200).json({ success: true, message: 'Transaction not successful' })
      }
    } else {
      res.status(200).json({ success: true, message: 'Event not handled' })
    }

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
