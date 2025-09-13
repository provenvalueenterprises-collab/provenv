const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function debugDailyProcessing() {
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
    console.log('🔍 DEBUGGING DAILY PROCESSING ISSUES');
    console.log('='.repeat(60));

    // 1. Check if we have active thrift accounts
    const activeAccountsQuery = `
      SELECT 
        ta.id, 
        ta.user_id, 
        ta.status, 
        ta.start_date,
        u.email,
        cp.daily_amount,
        up.wallet_balance,
        CURRENT_DATE as today
      FROM thrift_accounts ta
      JOIN auth.users u ON ta.user_id = u.id
      JOIN contribution_plans cp ON ta.plan_id = cp.id
      LEFT JOIN users_profiles up ON ta.user_id = up.user_id
      WHERE ta.status = 'active'
      ORDER BY ta.start_date
    `;
    
    const activeResult = await client.query(activeAccountsQuery);
    console.log(`\n📊 ACTIVE THRIFT ACCOUNTS: ${activeResult.rows.length}`);
    
    if (activeResult.rows.length === 0) {
      console.log('❌ NO ACTIVE THRIFT ACCOUNTS FOUND!');
      console.log('   This is why no processing occurred.');
      
      // Check all thrift accounts regardless of status
      const allAccountsQuery = `
        SELECT ta.status, COUNT(*) as count
        FROM thrift_accounts ta
        GROUP BY ta.status
      `;
      const allResult = await client.query(allAccountsQuery);
      console.log('\n📋 ALL THRIFT ACCOUNTS BY STATUS:');
      allResult.rows.forEach(row => {
        console.log(`   ${row.status}: ${row.count} accounts`);
      });
      
    } else {
      activeResult.rows.forEach(account => {
        const startDate = new Date(account.start_date);
        const today = new Date();
        const daysSinceStart = Math.floor((today - startDate) / (24 * 60 * 60 * 1000));
        
        console.log(`\n👤 ${account.email}:`);
        console.log(`   Account ID: ${account.id}`);
        console.log(`   Daily Amount: ₦${account.daily_amount}`);
        console.log(`   Wallet Balance: ₦${account.wallet_balance || 0}`);
        console.log(`   Start Date: ${startDate.toLocaleDateString()}`);
        console.log(`   Days Since Start: ${daysSinceStart}`);
        console.log(`   Eligible for Processing: ${startDate <= today ? 'YES' : 'NO'}`);
      });
    }

    // 2. Check if contributions already exist for today
    const todayContributionsQuery = `
      SELECT 
        dc.thrift_account_id,
        dc.expected_date,
        dc.status,
        dc.auto_processed,
        u.email
      FROM daily_contributions dc
      JOIN thrift_accounts ta ON dc.thrift_account_id = ta.id
      JOIN auth.users u ON ta.user_id = u.id
      WHERE dc.expected_date = CURRENT_DATE
    `;
    
    const todayResult = await client.query(todayContributionsQuery);
    console.log(`\n📅 TODAY'S CONTRIBUTIONS ALREADY PROCESSED: ${todayResult.rows.length}`);
    
    if (todayResult.rows.length > 0) {
      console.log('⚠️  Contributions already exist for today:');
      todayResult.rows.forEach(contrib => {
        console.log(`   ${contrib.email}: ${contrib.status} (auto: ${contrib.auto_processed})`);
      });
    }

    // 3. Check if the wallet balance update trigger is working
    console.log('\n🔧 TESTING WALLET UPDATE TRIGGER...');
    
    // Find a user to test with
    const testUserQuery = `
      SELECT u.id, u.email, up.wallet_balance
      FROM auth.users u
      LEFT JOIN users_profiles up ON u.id = up.user_id
      LIMIT 1
    `;
    const testUserResult = await client.query(testUserQuery);
    
    if (testUserResult.rows.length > 0) {
      const testUser = testUserResult.rows[0];
      const currentBalance = parseFloat(testUser.wallet_balance || 0);
      console.log(`   Test User: ${testUser.email}`);
      console.log(`   Current Balance: ₦${currentBalance}`);
      
      // Check pending penalties
      const penaltiesQuery = `
        SELECT COUNT(*) as count, SUM(total_amount_due) as total
        FROM penalty_tracking 
        WHERE user_id = $1 AND status = 'pending'
      `;
      const penaltiesResult = await client.query(penaltiesQuery, [testUser.id]);
      const penalties = penaltiesResult.rows[0];
      console.log(`   Pending Penalties: ${penalties.count} (₦${penalties.total || 0})`);
      
      if (penalties.count > 0) {
        console.log('\n🧪 TESTING PENALTY SETTLEMENT...');
        // Temporarily add ₦1 to trigger the function
        await client.query(
          `UPDATE users_profiles SET wallet_balance = wallet_balance + 1 WHERE user_id = $1`,
          [testUser.id]
        );
        console.log('   ✅ Triggered wallet balance update');
        
        // Check if anything changed
        const afterUpdateQuery = `
          SELECT COUNT(*) as count, SUM(total_amount_due) as total
          FROM penalty_tracking 
          WHERE user_id = $1 AND status = 'pending'
        `;
        const afterResult = await client.query(afterUpdateQuery, [testUser.id]);
        const afterPenalties = afterResult.rows[0];
        
        if (afterPenalties.count < penalties.count) {
          console.log(`   ✅ Penalty settlement worked! Reduced from ${penalties.count} to ${afterPenalties.count}`);
        } else {
          console.log(`   ❌ Penalty settlement didn't trigger. Still ${afterPenalties.count} pending.`);
        }
        
        // Restore original balance
        await client.query(
          `UPDATE users_profiles SET wallet_balance = wallet_balance - 1 WHERE user_id = $1`,
          [testUser.id]
        );
      }
    }

    // 4. Check if the functions exist
    console.log('\n🔍 CHECKING DATABASE FUNCTIONS...');
    const functionsQuery = `
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN ('process_daily_contributions', 'settle_penalties_on_wallet_credit')
    `;
    const functionsResult = await client.query(functionsQuery);
    console.log(`   Functions found: ${functionsResult.rows.length}/2`);
    functionsResult.rows.forEach(func => {
      console.log(`   ✅ ${func.routine_name}`);
    });

    // 5. Check trigger existence
    const triggerQuery = `
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_name = 'wallet_balance_update_trigger'
    `;
    const triggerResult = await client.query(triggerQuery);
    console.log(`   Triggers found: ${triggerResult.rows.length}`);
    triggerResult.rows.forEach(trigger => {
      console.log(`   ✅ ${trigger.trigger_name}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS COMPLETE');

  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
  } finally {
    await client.end();
  }
}

debugDailyProcessing();
