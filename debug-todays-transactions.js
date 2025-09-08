// debug-todays-transactions.js - Debug all transactions from today
require('dotenv').config();
const { Client } = require('pg');

async function debugTodaysTransactions() {
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

    // Check all transactions from today
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n🔍 All transactions from ${today}:`);
    
    const todayTxResult = await client.query(`
      SELECT 
        wt.*,
        u.email,
        u.display_name
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      WHERE DATE(wt.created_at) = $1
      ORDER BY wt.created_at DESC;
    `, [today]);
    
    console.log(`Found ${todayTxResult.rows.length} transactions from today`);
    
    todayTxResult.rows.forEach((tx, index) => {
      console.log(`\n${index + 1}. Transaction Details:`);
      console.log(`   ID: ${tx.id}`);
      console.log(`   User: ${tx.display_name} (${tx.email})`);
      console.log(`   Reference: ${tx.reference}`);
      console.log(`   Amount: ₦${Number(tx.amount).toLocaleString()}`);
      console.log(`   Balance Before: ₦${Number(tx.balance_before).toLocaleString()}`);
      console.log(`   Balance After: ₦${Number(tx.balance_after).toLocaleString()}`);
      console.log(`   Status: ${tx.status}`);
      console.log(`   Description: ${tx.description}`);
      console.log(`   Created: ${tx.created_at}`);
    });

    // Check current wallet balance for the user who had the transaction
    if (todayTxResult.rows.length > 0) {
      const recentTx = todayTxResult.rows[0];
      console.log(`\n💰 Current wallet balance for ${recentTx.email}:`);
      
      const balanceResult = await client.query(`
        SELECT 
          up.wallet_balance,
          up.updated_at
        FROM users_profiles up
        JOIN users u ON up.user_id = u.id
        WHERE u.email = $1;
      `, [recentTx.email]);
      
      if (balanceResult.rows.length > 0) {
        const balance = balanceResult.rows[0];
        console.log(`   Current Balance: ₦${Number(balance.wallet_balance).toLocaleString()}`);
        console.log(`   Last Updated: ${balance.updated_at}`);
        
        // Check if there's a mismatch
        const expectedBalance = Number(recentTx.balance_after);
        const actualBalance = Number(balance.wallet_balance);
        
        if (expectedBalance !== actualBalance) {
          console.log(`\n❌ BALANCE MISMATCH DETECTED!`);
          console.log(`   Expected (from transaction): ₦${expectedBalance.toLocaleString()}`);
          console.log(`   Actual (from profile): ₦${actualBalance.toLocaleString()}`);
          console.log(`   Difference: ₦${(expectedBalance - actualBalance).toLocaleString()}`);
        } else {
          console.log(`\n✅ Balance matches transaction record`);
        }
      } else {
        console.log(`❌ No wallet balance found for user ${recentTx.email}`);
      }
    }

    // Check if there are any transactions that reference Flutterwave
    console.log(`\n🔍 Checking for Flutterwave-related transactions:`);
    const flutterwaveResult = await client.query(`
      SELECT 
        wt.*,
        u.email
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      WHERE wt.reference LIKE '%FLW%' 
         OR wt.reference LIKE '%flw%'
         OR wt.description ILIKE '%flutterwave%'
         OR wt.reference ~ '^[0-9]+$'
      ORDER BY wt.created_at DESC
      LIMIT 5;
    `);
    
    if (flutterwaveResult.rows.length > 0) {
      console.log(`Found ${flutterwaveResult.rows.length} Flutterwave-related transactions:`);
      flutterwaveResult.rows.forEach((tx, index) => {
        console.log(`${index + 1}. Ref: ${tx.reference}, Amount: ₦${Number(tx.amount).toLocaleString()}, User: ${tx.email}, Date: ${tx.created_at}`);
      });
    } else {
      console.log(`No Flutterwave-related transactions found`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n👋 Connection closed');
  }
}

debugTodaysTransactions();
