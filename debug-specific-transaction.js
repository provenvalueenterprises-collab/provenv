// debug-specific-transaction.js - Debug specific recent transaction
require('dotenv').config();
const { Client } = require('pg');

async function debugSpecificTransaction() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Find the specific transaction from today
    console.log('\n🔍 Checking today\'s transaction details:');
    const todayTx = await client.query(`
      SELECT 
        wt.*,
        u.email,
        u.display_name,
        u.id as user_id
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      WHERE wt.reference = 'TEST_1757153164401_115qq0pwp'
      ORDER BY wt.created_at DESC;
    `);
    
    if (todayTx.rows.length === 0) {
      console.log('❌ Transaction not found');
      return;
    }

    const tx = todayTx.rows[0];
    console.log('📋 Transaction Details:');
    console.log(`   ID: ${tx.id}`);
    console.log(`   User ID: ${tx.user_id}`);
    console.log(`   User: ${tx.display_name} (${tx.email})`);
    console.log(`   Amount: ₦${Number(tx.amount).toLocaleString()}`);
    console.log(`   Balance Before: ₦${Number(tx.balance_before).toLocaleString()}`);
    console.log(`   Balance After: ₦${Number(tx.balance_after).toLocaleString()}`);
    console.log(`   Status: ${tx.status}`);
    console.log(`   Created: ${tx.created_at}`);

    // Check the current wallet balance for this specific user
    console.log('\n💰 Current User Profile Wallet Balance:');
    const userProfile = await client.query(`
      SELECT 
        up.wallet_balance,
        up.updated_at,
        u.email,
        u.display_name
      FROM users_profiles up
      JOIN users u ON up.user_id = u.id
      WHERE u.id = $1;
    `, [tx.user_id]);

    if (userProfile.rows.length === 0) {
      console.log('❌ User profile not found!');
      
      // Check if user exists in users table
      const userCheck = await client.query(`
        SELECT id, email, display_name FROM users WHERE id = $1;
      `, [tx.user_id]);
      
      if (userCheck.rows.length > 0) {
        console.log('✅ User exists in users table:', userCheck.rows[0]);
        console.log('❌ But no profile in users_profiles table!');
        
        // Check if there are any profiles for this user
        const profileCheck = await client.query(`
          SELECT * FROM users_profiles WHERE user_id = $1;
        `, [tx.user_id]);
        
        console.log('Profile check result:', profileCheck.rows);
      }
    } else {
      const profile = userProfile.rows[0];
      console.log(`   Current Balance: ₦${Number(profile.wallet_balance).toLocaleString()}`);
      console.log(`   Profile Updated: ${profile.updated_at}`);
      console.log(`   User: ${profile.display_name} (${profile.email})`);
    }

    // Check all recent transactions for this user
    console.log('\n📝 All Recent Transactions for this User:');
    const allUserTx = await client.query(`
      SELECT 
        reference,
        amount,
        balance_before,
        balance_after,
        status,
        created_at,
        description
      FROM wallet_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5;
    `, [tx.user_id]);

    allUserTx.rows.forEach((userTx, index) => {
      console.log(`\n${index + 1}. Reference: ${userTx.reference}`);
      console.log(`   Amount: ₦${Number(userTx.amount).toLocaleString()}`);
      console.log(`   Before: ₦${Number(userTx.balance_before).toLocaleString()} → After: ₦${Number(userTx.balance_after).toLocaleString()}`);
      console.log(`   Status: ${userTx.status}`);
      console.log(`   Description: ${userTx.description}`);
      console.log(`   Date: ${userTx.created_at}`);
    });

    // Check if there's a mismatch between last transaction balance_after and current profile balance
    if (allUserTx.rows.length > 0) {
      const lastTx = allUserTx.rows[0];
      const currentBalance = userProfile.rows[0]?.wallet_balance || 0;
      
      console.log('\n⚠️ Balance Comparison:');
      console.log(`   Last Transaction Balance After: ₦${Number(lastTx.balance_after).toLocaleString()}`);
      console.log(`   Current Profile Balance: ₦${Number(currentBalance).toLocaleString()}`);
      
      if (Number(lastTx.balance_after) !== Number(currentBalance)) {
        console.log('❌ MISMATCH DETECTED! Transaction says one thing, profile says another.');
      } else {
        console.log('✅ Balances match correctly.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n👋 Connection closed');
  }
}

debugSpecificTransaction();
