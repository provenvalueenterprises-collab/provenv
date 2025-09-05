import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { Client } from 'pg'
const Flutterwave = require('flutterwave-node-v3')

const flw = new Flutterwave(process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY)

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

    const { nin } = req.body

    if (!nin) {
      return res.status(400).json({ error: 'NIN is required' })
    }

    console.log('🏦 Creating virtual account with Flutterwave...')

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

    // Get user profile
    const userQuery = `
      SELECT u.id, u.email, u.display_name, up.phone, up.wallet_balance
      FROM users u 
      LEFT JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1
    `
    const userResult = await client.query(userQuery, [session.user.email])

    if (userResult.rows.length === 0) {
      // Skip automatic user creation since we don't know the exact schema
      // Return error instead of trying to create users
      await client.end()
      return res.status(404).json({ 
        error: 'User not found. Please contact support to set up your account.',
        code: 'USER_NOT_FOUND'
      })
    }

    const user = userResult.rows[0]

    // Check if user already has a virtual account
    const existingAccountQuery = 'SELECT * FROM virtual_accounts WHERE user_id = $1 AND is_active = true'
    const existingAccountResult = await client.query(existingAccountQuery, [user.id])

    if (existingAccountResult.rows.length > 0) {
      await client.end()
      return res.status(400).json({ error: 'User already has an active virtual account' })
    }

    // Create virtual account with Flutterwave - minimal required fields only
    const payload = {
      email: user.email,
      is_permanent: true,
      bvn: nin, // Using NIN as BVN for test purposes
      tx_ref: `VA_${Date.now()}_${user.id}`
    }

    console.log('🧪 Flutterwave payload:', JSON.stringify(payload, null, 2))

    const response = await flw.VirtualAcct.create(payload)

    if (response.status === 'success') {
      const virtualAccountData = response.data

      // Store virtual account details in virtual_accounts table
      const insertQuery = `
        INSERT INTO virtual_accounts (
          user_id, 
          account_number, 
          bank_name, 
          account_name, 
          monnify_reference, 
          is_active,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `
      
      const insertResult = await client.query(insertQuery, [
        user.id,
        virtualAccountData.account_number,
        virtualAccountData.bank_name,
        `${user.display_name || 'User ProVenv'}`,
        virtualAccountData.flw_ref,
        true
      ])

      // Update user profile with NIN
      const updateUserQuery = 'UPDATE users_profiles SET nin = $1, updated_at = NOW() WHERE user_id = $2'
      await client.query(updateUserQuery, [nin, user.id])

      await client.end()

      console.log('✅ Virtual account created successfully:', virtualAccountData.account_number)

      res.status(200).json({
        success: true,
        data: {
          account_number: virtualAccountData.account_number,
          bank_name: virtualAccountData.bank_name,
          account_name: `${user.display_name || 'User ProVenv'}`,
          reference: virtualAccountData.flw_ref,
          virtual_account: insertResult.rows[0]
        }
      })

    } else {
      await client.end()
      console.error('❌ Flutterwave virtual account creation failed:', response)
      res.status(400).json({ 
        error: 'Failed to create virtual account', 
        details: response.message || 'Unknown error'
      })
    }

  } catch (error) {
    console.error('❌ Error creating virtual account:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}
