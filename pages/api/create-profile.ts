// API to create missing user profile
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log(`🏗️ Creating user profile for: ${session.user.email}`)

    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    })

    await client.connect()

    // Get user from auth.users
    const userQuery = `SELECT id, email FROM auth.users WHERE email = $1`
    const userResult = await client.query(userQuery, [session.user.email])
    
    if (userResult.rows.length === 0) {
      await client.end()
      return res.status(404).json({ error: 'User not found in auth.users' })
    }

    const user = userResult.rows[0]
    console.log(`👤 Found user: ${user.id}`)

    // Check if profile already exists
    const checkProfileQuery = `SELECT user_id FROM public.users_profiles WHERE user_id = $1`
    const existingProfile = await client.query(checkProfileQuery, [user.id])

    if (existingProfile.rows.length > 0) {
      await client.end()
      return res.status(200).json({ 
        message: 'Profile already exists',
        user_id: user.id 
      })
    }

    // Create user profile
    const createProfileQuery = `
      INSERT INTO public.users_profiles (
        user_id, 
        email,
        first_name,
        last_name,
        full_name,
        phone,
        wallet_balance, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `

    // Split the display name into first and last name
    const fullName = session.user.name || 'User'
    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || ''

    const profileData = [
      user.id,
      session.user.email,
      firstName,
      lastName,
      fullName,
      '08068478381', // Default phone from your dashboard data
      0.00 // Initial wallet balance
    ]

    const profileResult = await client.query(createProfileQuery, profileData)
    const newProfile = profileResult.rows[0]

    await client.end()

    console.log(`✅ Created user profile: ${newProfile.user_id}`)

    res.status(200).json({
      success: true,
      message: 'User profile created successfully',
      profile: newProfile
    })

  } catch (error) {
    console.error('❌ Create profile error:', error)
    res.status(500).json({ 
      error: 'Profile creation failed',
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
