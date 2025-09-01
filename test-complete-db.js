const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.nextauth
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env.nextauth') });

console.log('Environment loading result:', result.error ? result.error.message : 'Success');
console.log('');
console.log('=== Database Environment Variables ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? `Set (${process.env.DB_PASSWORD.length} chars)` : 'Not set');
console.log('DB_SSL:', process.env.DB_SSL);
console.log('');

// Test PostgreSQL connection
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

console.log('🔗 Testing PostgreSQL connection...');

pool.connect()
  .then(async (client) => {
    console.log('✅ PostgreSQL connection successful!');
    
    try {
      // Test basic query
      const timeResult = await client.query('SELECT NOW() as current_time');
      console.log('⏰ Current database time:', timeResult.rows[0].current_time);
      
      // List tables
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      console.log('📋 Available tables:');
      tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
      
    } catch (queryError) {
      console.error('❌ Query error:', queryError.message);
    } finally {
      client.release();
    }
    
    await pool.end();
    console.log('🏁 Connection test completed');
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    console.error('Full error:', err);
  });
