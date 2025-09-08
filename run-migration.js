// Simple JavaScript migration script
const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function runMigration() {
  console.log('🔄 Starting migration: Add name columns to users_profiles table');

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Add the new columns
    console.log('📄 Adding new columns...');
    await client.query(`
      ALTER TABLE public.users_profiles 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(200)
    `);

    // Create index
    console.log('📄 Creating index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_profiles_names 
      ON public.users_profiles (first_name, last_name)
    `);

    // Update existing records
    console.log('📄 Updating existing records...');
    await client.query(`
      UPDATE public.users_profiles 
      SET 
        full_name = (
          SELECT display_name 
          FROM auth.users 
          WHERE auth.users.id = users_profiles.user_id
        ),
        first_name = (
          CASE 
            WHEN (SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id) IS NOT NULL 
            THEN SPLIT_PART((SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id), ' ', 1)
            ELSE NULL
          END
        ),
        last_name = (
          CASE 
            WHEN (SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id) IS NOT NULL 
            AND ARRAY_LENGTH(STRING_TO_ARRAY((SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id), ' '), 1) > 1
            THEN ARRAY_TO_STRING(
              (STRING_TO_ARRAY((SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id), ' '))[2:], 
              ' '
            )
            ELSE NULL
          END
        )
      WHERE 
        first_name IS NULL 
        AND last_name IS NULL 
        AND full_name IS NULL
    `);

    console.log('✅ Migration completed successfully!');
    
    // Verify the results
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_profiles,
        COUNT(first_name) as profiles_with_first_name,
        COUNT(last_name) as profiles_with_last_name,
        COUNT(full_name) as profiles_with_full_name
      FROM public.users_profiles
    `);
    
    console.log('📊 Migration Results:', result.rows[0]);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🎉 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
