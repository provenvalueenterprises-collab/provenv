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

async function cleanupTestData() {
  try {
    console.log('🧹 CLEANING UP CONFUSING TEST DATA...\n');
    
    // Get user
    const userResult = await pool.query(
      "SELECT id FROM auth.users WHERE email = 'realsammy86@gmail.com'"
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Show current defaults
    console.log('📊 CURRENT DEFAULTS:');
    const currentDefaults = await pool.query(`
      SELECT 
        dc.expected_date,
        dc.expected_amount,
        dc.status,
        (dc.expected_date - ta.start_date) + 1 as day_number
      FROM daily_contributions dc
      JOIN thrift_accounts ta ON dc.thrift_account_id = ta.id
      WHERE dc.user_id = $1 AND dc.status = 'defaulted'
      ORDER BY dc.expected_date
    `, [userId]);
    
    currentDefaults.rows.forEach(def => {
      console.log(`   Day ${def.day_number}: ${def.expected_date} - ₦${def.expected_amount} (${def.status})`);
    });
    
    // Remove future date defaults (test data)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('\n🗑️  REMOVING FUTURE DATE DEFAULTS (TEST DATA)...');
    const deleteResult = await pool.query(`
      DELETE FROM daily_contributions 
      WHERE user_id = $1 
      AND expected_date > $2 
      AND status = 'defaulted'
    `, [userId, today]);
    
    console.log(`✅ Removed ${deleteResult.rowCount} future defaults`);
    
    // Also clean up penalty tracking for future dates
    const deletePenalties = await pool.query(`
      DELETE FROM penalty_tracking 
      WHERE user_id = $1 
      AND default_date > $2
    `, [userId, today]);
    
    console.log(`✅ Removed ${deletePenalties.rowCount} future penalties`);
    
    // Show updated stats
    console.log('\n📊 UPDATED DASHBOARD STATS:');
    const updatedDefaults = await pool.query(`
      SELECT COUNT(*) as total_defaults
      FROM daily_contributions 
      WHERE user_id = $1 AND status = 'defaulted'
    `, [userId]);
    
    const updatedRecentDefault = await pool.query(`
      SELECT 
        (dc.expected_date - ta.start_date) + 1 as default_day
      FROM daily_contributions dc
      JOIN thrift_accounts ta ON dc.thrift_account_id = ta.id
      WHERE dc.user_id = $1 AND dc.status = 'defaulted'
      ORDER BY dc.expected_date DESC
      LIMIT 1
    `, [userId]);
    
    const totalDefaults = parseInt(updatedDefaults.rows[0]?.total_defaults || 0);
    const defaultDay = parseInt(updatedRecentDefault.rows[0]?.default_day || 0);
    
    // Calculate current day
    const accountResult = await pool.query(`
      SELECT start_date FROM thrift_accounts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1
    `, [userId]);
    
    const currentDay = accountResult.rows.length > 0 ? 
      Math.floor((Date.now() - new Date(accountResult.rows[0].start_date).getTime()) / (24 * 60 * 60 * 1000)) + 1 : 0;
    
    console.log(`   Current Day: Day ${currentDay}`);
    console.log(`   Total Defaults: ${totalDefaults}`);
    console.log(`   Most Recent Default Day: ${defaultDay > 0 ? `Day ${defaultDay}` : 'None'}`);
    
    console.log('\n✅ Test data cleanup complete! Your dashboard should now show accurate numbers.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

cleanupTestData();
