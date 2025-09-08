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

async function testWalletBalanceAPIs() {
  console.log('🧪 Testing Both Wallet Balance APIs');
  console.log('=' .repeat(50));

  const pool = createDirectConnection();
  
  try {
    const email = 'samuelekelejnr@gmail.com';

    // Test 1: Check what's in auth.users 
    console.log('\n🔐 1. Auth Users Table:');
    const authUsersResult = await pool.query(`
      SELECT id, email, display_name 
      FROM auth.users 
      WHERE email = $1;
    `, [email]);
    
    if (authUsersResult.rows.length > 0) {
      const authUser = authUsersResult.rows[0];
      console.log(`  ✅ Found in auth.users: ${authUser.id}`);
      console.log(`      Email: ${authUser.email}`);
      console.log(`      Name: ${authUser.display_name}`);
    } else {
      console.log('  ❌ Not found in auth.users');
    }

    // Test 2: Check what's in users table
    console.log('\n👤 2. Users Table:');
    const usersResult = await pool.query(`
      SELECT id, email, display_name 
      FROM users 
      WHERE email = $1;
    `, [email]);
    
    if (usersResult.rows.length > 0) {
      const user = usersResult.rows[0];
      console.log(`  ✅ Found in users: ${user.id}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Name: ${user.display_name}`);
    } else {
      console.log('  ❌ Not found in users table');
    }

    // Test 3: Check users_profiles with auth.users
    console.log('\n💰 3. Wallet Balance (auth.users approach):');
    const authWalletResult = await pool.query(`
      SELECT u.id, u.email, up.wallet_balance
      FROM auth.users u 
      LEFT JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1;
    `, [email]);
    
    if (authWalletResult.rows.length > 0) {
      const result = authWalletResult.rows[0];
      console.log(`  ✅ Auth approach: ₦${result.wallet_balance || 0}`);
      console.log(`      User ID: ${result.id}`);
    } else {
      console.log('  ❌ No result with auth.users approach');
    }

    // Test 4: Check users_profiles with users table
    console.log('\n💰 4. Wallet Balance (users table approach):');
    const usersWalletResult = await pool.query(`
      SELECT u.id, u.email, up.wallet_balance
      FROM users u 
      LEFT JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1;
    `, [email]);
    
    if (usersWalletResult.rows.length > 0) {
      const result = usersWalletResult.rows[0];
      console.log(`  ✅ Users approach: ₦${result.wallet_balance || 0}`);
      console.log(`      User ID: ${result.id}`);
    } else {
      console.log('  ❌ No result with users table approach');
    }

    // Test 5: Check all profiles
    console.log('\n📋 5. All User Profiles:');
    const allProfilesResult = await pool.query(`
      SELECT user_id, email, first_name, last_name, full_name, wallet_balance
      FROM users_profiles 
      WHERE email = $1 OR user_id IN (
        SELECT id FROM auth.users WHERE email = $1
        UNION
        SELECT id FROM users WHERE email = $1
      );
    `, [email]);
    
    console.log(`  Found ${allProfilesResult.rows.length} profiles:`);
    allProfilesResult.rows.forEach(profile => {
      console.log(`    - User ID: ${profile.user_id}`);
      console.log(`      Email: ${profile.email}`);
      console.log(`      Name: ${profile.first_name} ${profile.last_name}`);
      console.log(`      Balance: ₦${profile.wallet_balance || 0}`);
      console.log('      ---');
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the test
testWalletBalanceAPIs().catch(console.error);
