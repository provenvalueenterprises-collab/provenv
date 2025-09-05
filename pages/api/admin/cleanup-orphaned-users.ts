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
  let client;
  try {
    client = await pool.connect()

    if (req.method === 'GET') {
      // Check for orphaned users_profiles records
      console.log('🔍 Checking for orphaned user profile records...')
      
      // Find users_profiles records that don't have corresponding auth.users records
      const orphanedQuery = `
        SELECT up.id, up.email, up.phone, up.first_name, up.last_name, up.created_at
        FROM public.users_profiles up
        LEFT JOIN auth.users au ON up.email = au.email
        WHERE au.id IS NULL
        ORDER BY up.created_at DESC
      `
      const orphanedResult = await client.query(orphanedQuery)
      const orphanedProfiles = orphanedResult.rows
      console.log(`🔍 Found ${orphanedProfiles.length} orphaned records in users_profiles`)

      // Count total records for reference
      const totalProfilesQuery = 'SELECT COUNT(*) as total FROM public.users_profiles'
      const totalProfilesResult = await client.query(totalProfilesQuery)
      const totalProfiles = totalProfilesResult.rows[0].total

      const totalAuthUsersQuery = 'SELECT COUNT(*) as total FROM auth.users'
      const totalAuthUsersResult = await client.query(totalAuthUsersQuery)
      const totalAuthUsers = totalAuthUsersResult.rows[0].total

      return res.status(200).json({
        success: true,
        orphaned_profiles: orphanedProfiles,
        summary: {
          total_profiles: parseInt(totalProfiles),
          total_auth_users: parseInt(totalAuthUsers),
          orphaned_count: orphanedProfiles.length
        }
      })

    } else if (req.method === 'DELETE') {
      // Clean up orphaned records
      const { confirm } = req.body

      if (confirm !== 'DELETE_ORPHANED_USERS') {
        return res.status(400).json({
          success: false,
          message: 'Confirmation required. Send { "confirm": "DELETE_ORPHANED_USERS" } to proceed.'
        })
      }

      console.log('🗑️ Starting cleanup of orphaned user profile records...')

      // First, get the orphaned records for logging
      const orphanedQuery = `
        SELECT up.id, up.email, up.phone, up.first_name, up.last_name
        FROM public.users_profiles up
        LEFT JOIN auth.users au ON up.email = au.email
        WHERE au.id IS NULL
      `
      const orphanedResult = await client.query(orphanedQuery)
      const orphanedProfiles = orphanedResult.rows
      
      if (orphanedProfiles.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No orphaned records found to delete',
          deleted_count: 0
        })
      }

      // Delete orphaned records from users_profiles
      const deleteQuery = `
        DELETE FROM public.users_profiles up
        WHERE NOT EXISTS (
          SELECT 1 FROM auth.users au WHERE au.email = up.email
        )
      `
      const deleteResult = await client.query(deleteQuery)
      const deletedCount = deleteResult.rowCount

      console.log(`✅ Deleted ${deletedCount} orphaned user profile records`)

      // Also clean up related data for these orphaned users
      const orphanedUserIds = orphanedProfiles.map(p => p.id)
      
      if (orphanedUserIds.length > 0) {
        // Clean up thrift_accounts
        const deleteThriftAccountsQuery = `
          DELETE FROM public.thrift_accounts 
          WHERE user_id = ANY($1::uuid[])
        `
        const thriftDeleteResult = await client.query(deleteThriftAccountsQuery, [orphanedUserIds])
        
        // Clean up wallet_transactions
        const deleteTransactionsQuery = `
          DELETE FROM public.wallet_transactions 
          WHERE user_id = ANY($1::uuid[])
        `
        const transDeleteResult = await client.query(deleteTransactionsQuery, [orphanedUserIds])

        console.log(`🧹 Also cleaned up ${thriftDeleteResult.rowCount} thrift accounts and ${transDeleteResult.rowCount} transactions`)
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully cleaned up orphaned user data',
        deleted_profiles: deletedCount,
        deleted_thrift_accounts: orphanedUserIds.length > 0 ? deleteResult.rowCount : 0,
        deleted_transactions: orphanedUserIds.length > 0 ? deleteResult.rowCount : 0,
        cleaned_users: orphanedProfiles
      })

    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }

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
