require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true'
});

async function debugLogin() {
  try {
    console.log('🔐 DEBUGGING LOGIN ISSUE...\n');
    
    const testEmail = 'realsammy86@gmail.com';
    const testPassword = 'password123'; // Replace with actual password you're trying
    
    console.log('🔍 Step 1: Check if user exists in auth.users table');
    const authUserQuery = `
      SELECT id, email, encrypted_password, email_confirmed_at, created_at
      FROM auth.users 
      WHERE email = $1
    `;
    const authUserResult = await pool.query(authUserQuery, [testEmail]);
    
    if (authUserResult.rows.length === 0) {
      console.log('❌ User NOT found in auth.users table');
      console.log('   This means the user was never registered properly');
      
      // Check if user exists in user_profiles
      const profileCheck = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email = $1)',
        [testEmail]
      );
      
      if (profileCheck.rows.length === 0) {
        console.log('❌ User also NOT found in user_profiles table');
        console.log('   SOLUTION: User needs to register first');
      }
      return;
    }
    
    const authUser = authUserResult.rows[0];
    console.log('✅ User found in auth.users:');
    console.log(`   ID: ${authUser.id}`);
    console.log(`   Email: ${authUser.email}`);
    console.log(`   Email Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   Created: ${authUser.created_at}`);
    console.log(`   Has Password Hash: ${authUser.encrypted_password ? 'Yes' : 'No'}`);
    
    console.log('\n🔍 Step 2: Check user profile data');
    const profileQuery = `
      SELECT up.*, u.email as auth_email
      FROM user_profiles up
      JOIN auth.users u ON up.user_id = u.id
      WHERE u.email = $1
    `;
    const profileResult = await pool.query(profileQuery, [testEmail]);
    
    if (profileResult.rows.length === 0) {
      console.log('❌ User profile NOT found');
      console.log('   SOLUTION: Create user profile for this user');
    } else {
      const profile = profileResult.rows[0];
      console.log('✅ User profile found:');
      console.log(`   Phone: ${profile.phone || 'Not set'}`);
      console.log(`   Wallet Balance: ₦${profile.wallet_balance || 0}`);
      console.log(`   Referral Code: ${profile.referral_code || 'Not set'}`);
    }
    
    console.log('\n🔍 Step 3: Test password verification');
    if (authUser.encrypted_password) {
      console.log('Testing with password:', testPassword);
      
      // Test bcrypt comparison
      const isValidPassword = await bcrypt.compare(testPassword, authUser.encrypted_password);
      console.log(`Password valid: ${isValidPassword ? '✅ YES' : '❌ NO'}`);
      
      if (!isValidPassword) {
        console.log('\n🔧 TROUBLESHOOTING PASSWORD ISSUE:');
        console.log('   1. Make sure you\'re using the correct password');
        console.log('   2. The password might have been set through Nhost directly');
        console.log('   3. Try resetting the password');
        
        // Show password hash info (without revealing the actual hash)
        console.log(`   Password hash length: ${authUser.encrypted_password.length}`);
        console.log(`   Hash starts with: ${authUser.encrypted_password.substring(0, 10)}...`);
      }
    } else {
      console.log('❌ No password hash found');
      console.log('   SOLUTION: User needs to set a password');
    }
    
    console.log('\n🔍 Step 4: Check environment configuration');
    console.log('Environment check:');
    console.log(`   USE_NHOST: ${process.env.NEXT_PUBLIC_USE_NHOST}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST}`);
    console.log(`   DB connection: ${pool.totalCount > 0 ? 'Working' : 'Failed'}`);
    
    console.log('\n📝 SUMMARY:');
    if (authUserResult.rows.length > 0 && authUser.encrypted_password) {
      console.log('✅ User exists with password hash');
      console.log('🔐 Try logging in with the correct password');
      console.log('🌐 Make sure NEXT_PUBLIC_USE_NHOST=false in .env.local');
    } else {
      console.log('❌ Login issue identified');
      console.log('💡 Next steps: Create user account or reset password');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

debugLogin();
