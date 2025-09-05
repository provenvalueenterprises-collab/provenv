import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

// PostgreSQL connection pool using credentials from .env.nextauth
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  let client;
  try {
    client = await pool.connect()

    // Check for orphaned users_profiles records
    console.log('🔍 Checking for orphaned user profile records...')
    
    // First, let's see what table structure we have
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%users_%profile%'
      ORDER BY table_name
    `
    const tablesResult = await client.query(tablesQuery)
    console.log('📋 User profile tables found:', tablesResult.rows)

    // Check users_profiles (plural) if it exists
    let orphanedProfiles = []
    try {
      const orphanedQuery = `
        SELECT up.*, au.id as auth_user_exists
        FROM public.users_profiles up
        LEFT JOIN auth.users au ON up.email = au.email
        WHERE au.id IS NULL
        ORDER BY up.created_at DESC
      `
      const orphanedResult = await client.query(orphanedQuery)
      orphanedProfiles = orphanedResult.rows
      console.log(`🔍 Found ${orphanedProfiles.length} orphaned records in users_profiles`)
    } catch (err) {
      console.log('❌ users_profiles table check failed:', err instanceof Error ? err.message : String(err))
    }

    // Check users_profile (singular) if it exists  
    let orphanedProfilesSingular = []
    try {
      const orphanedQuery2 = `
        SELECT up.*, au.id as auth_user_exists
        FROM public.users_profile up
        LEFT JOIN auth.users au ON up.user_id = au.id
        WHERE au.id IS NULL
        ORDER BY up.created_at DESC
      `
      const orphanedResult2 = await client.query(orphanedQuery2)
      orphanedProfilesSingular = orphanedResult2.rows
      console.log(`🔍 Found ${orphanedProfilesSingular.length} orphaned records in users_profile`)
    } catch (err) {
      console.log('❌ users_profile table check failed:', err instanceof Error ? err.message : String(err))
    }

    // Count total auth users for reference
    const authUsersQuery = 'SELECT COUNT(*) as total FROM auth.users'
    const authUsersResult = await client.query(authUsersQuery)
    const totalAuthUsers = authUsersResult.rows[0].total

    return res.status(200).json({
      success: true,
      tables_found: tablesResult.rows,
      total_auth_users: totalAuthUsers,
      orphaned_profiles_plural: orphanedProfiles,
      orphaned_profiles_singular: orphanedProfilesSingular,
      summary: {
        orphaned_in_plural_table: orphanedProfiles.length,
        orphaned_in_singular_table: orphanedProfilesSingular.length
      }
    })

  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Database error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      client.release()
    }
  }
}
