// Script to run the database migration for adding name columns
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

async function runMigration() {
  console.log('🔄 Starting migration: Add name columns to users_profiles table')

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'add-name-columns-migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Running migration SQL...')
    
    // Execute the migration
    await client.query(migrationSQL)
    
    console.log('✅ Migration completed successfully!')
    
    // Verify the results
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_profiles,
        COUNT(first_name) as profiles_with_first_name,
        COUNT(last_name) as profiles_with_last_name,
        COUNT(full_name) as profiles_with_full_name
      FROM public.users_profiles
    `)
    
    console.log('📊 Migration Results:', result.rows[0])

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🎉 Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error)
      process.exit(1)
    })
}

export { runMigration }
