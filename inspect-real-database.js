const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function inspectDatabase() {
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
    console.log('✅ Database connected successfully');

    // Check auth.users table
    console.log('\n=== AUTH.USERS TABLE ===');
    try {
      const authUsersQuery = `SELECT id, email, display_name, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5`;
      const authUsersResult = await client.query(authUsersQuery);
      if (authUsersResult.rows.length > 0) {
        console.log(`Found ${authUsersResult.rows.length} users:`);
        authUsersResult.rows.forEach(user => {
          console.log(`- ${user.email} (${user.display_name}) - Created: ${user.created_at}`);
        });
      } else {
        console.log('No users found in auth.users table');
      }
    } catch (error) {
      console.log('❌ Error checking auth.users:', error.message);
    }

    // Check users_profiles table
    console.log('\n=== USERS_PROFILES TABLE ===');
    try {
      const profilesQuery = `
        SELECT up.user_id, au.email, up.wallet_balance, up.bonus_wallet, 
               up.total_referrals, up.phone, up.nin, 
               up.fast_track_eligible, up.created_at
        FROM users_profiles up
        LEFT JOIN auth.users au ON up.user_id = au.id
        ORDER BY up.created_at DESC LIMIT 5
      `;
      const profilesResult = await client.query(profilesQuery);
      if (profilesResult.rows.length > 0) {
        console.log(`Found ${profilesResult.rows.length} user profiles:`);
        profilesResult.rows.forEach(profile => {
          console.log(`- ${profile.email}: Wallet ₦${profile.wallet_balance}, Bonus ₦${profile.bonus_wallet}, Referrals: ${profile.total_referrals}`);
        });
      } else {
        console.log('No user profiles found');
      }
    } catch (error) {
      console.log('❌ Error checking users_profiles:', error.message);
    }

    // Check virtual_accounts table
    console.log('\n=== VIRTUAL_ACCOUNTS TABLE ===');
    try {
      const virtualAccountsQuery = `
        SELECT va.user_id, au.email, va.account_number, va.bank_name, 
               va.account_name, va.is_active, va.created_at
        FROM virtual_accounts va
        LEFT JOIN auth.users au ON va.user_id = au.id
        ORDER BY va.created_at DESC LIMIT 5
      `;
      const virtualAccountsResult = await client.query(virtualAccountsQuery);
      if (virtualAccountsResult.rows.length > 0) {
        console.log(`Found ${virtualAccountsResult.rows.length} virtual accounts:`);
        virtualAccountsResult.rows.forEach(account => {
          console.log(`- ${account.email}: ${account.account_number} (${account.bank_name}) - Active: ${account.is_active}`);
        });
      } else {
        console.log('No virtual accounts found');
      }
    } catch (error) {
      console.log('❌ Error checking virtual_accounts:', error.message);
    }

    // Check thrift_accounts table
    console.log('\n=== THRIFT_ACCOUNTS TABLE ===');
    try {
      const thriftQuery = `
        SELECT ta.user_id, au.email, ta.plan_id, ta.status, ta.amount_saved,
               ta.settlement_amount, ta.start_date, ta.maturity_date, ta.created_at
        FROM thrift_accounts ta
        LEFT JOIN auth.users au ON ta.user_id = au.id
        ORDER BY ta.created_at DESC LIMIT 5
      `;
      const thriftResult = await client.query(thriftQuery);
      if (thriftResult.rows.length > 0) {
        console.log(`Found ${thriftResult.rows.length} thrift accounts:`);
        thriftResult.rows.forEach(account => {
          console.log(`- ${account.email}: Plan ${account.plan_id}, Saved ₦${account.amount_saved}, Status: ${account.status}`);
        });
      } else {
        console.log('No thrift accounts found');
      }
    } catch (error) {
      console.log('❌ Error checking thrift_accounts:', error.message);
    }

    // Check wallet_transactions table
    console.log('\n=== WALLET_TRANSACTIONS TABLE ===');
    try {
      const transactionsQuery = `
        SELECT wt.user_id, au.email, wt.amount, wt.transaction_type, 
               wt.status, wt.balance_before, wt.balance_after, wt.created_at
        FROM wallet_transactions wt
        LEFT JOIN auth.users au ON wt.user_id = au.id
        ORDER BY wt.created_at DESC LIMIT 5
      `;
      const transactionsResult = await client.query(transactionsQuery);
      if (transactionsResult.rows.length > 0) {
        console.log(`Found ${transactionsResult.rows.length} wallet transactions:`);
        transactionsResult.rows.forEach(tx => {
          console.log(`- ${tx.email}: ${tx.transaction_type} ₦${tx.amount} - ${tx.status} (${tx.created_at})`);
        });
      } else {
        console.log('No wallet transactions found');
      }
    } catch (error) {
      console.log('❌ Error checking wallet_transactions:', error.message);
    }

    // Check contribution_plans table
    console.log('\n=== CONTRIBUTION_PLANS TABLE ===');
    try {
      const plansQuery = `SELECT id, name, daily_amount, duration_days, description FROM contribution_plans ORDER BY id`;
      const plansResult = await client.query(plansQuery);
      if (plansResult.rows.length > 0) {
        console.log(`Found ${plansResult.rows.length} contribution plans:`);
        plansResult.rows.forEach(plan => {
          console.log(`- Plan ${plan.id}: ${plan.name} - ₦${plan.daily_amount}/day for ${plan.duration_days} days`);
        });
      } else {
        console.log('No contribution plans found');
      }
    } catch (error) {
      console.log('❌ Error checking contribution_plans:', error.message);
    }

    // Check available tables
    console.log('\n=== AVAILABLE TABLES ===');
    try {
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      const tablesResult = await client.query(tablesQuery);
      console.log('Public tables:');
      tablesResult.rows.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    } catch (error) {
      console.log('❌ Error checking tables:', error.message);
    }

    // Check auth schema tables
    console.log('\n=== AUTH SCHEMA TABLES ===');
    try {
      const authTablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        ORDER BY table_name
      `;
      const authTablesResult = await client.query(authTablesQuery);
      console.log('Auth schema tables:');
      authTablesResult.rows.forEach(table => {
        console.log(`- auth.${table.table_name}`);
      });
    } catch (error) {
      console.log('❌ Error checking auth tables:', error.message);
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await client.end();
  }
}

inspectDatabase();
