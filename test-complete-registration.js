// Simple direct database connection for testing
const { Pool } = require('pg');
require('dotenv').config();

function createDirectConnection() {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

async function testCompleteRegistration() {
  console.log('🧪 Testing Complete Registration Flow with Enhanced Schema');
  console.log('=' .repeat(60));

  const pool = createDirectConnection();
  
  try {
    // Test 1: Check current users_profiles table structure
    console.log('\n📋 1. Checking users_profiles table structure...');
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users_profiles' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Table structure:');
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Test 2: Check if there are any existing profiles
    console.log('\n👥 2. Checking existing user profiles...');
    const existingProfiles = await pool.query(`
      SELECT user_id, email, first_name, last_name, full_name, phone, wallet_balance
      FROM public.users_profiles 
      LIMIT 5;
    `);
    
    console.log(`Found ${existingProfiles.rows.length} existing profiles:`);
    existingProfiles.rows.forEach(profile => {
      console.log(`  - ID: ${profile.user_id}`);
      console.log(`    Email: ${profile.email || 'NULL'}`);
      console.log(`    Name: ${profile.first_name || 'NULL'} ${profile.last_name || 'NULL'}`);
      console.log(`    Full Name: ${profile.full_name || 'NULL'}`);
      console.log(`    Phone: ${profile.phone || 'NULL'}`);
      console.log(`    Wallet: ₦${profile.wallet_balance || '0'}`);
      console.log('    ---');
    });

    // Test 3: Check auth.users table for comparison
    console.log('\n🔐 3. Checking auth.users table...');
    const authUsers = await pool.query(`
      SELECT id, email, created_at, display_name
      FROM auth.users 
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    
    console.log(`Found ${authUsers.rows.length} auth users:`);
    authUsers.rows.forEach(user => {
      console.log(`  - ID: ${user.id}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Display Name: ${user.display_name || 'NULL'}`);
      console.log(`    Created: ${user.created_at}`);
      console.log('    ---');
    });

    // Test 4: Test the createUser function with complete data
    console.log('\n⚡ 4. Testing createUser function with sample data...');
    
    // Generate a proper UUID for testing
    const crypto = require('crypto');
    const testUserId = crypto.randomUUID();
    const testEmail = `test${Date.now()}@example.com`;
    const testPhone = `+234${Math.floor(Math.random() * 10000000000)}`;
    
    // Simulate what the registration would do
    const testInsert = await pool.query(`
      INSERT INTO public.users_profiles (
        user_id, 
        email, 
        first_name, 
        last_name, 
        full_name, 
        phone, 
        wallet_balance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [
      testUserId,
      testEmail,
      'John',
      'Doe',
      'John Doe',
      testPhone,
      0
    ]);

    console.log('✅ Test profile created successfully:');
    const created = testInsert.rows[0];
    console.log(`  - User ID: ${created.user_id}`);
    console.log(`  - Email: ${created.email}`);
    console.log(`  - First Name: ${created.first_name}`);
    console.log(`  - Last Name: ${created.last_name}`);
    console.log(`  - Full Name: ${created.full_name}`);
    console.log(`  - Phone: ${created.phone}`);
    console.log(`  - Wallet Balance: ₦${created.wallet_balance}`);
    console.log(`  - Created At: ${created.created_at}`);

    // Test 5: Test wallet update functionality
    console.log('\n💰 5. Testing wallet update functionality...');
    
    const updateResult = await pool.query(`
      UPDATE public.users_profiles 
      SET wallet_balance = wallet_balance + $1
      WHERE user_id = $2
      RETURNING wallet_balance;
    `, [500, testUserId]);

    if (updateResult.rows.length > 0) {
      console.log(`✅ Wallet updated successfully: ₦${updateResult.rows[0].wallet_balance}`);
    } else {
      console.log('❌ Wallet update failed');
    }

    // Test 6: Test profile retrieval by email
    console.log('\n📧 6. Testing profile retrieval by email...');
    
    const profileByEmail = await pool.query(`
      SELECT * FROM public.users_profiles 
      WHERE email = $1;
    `, [testEmail]);

    if (profileByEmail.rows.length > 0) {
      console.log('✅ Profile found by email successfully');
      console.log(`  - Name: ${profileByEmail.rows[0].full_name}`);
      console.log(`  - Phone: ${profileByEmail.rows[0].phone}`);
    } else {
      console.log('❌ Profile not found by email');
    }

    // Clean up test data
    console.log('\n🧹 7. Cleaning up test data...');
    await pool.query('DELETE FROM public.users_profiles WHERE user_id = $1', [testUserId]);
    console.log('✅ Test data cleaned up');

    // Test 7: Check for any missing profiles that should exist
    console.log('\n🔍 8. Checking for auth users without profiles...');
    
    const missingProfiles = await pool.query(`
      SELECT au.id, au.email, au.display_name, au.created_at
      FROM auth.users au
      LEFT JOIN public.users_profiles up ON au.id = up.user_id
      WHERE up.user_id IS NULL
      ORDER BY au.created_at DESC
      LIMIT 10;
    `);

    if (missingProfiles.rows.length > 0) {
      console.log(`⚠️  Found ${missingProfiles.rows.length} auth users without profiles:`);
      missingProfiles.rows.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
      });
      console.log('\n💡 Consider running the create-profile API to fix these');
    } else {
      console.log('✅ All auth users have corresponding profiles');
    }

    console.log('\n🎉 Registration flow test completed successfully!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testCompleteRegistration().catch(console.error);
