import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { Client } from 'pg'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('🏦 Fetching virtual account details for:', session.user.email)

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

    // Get user profile and virtual account details
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.display_name,
        up.wallet_balance,
        up.nin,
        va.id as virtual_account_id,
        va.account_number,
        va.bank_name,
        va.account_name,
        va.monnify_reference,
        va.is_active,
        va.created_at as virtual_account_created_at
      FROM auth.users u
      LEFT JOIN users_profiles up ON u.id = up.user_id
      LEFT JOIN virtual_accounts va ON u.id = va.user_id AND va.is_active = true
      WHERE u.email = $1
    `
    const userResult = await client.query(userQuery, [session.user.email])

    if (userResult.rows.length === 0) {
      // User not found
      console.log('🔄 User not found in database')
      await client.end()
      return res.status(404).json({ 
        error: 'User not found. Please contact support to set up your account.',
        code: 'USER_NOT_FOUND'
      })
    }

    const user = userResult.rows[0]

    await client.end()

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        walletBalance: parseFloat(user.wallet_balance || 0),
        hasNin: !!user.nin
      },
      virtualAccount: user.virtual_account_id ? {
        id: user.virtual_account_id,
        accountNumber: user.account_number,
        bankName: user.bank_name,
        accountName: user.account_name,
        accountReference: user.monnify_reference,
        isActive: user.is_active,
        createdAt: user.virtual_account_created_at
      } : null
    }

    console.log('📤 Virtual Account API Response:', JSON.stringify(responseData, null, 2))

    res.status(200).json(responseData)

  } catch (error) {
    console.error('❌ Error fetching virtual account:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
