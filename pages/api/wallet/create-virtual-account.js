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

    // Get user profile - using auth.users table (correct table for authenticated users)
    const userQuery = `
      SELECT 
        u.id, 
        u.email, 
        u.display_name,
        up.phone, 
        up.wallet_balance
      FROM auth.users u 
      LEFT JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1
    `
    const userResult = await client.query(userQuery, [session.user.email])

    if (userResult.rows.length === 0) {
      await client.end()
      console.log(`❌ User not found in users table for email: ${session.user.email}`)
      return res.status(404).json({ 
        error: 'User profile not found. Please complete your profile setup first.',
        code: 'USER_PROFILE_REQUIRED',
        action: 'Please visit your profile page to complete your account setup, then try again.'
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

    // Create virtual account with Flutterwave using NIN
    // Flutterwave accepts both BVN and NIN for static virtual account creation
    try {
      console.log('🏦 Creating virtual account with Flutterwave using NIN...')
      
      const payload = {
        email: user.email,
        is_permanent: true,
        bvn: nin, // Flutterwave API uses 'bvn' field but accepts NIN values
        tx_ref: `VA_${Date.now()}_${user.id}`
      }

      console.log('📤 Flutterwave payload:', JSON.stringify(payload, null, 2))

      const response = await flw.VirtualAcct.create(payload)
      console.log('📡 Flutterwave response:', response)

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
            is_active
          ) VALUES ($1, $2, $3, $4, $5, $6)
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

        return res.status(200).json({
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
        return res.status(400).json({ 
          error: 'Failed to create virtual account', 
          details: response.message || 'Unknown error'
        })
      }

    } catch (flutterwaveError) {
      console.error('❌ Flutterwave API error:', flutterwaveError.message)
      
      // If Flutterwave fails, fall back to development mode
      const isDevelopmentMode = process.env.FLUTTERWAVE_SECRET_KEY?.includes('TEST') || 
                               process.env.FLUTTERWAVE_SECRET_KEY?.includes('SANDBOXDEMOKEY') ||
                               process.env.NODE_ENV === 'development'

      if (isDevelopmentMode) {
        console.log('🧪 Flutterwave failed, using development mode fallback')
        
        // Generate mock virtual account data for development
        const mockAccountNumber = `90${Math.floor(Math.random() * 100000000)}`
        const mockBankName = 'Test Bank (Development)'
        const mockReference = `MOCK_VA_${Date.now()}`
        
        // Store virtual account details in virtual_accounts table
        const insertQuery = `
          INSERT INTO virtual_accounts (
            user_id, 
            account_number, 
            bank_name, 
            account_name, 
            monnify_reference, 
            is_active
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `
        
        const insertResult = await client.query(insertQuery, [
          user.id,
          mockAccountNumber,
          mockBankName,
          `${user.display_name || 'User ProVenv'}`,
          mockReference,
          true
        ])

        // Update user profile with NIN
        const updateUserQuery = 'UPDATE users_profiles SET nin = $1, updated_at = NOW() WHERE user_id = $2'
        await client.query(updateUserQuery, [nin, user.id])

        await client.end()

        console.log('✅ Mock virtual account created successfully:', mockAccountNumber)

        return res.status(200).json({
          success: true,
          message: 'Mock virtual account created for development (Flutterwave unavailable)',
          data: {
            account_number: mockAccountNumber,
            bank_name: mockBankName,
            account_name: `${user.display_name || 'User ProVenv'}`,
            reference: mockReference,
            virtual_account: insertResult.rows[0],
            note: 'This is a mock account for development. Use wallet-test page for funding.'
          }
        })
      } else {
        // Production mode - return the actual error
        await client.end()
        return res.status(400).json({ 
          error: 'Failed to create virtual account with Flutterwave', 
          details: flutterwaveError.message,
          suggestion: 'Please verify your NIN and try again, or contact support.'
        })
      }
    }

  } catch (error) {
    console.error('❌ Error creating virtual account:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}
