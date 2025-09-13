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

async function analyzeSystemGaps() {
  try {
    console.log('🔍 ANALYZING THRIFT SYSTEM IMPLEMENTATION GAPS...\n');
    
    // 1. Check contribution_plans structure for missing fields
    console.log('📋 CHECKING CONTRIBUTION PLANS STRUCTURE:');
    const plansResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'contribution_plans' 
      ORDER BY ordinal_position
    `);
    
    const planColumns = plansResult.rows.map(row => row.column_name);
    const requiredPlanFields = ['daily_amount', 'duration_days', 'registration_fee'];
    
    requiredPlanFields.forEach(field => {
      if (planColumns.includes(field)) {
        console.log(`   ✅ ${field} - EXISTS`);
      } else {
        console.log(`   ❌ ${field} - MISSING`);
      }
    });
    
    // 2. Check if user_profiles has referral system fields
    console.log('\n👥 CHECKING REFERRAL SYSTEM FIELDS:');
    const userProfilesResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      ORDER BY ordinal_position
    `);
    
    const userProfileColumns = userProfilesResult.rows.map(row => row.column_name);
    const referralFields = ['referral_code', 'referred_by', 'total_referrals', 'bonus_wallet'];
    
    referralFields.forEach(field => {
      if (userProfileColumns.includes(field)) {
        console.log(`   ✅ ${field} - EXISTS`);
      } else {
        console.log(`   ❌ ${field} - MISSING`);
      }
    });
    
    // 3. Check complaints table structure
    console.log('\n🎫 CHECKING COMPLAINTS SYSTEM:');
    const complaintsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'complaints' 
      ORDER BY ordinal_position
    `);
    
    const complaintColumns = complaintsResult.rows.map(row => row.column_name);
    const requiredComplaintFields = ['category', 'description', 'status', 'priority'];
    
    requiredComplaintFields.forEach(field => {
      if (complaintColumns.includes(field)) {
        console.log(`   ✅ ${field} - EXISTS`);
      } else {
        console.log(`   ❌ ${field} - MISSING (has similar: ${complaintColumns.filter(col => col.includes(field.substring(0, 4))).join(', ') || 'none'})`);
      }
    });
    
    // 4. Check if we have active plan tracking
    console.log('\n📊 CHECKING THRIFT ACCOUNTS STATUS TRACKING:');
    const thriftAccountsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'thrift_accounts' 
      AND column_name IN ('status', 'start_date', 'maturity_date', 'total_defaults')
      ORDER BY ordinal_position
    `);
    
    thriftAccountsResult.rows.forEach(col => {
      console.log(`   ✅ ${col.column_name} (${col.data_type})`);
    });
    
    // 5. Check current active accounts
    console.log('\n🏦 CHECKING CURRENT ACTIVE THRIFT ACCOUNTS:');
    const activeAccounts = await pool.query(`
      SELECT COUNT(*) as total_accounts,
             COUNT(CASE WHEN status = 'active' THEN 1 END) as active_accounts,
             COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_accounts,
             COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_accounts
      FROM thrift_accounts
    `);
    
    console.log(`   📈 Total Accounts: ${activeAccounts.rows[0].total_accounts}`);
    console.log(`   ✅ Active: ${activeAccounts.rows[0].active_accounts}`);
    console.log(`   🏁 Completed: ${activeAccounts.rows[0].completed_accounts}`);
    console.log(`   ⏸️  Suspended: ${activeAccounts.rows[0].suspended_accounts}`);
    
    // 6. Check penalty tracking functionality
    console.log('\n⚠️  CHECKING PENALTY TRACKING:');
    const penalties = await pool.query(`
      SELECT COUNT(*) as total_penalties,
             COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_penalties,
             COUNT(CASE WHEN status = 'settled' THEN 1 END) as settled_penalties,
             SUM(total_amount_due) as total_amount_due
      FROM penalty_tracking
    `);
    
    console.log(`   📊 Total Penalties: ${penalties.rows[0].total_penalties}`);
    console.log(`   ⏳ Pending: ${penalties.rows[0].pending_penalties}`);
    console.log(`   ✅ Settled: ${penalties.rows[0].settled_penalties}`);
    console.log(`   💰 Total Amount Due: ₦${penalties.rows[0].total_amount_due || 0}`);
    
  } catch (error) {
    console.error('❌ Error analyzing system:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeSystemGaps();
