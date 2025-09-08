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

async function findTheRightUser() {
  console.log('🔍 Finding The User With ₦3,000 Balance');
  console.log('=' .repeat(50));

  const pool = createDirectConnection();
  
  try {
    // The user ID from your successful transaction
    const transactionUserId = '2a18397c-8294-4d2d-8863-21be13142b97';
    
    console.log('\n💰 1. Check the user from transaction:');
    console.log(`Transaction User ID: ${transactionUserId}`);
    
    // Check what user this actually is
    const userProfileResult = await pool.query(`
      SELECT user_id, email, first_name, last_name, full_name, wallet_balance
      FROM users_profiles 
      WHERE user_id = $1;
    `, [transactionUserId]);
    
    if (userProfileResult.rows.length > 0) {
      const profile = userProfileResult.rows[0];
      console.log(`  ✅ Found profile:`);
      console.log(`      User ID: ${profile.user_id}`);
      console.log(`      Email: ${profile.email}`);
      console.log(`      Name: ${profile.full_name}`);
      console.log(`      Balance: ₦${profile.wallet_balance}`);
    } else {
      console.log('  ❌ No profile found for transaction user ID');
    }

    // Check both auth.users and users tables for this ID
    console.log('\n🔐 2. Check auth.users for this ID:');
    const authUserResult = await pool.query(`
      SELECT id, email, display_name 
      FROM auth.users 
      WHERE id = $1;
    `, [transactionUserId]);
    
    if (authUserResult.rows.length > 0) {
      const authUser = authUserResult.rows[0];
      console.log(`  ✅ Found in auth.users: ${authUser.email}`);
      console.log(`      Name: ${authUser.display_name}`);
    } else {
      console.log('  ❌ Not found in auth.users');
    }

    console.log('\n👤 3. Check users table for this ID:');
    const usersResult = await pool.query(`
      SELECT id, email, display_name 
      FROM users 
      WHERE id = $1;
    `, [transactionUserId]);
    
    if (usersResult.rows.length > 0) {
      const user = usersResult.rows[0];
      console.log(`  ✅ Found in users: ${user.email}`);
      console.log(`      Name: ${user.display_name}`);
    } else {
      console.log('  ❌ Not found in users table');
    }

    // Check all profiles with wallet balance > 0
    console.log('\n💎 4. All Profiles with Balance > 0:');
    const richProfilesResult = await pool.query(`
      SELECT user_id, email, first_name, last_name, full_name, wallet_balance
      FROM users_profiles 
      WHERE wallet_balance > 0
      ORDER BY wallet_balance DESC;
    `);
    
    console.log(`  Found ${richProfilesResult.rows.length} profiles with positive balance:`);
    richProfilesResult.rows.forEach(profile => {
      console.log(`    - User ID: ${profile.user_id}`);
      console.log(`      Email: ${profile.email || 'NULL'}`);
      console.log(`      Name: ${profile.full_name || (profile.first_name + ' ' + profile.last_name)}`);
      console.log(`      Balance: ₦${profile.wallet_balance}`);
      console.log('      ---');
    });

    // Check recent wallet transactions
    console.log('\n💸 5. Recent Wallet Transactions:');
    const transactionsResult = await pool.query(`
      SELECT user_id, amount, balance_before, balance_after, reference, description, created_at
      FROM wallet_transactions 
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    
    console.log(`  Found ${transactionsResult.rows.length} recent transactions:`);
    transactionsResult.rows.forEach(tx => {
      console.log(`    - User ID: ${tx.user_id}`);
      console.log(`      Amount: ₦${tx.amount}`);
      console.log(`      Before: ₦${tx.balance_before} → After: ₦${tx.balance_after}`);
      console.log(`      Reference: ${tx.reference}`);
      console.log(`      Description: ${tx.description}`);
      console.log(`      Date: ${tx.created_at}`);
      console.log('      ---');
    });

  } catch (error) {
    console.error('❌ Search failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the search
findTheRightUser().catch(console.error);
