// debug-payment-verification.js - Debug payment verification process
require('dotenv').config();
const { Client } = require('pg');

async function debugPaymentVerification() {
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

    // Check recent wallet transactions
    console.log('\n📋 Recent Wallet Transactions (last 10):');
    const recentTxResult = await client.query(`
      SELECT 
        wt.*,
        u.email,
        u.display_name
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      ORDER BY wt.created_at DESC
      LIMIT 10;
    `);
    
    if (recentTxResult.rows.length === 0) {
      console.log('❌ No wallet transactions found');
    } else {
      recentTxResult.rows.forEach((tx, index) => {
        console.log(`\n${index + 1}. Transaction ID: ${tx.id}`);
        console.log(`   User: ${tx.display_name} (${tx.email})`);
        console.log(`   Type: ${tx.transaction_type}`);
        console.log(`   Amount: ₦${Number(tx.amount).toLocaleString()}`);
        console.log(`   Reference: ${tx.reference}`);
        console.log(`   Status: ${tx.status}`);
        console.log(`   Description: ${tx.description}`);
        console.log(`   Balance Before: ₦${Number(tx.balance_before).toLocaleString()}`);
        console.log(`   Balance After: ₦${Number(tx.balance_after).toLocaleString()}`);
        console.log(`   Created: ${tx.created_at}`);
      });
    }

    // Check users with wallet balances
    console.log('\n👥 Users with Wallet Balances:');
    const usersResult = await client.query(`
      SELECT 
        u.email,
        u.display_name,
        up.wallet_balance
      FROM users u
      JOIN users_profiles up ON u.id = up.user_id
      WHERE up.wallet_balance > 0
      ORDER BY up.wallet_balance DESC;
    `);
    
    if (usersResult.rows.length === 0) {
      console.log('❌ No users with wallet balance > 0');
    } else {
      usersResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.display_name} (${user.email}): ₦${Number(user.wallet_balance).toLocaleString()}`);
      });
    }

    // Check all users' current wallet balances
    console.log('\n💰 All Users Wallet Balances:');
    const allUsersResult = await client.query(`
      SELECT 
        u.email,
        u.display_name,
        COALESCE(up.wallet_balance, 0) as wallet_balance
      FROM users u
      LEFT JOIN users_profiles up ON u.id = up.user_id
      ORDER BY u.created_at DESC;
    `);
    
    allUsersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.display_name} (${user.email}): ₦${Number(user.wallet_balance).toLocaleString()}`);
    });

    // Check for any payment references containing today's date
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n🔍 Looking for transactions from today (${today}):`);
    const todayTxResult = await client.query(`
      SELECT * FROM wallet_transactions 
      WHERE created_at >= $1 
      ORDER BY created_at DESC;
    `, [today]);
    
    if (todayTxResult.rows.length === 0) {
      console.log('❌ No transactions found for today');
    } else {
      console.log(`✅ Found ${todayTxResult.rows.length} transactions from today`);
      todayTxResult.rows.forEach((tx, index) => {
        console.log(`${index + 1}. Ref: ${tx.reference}, Amount: ₦${Number(tx.amount).toLocaleString()}, Status: ${tx.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n👋 Connection closed');
  }
}

debugPaymentVerification();
