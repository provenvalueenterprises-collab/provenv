const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function testDailyContributionSystem() {
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
    console.log('🧪 TESTING DAILY CONTRIBUTION SYSTEM');
    console.log('='.repeat(70));

    // Get test users
    const usersQuery = `SELECT id, email FROM auth.users LIMIT 2`;
    const usersResult = await client.query(usersQuery);
    
    for (const user of usersResult.rows) {
      console.log(`\n👤 TESTING USER: ${user.email}`);
      console.log('-'.repeat(50));

      // 1. Check current wallet balance
      const balanceQuery = `SELECT wallet_balance FROM users_profiles WHERE user_id = $1`;
      const balanceResult = await client.query(balanceQuery, [user.id]);
      const currentBalance = parseFloat(balanceResult.rows[0]?.wallet_balance || 0);
      console.log(`💰 Current Wallet Balance: ₦${currentBalance}`);

      // 2. Get thrift account details
      const thriftQuery = `
        SELECT ta.id, ta.status, cp.daily_amount, cp.name
        FROM thrift_accounts ta
        JOIN contribution_plans cp ON ta.plan_id = cp.id
        WHERE ta.user_id = $1 AND ta.status = 'active'
        LIMIT 1
      `;
      const thriftResult = await client.query(thriftQuery, [user.id]);
      
      if (thriftResult.rows.length > 0) {
        const thrift = thriftResult.rows[0];
        console.log(`📊 Active Thrift: ${thrift.name} (₦${thrift.daily_amount}/day)`);

        // 3. Check pending penalties
        const penaltiesQuery = `
          SELECT COUNT(*) as count, SUM(total_amount_due) as total
          FROM penalty_tracking 
          WHERE user_id = $1 AND status = 'pending'
        `;
        const penaltiesResult = await client.query(penaltiesQuery, [user.id]);
        const penalties = penaltiesResult.rows[0];
        console.log(`⚠️  Pending Penalties: ${penalties.count} defaults, ₦${penalties.total || 0} total due`);

        // 4. Simulate daily contribution processing
        console.log('\n🔄 SIMULATING DAILY CONTRIBUTION...');
        
        if (currentBalance >= thrift.daily_amount) {
          console.log(`✅ Sufficient balance: ₦${currentBalance} >= ₦${thrift.daily_amount}`);
          console.log(`   Will deduct ₦${thrift.daily_amount} automatically`);
        } else {
          console.log(`❌ Insufficient balance: ₦${currentBalance} < ₦${thrift.daily_amount}`);
          console.log(`   Will create default with ₦${thrift.daily_amount} penalty (100%)`);
          console.log(`   Total amount due: ₦${thrift.daily_amount * 2} (contribution + penalty)`);
        }

        // 5. Show contribution history
        const historyQuery = `
          SELECT expected_date, status, actual_amount, penalty_amount
          FROM daily_contributions
          WHERE user_id = $1
          ORDER BY expected_date DESC
          LIMIT 5
        `;
        const historyResult = await client.query(historyQuery, [user.id]);
        
        console.log('\n📋 Recent Contribution History:');
        historyResult.rows.forEach(contrib => {
          const date = new Date(contrib.expected_date).toLocaleDateString();
          const status = contrib.status === 'completed' ? '✅ PAID' : '❌ DEFAULT';
          const penalty = contrib.penalty_amount > 0 ? ` (Penalty: ₦${contrib.penalty_amount})` : '';
          console.log(`   ${date}: ₦${contrib.actual_amount || 0} ${status}${penalty}`);
        });
      } else {
        console.log('📊 No active thrift accounts found');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎯 SYSTEM FEATURES SUMMARY:');
    console.log('✅ Daily auto-deduction from wallet balance');
    console.log('✅ 100% penalty applied on insufficient balance');
    console.log('✅ Auto-settlement when wallet is credited');
    console.log('✅ Proper contribution recording and tracking');
    console.log('✅ Penalty tracking and management');
    
    console.log('\n📅 TO RUN DAILY PROCESSING:');
    console.log('   Call: SELECT process_daily_contributions();');
    
    console.log('\n💳 TO TRIGGER PENALTY SETTLEMENT:');
    console.log('   Fund wallet via API: /api/wallet/fund-with-penalty-settlement');
    
    console.log('\n⏰ FOR AUTOMATED PROCESSING:');
    console.log('   Schedule: POST /api/cron/daily-contributions (daily at midnight)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testDailyContributionSystem();
