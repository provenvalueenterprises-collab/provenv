require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true'
});

async function deployEnhancedFunctions() {
  try {
    console.log('🚀 DEPLOYING ENHANCED DAILY PROCESSING FUNCTIONS...\n');
    
    const sql = fs.readFileSync('enhanced-daily-processing.sql', 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Enhanced functions deployed successfully!');
    
    // Test the enhanced function
    console.log('\n🧪 TESTING ENHANCED FUNCTION...');
    const result = await pool.query('SELECT * FROM process_daily_contributions_enhanced()');
    
    console.log('📊 Test Results:');
    console.log(`   Users Processed: ${result.rows[0].total_users_processed}`);
    console.log(`   Successful Deductions: ${result.rows[0].successful_deductions}`);
    console.log(`   Defaults Created: ${result.rows[0].defaults_created}`);
    console.log(`   Total Amount Deducted: ₦${result.rows[0].total_amount_deducted}`);
    console.log(`   Total Penalties Applied: ₦${result.rows[0].total_penalties_applied}`);
    console.log(`   Processing Summary:`, JSON.stringify(result.rows[0].processing_summary, null, 2));
    
  } catch (error) {
    console.error('❌ Error deploying functions:', error.message);
  } finally {
    await pool.end();
  }
}

deployEnhancedFunctions();
