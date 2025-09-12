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

    // Check what schemas exist
    const schemasQuery = `SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('public', 'auth')`
    const schemasResult = await client.query(schemasQuery)
    results.schemas = schemasResult.rows

    // Check tables in public schema
    const publicTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%user%'
    `
    const publicTablesResult = await client.query(publicTablesQuery)
    results.publicUserTables = publicTablesResult.rows

    // Check tables in auth schema (if it exists)
    try {
      const authTablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'auth'
      `
      const authTablesResult = await client.query(authTablesQuery)
      results.authTables = authTablesResult.rows
    } catch (authError) {
      results.authTables = { error: 'Auth schema does not exist or is not accessible' }
    }

    // Check columns in users table (public schema)
    try {
      const usersColumnsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      `
      const usersColumnsResult = await client.query(usersColumnsQuery)
      results.usersTableColumns = usersColumnsResult.rows
    } catch (error) {
      results.usersTableColumns = { error: 'Users table does not exist' }
    }

    // Check columns in users_profiles table
    try {
      const profilesColumnsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users_profiles'
      `
      const profilesColumnsResult = await client.query(profilesColumnsQuery)
      results.usersProfilesColumns = profilesColumnsResult.rows
    } catch (error) {
      results.usersProfilesColumns = { error: 'Users_profiles table does not exist' }
    }

    // Try to check current user with different approaches
    const testQueries = []

    // Test 1: Try public.users
    try {
      const test1 = await client.query('SELECT id, email, name FROM users WHERE email = $1 LIMIT 1', [session.user.email])
      testQueries.push({ query: 'public.users', success: true, rows: test1.rows.length })
    } catch (error) {
      testQueries.push({ query: 'public.users', success: false, error: error.message })
    }

    // Test 2: Try auth.users
    try {
      const test2 = await client.query('SELECT id, email FROM auth.users WHERE email = $1 LIMIT 1', [session.user.email])
      testQueries.push({ query: 'auth.users', success: true, rows: test2.rows.length })
    } catch (error) {
      testQueries.push({ query: 'auth.users', success: false, error: error.message })
    }

    results.testQueries = testQueries

    await client.end()

    return res.status(200).json({
      sessionEmail: session.user.email,
      databaseSchemaInfo: results,
      recommendation: 'Use the schema analysis above to determine correct table structure'
    })

  } catch (error) {
    console.error('Schema check error:', error)
    return res.status(500).json({ error: error.message })
  }
}
