import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { Client } from 'pg'

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    })

    await client.connect()

    const results = {}

    // Test 1: Check auth.users table
    try {
      const authUsersQuery = `SELECT id, email FROM auth.users WHERE email = $1`
      const authUsersResult = await client.query(authUsersQuery, [session.user.email])
      results.authUsers = {
        found: authUsersResult.rows.length > 0,
        data: authUsersResult.rows[0] || null
      }
    } catch (error) {
      results.authUsers = { error: error.message }
    }

    // Test 2: Check users table  
    try {
      const usersQuery = `SELECT id, email, name FROM users WHERE email = $1`
      const usersResult = await client.query(usersQuery, [session.user.email])
      results.users = {
        found: usersResult.rows.length > 0,
        data: usersResult.rows[0] || null
      }
    } catch (error) {
      results.users = { error: error.message }
    }

    // Test 3: Check users_profiles table
    try {
      const profilesQuery = `SELECT * FROM users_profiles WHERE user_id = $1 OR user_id = $2`
      const userIds = []
      if (results.authUsers?.data?.id) userIds.push(results.authUsers.data.id)
      if (results.users?.data?.id) userIds.push(results.users.data.id)
      
      if (userIds.length > 0) {
        const profilesResult = await client.query(profilesQuery, userIds)
        results.usersProfiles = {
          found: profilesResult.rows.length > 0,
          data: profilesResult.rows
        }
      } else {
        results.usersProfiles = { message: 'No user IDs to check' }
      }
    } catch (error) {
      results.usersProfiles = { error: error.message }
    }

    await client.end()

    return res.status(200).json({
      sessionEmail: session.user.email,
      tableCheck: results,
      recommendation: results.authUsers?.found ? 'Use auth.users table' : 'Use users table'
    })

  } catch (error) {
    console.error('Debug error:', error)
    return res.status(500).json({ error: error.message })
  }
}
