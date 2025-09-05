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

    console.log('🔗 Fetching wallet balance from PostgreSQL...')

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

    // Get user by email
    const userQuery = 'SELECT u.id, up.wallet_balance FROM users u LEFT JOIN users_profiles up ON u.id = up.user_id WHERE u.email = $1'
    const userResult = await client.query(userQuery, [session.user.email])

    if (userResult.rows.length === 0) {
      // Create user and profile if they don't exist
      console.log('🔄 Creating user and profile for wallet balance check...')
      
      const insertUserQuery = `
        INSERT INTO users (id, email, display_name, created_at, updated_at, email_verified, disabled, locale, phone_number_verified, otp_hash_expires_at, default_role, is_anonymous, ticket_expires_at)
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), true, false, 'en', false, NOW() + INTERVAL '1 hour', 'user', false, NOW() + INTERVAL '1 hour')
        RETURNING id
      `
      const newUserResult = await client.query(insertUserQuery, [session.user.email, session.user.name || session.user.email])
      const newUserId = newUserResult.rows[0].id
      
      const insertProfileQuery = `
        INSERT INTO users_profiles (id, user_id, wallet_balance, bonus_wallet, total_referrals, fast_track_eligible, fast_track_activated, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, 0.00, 0.00, 0, false, false, NOW(), NOW())
      `
      await client.query(insertProfileQuery, [newUserId])
      
      await client.end()
      return res.status(200).json({ 
        balance: 0,
        userId: newUserId
      })
    }

    const user = userResult.rows[0]
    const walletBalance = parseFloat(user.wallet_balance || 0)

    await client.end()

    res.status(200).json({ 
      balance: walletBalance,
      userId: user.id
    })

  } catch (error) {
    console.error('❌ Error fetching wallet balance:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
