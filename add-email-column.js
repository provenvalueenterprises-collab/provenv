// Script to add email column to users_profiles table
const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function addEmailColumn() {
  console.log('🔄 Adding email column to users_profiles table...');

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

    // Step 1: Add the email column
    console.log('📄 Step 1: Adding email column...');
    await client.query(`
      ALTER TABLE public.users_profiles 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255)
    `);
    console.log('   ✅ Email column added');

    // Step 2: Create index on email for better performance
    console.log('📄 Step 2: Creating index on email...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_profiles_email 
      ON public.users_profiles (email)
    `);
    console.log('   ✅ Email index created');

    // Step 3: Update existing records with email from auth.users
    console.log('📄 Step 3: Populating email from auth.users...');
    const updateResult = await client.query(`
      UPDATE public.users_profiles 
      SET email = (
        SELECT email 
        FROM auth.users 
        WHERE auth.users.id = users_profiles.user_id
      )
      WHERE email IS NULL
    `);
    console.log(`   ✅ Updated ${updateResult.rowCount} records with email`);

    // Step 4: Verify the results
    console.log('📄 Step 4: Verifying email column...');
    const verifyResult = await client.query(`
      SELECT 
        COUNT(*) as total_profiles,
        COUNT(email) as profiles_with_email,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as profiles_with_valid_email
      FROM public.users_profiles
    `);
    
    console.log('📊 Email Column Results:', verifyResult.rows[0]);

    // Step 5: Show sample data
    const sampleResult = await client.query(`
      SELECT user_id, email, first_name, last_name, full_name 
      FROM public.users_profiles 
      LIMIT 3
    `);
    
    if (sampleResult.rows.length > 0) {
      console.log('📋 Sample data:');
      sampleResult.rows.forEach((row, index) => {
        console.log(`   Row ${index + 1}: ${row.email} (${row.first_name} ${row.last_name})`);
      });
    } else {
      console.log('📋 No existing profile data found');
    }

    console.log('✅ Email column migration completed successfully!');

  } catch (error) {
    console.error('❌ Email column migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
addEmailColumn()
  .then(() => {
    console.log('🎉 Email column migration script completed');
    console.log('');
    console.log('✅ Benefits:');
    console.log('   • Email directly accessible in users_profiles table');
    console.log('   • No need for JOINs when fetching profile data');
    console.log('   • Better query performance');
    console.log('   • Easier data management');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Email column migration script failed:', error);
    process.exit(1);
  });
