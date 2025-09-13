require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true'
});

async function explainDashboardStats() {
  try {
    console.log('📊 EXPLAINING DASHBOARD STATISTICS...\n');
    
    // Get user data
    const userQuery = `
      SELECT u.id, u.email, up.phone 
      FROM auth.users u 
      LEFT JOIN user_profiles up ON u.id = up.user_id 
      WHERE u.email = 'realsammy86@gmail.com'
    `;
    const userResult = await pool.query(userQuery);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`👤 User: ${user.email}`);
    console.log(`📱 Phone: ${user.phone}\n`);
    
    // Get thrift account
    const accountQuery = `
      SELECT ta.*, cp.name as plan_name, cp.daily_amount
      FROM thrift_accounts ta
      LEFT JOIN contribution_plans cp ON ta.plan_id = cp.id
      WHERE ta.user_id = $1
      ORDER BY ta.created_at DESC
      LIMIT 1
    `;
    const accountResult = await pool.query(accountQuery, [user.id]);
    
    if (accountResult.rows.length === 0) {
      console.log('❌ No thrift account found');
      return;
    }
    
    const account = accountResult.rows[0];
    console.log('🏦 THRIFT ACCOUNT DETAILS:');
    console.log(`   Plan: ${account.plan_name}`);
    console.log(`   Daily Amount: ₦${account.daily_amount}`);
    console.log(`   Start Date: ${account.start_date}`);
    console.log(`   Status: ${account.status}`);
    console.log(`   Total Defaults: ${account.total_defaults}\n`);
    
    // Calculate current day
    const startDate = new Date(account.start_date);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (24 * 60 * 60 * 1000)) + 1;
    
    console.log('📅 CURRENT DAY CALCULATION:');
    console.log(`   Start Date: ${startDate.toDateString()}`);
    console.log(`   Today: ${today.toDateString()}`);
    console.log(`   Days Since Start: ${daysSinceStart} days`);
    console.log(`   Display: "Day ${daysSinceStart}"\n`);
    
    // Get defaults data
    const defaultsQuery = `
      SELECT 
        dc.*,
        (dc.expected_date - ta.start_date) + 1 as day_number
      FROM daily_contributions dc
      JOIN thrift_accounts ta ON dc.thrift_account_id = ta.id
      WHERE dc.user_id = $1 AND dc.status = 'defaulted'
      ORDER BY dc.expected_date DESC
    `;
    const defaultsResult = await pool.query(defaultsQuery, [user.id]);
    
    console.log('⚠️  DEFAULTS EXPLANATION:');
    console.log(`   Total Defaults: ${defaultsResult.rows.length}`);
    if (defaultsResult.rows.length > 0) {
      console.log('   Default Details:');
      defaultsResult.rows.forEach((def, index) => {
        console.log(`     ${index + 1}. Day ${def.day_number} (${def.expected_date}) - ₦${def.expected_amount}`);
      });
      
      const mostRecentDefault = defaultsResult.rows[0];
      console.log(`\n   Most Recent Default: Day ${mostRecentDefault.day_number}`);
      console.log(`   Display: "Default Day ${mostRecentDefault.day_number}"`);
    } else {
      console.log('   No defaults found');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log(`   "Current Day" = How many days since you started your thrift plan`);
    console.log(`   "Total Defaults" = Number of days you missed contributions`);
    console.log(`   "Default Day" = The most recent day number when you missed a contribution`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

explainDashboardStats();
