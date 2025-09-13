const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function manualDailyProcessing() {
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
    console.log('🔄 MANUAL DAILY CONTRIBUTION PROCESSING');
    console.log('='.repeat(60));

    // Test the daily processing function
    console.log('📊 Running daily contribution processing...');
    await client.query('SELECT process_daily_contributions()');
    console.log('✅ Daily processing completed');

    // Check results
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_processed,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'defaulted' THEN 1 END) as defaults,
        SUM(CASE WHEN status = 'completed' THEN actual_amount ELSE 0 END) as collected,
        SUM(CASE WHEN status = 'defaulted' THEN penalty_amount ELSE 0 END) as penalties
      FROM daily_contributions 
      WHERE expected_date = CURRENT_DATE 
      AND auto_processed = true
    `;
    
    const result = await client.query(summaryQuery);
    const summary = result.rows[0];

    console.log('\n📈 PROCESSING RESULTS:');
    console.log(`   Total Processed: ${summary.total_processed}`);
    console.log(`   Successful: ${summary.successful}`);
    console.log(`   Defaults: ${summary.defaults}`);
    console.log(`   Amount Collected: ₦${summary.collected || 0}`);
    console.log(`   Penalties Applied: ₦${summary.penalties || 0}`);

    console.log('\n✅ Daily contribution system is working!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

manualDailyProcessing();
