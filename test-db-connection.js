require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testConnection() {
  console.log('🔌 TESTING DATABASE CONNECTION...\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
    connectionTimeoutMillis: 10000,
    query_timeout: 5000
  };
  
  console.log('Connection config:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  User: ${config.user}`);
  console.log(`  SSL: ${config.ssl}`);
  
  const pool = new Pool(config);
  
  try {
    console.log('\n🔗 Attempting connection...');
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    console.log('\n🔍 Testing simple query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful:', result.rows[0].current_time);
    
    // Quick user check
    console.log('\n👤 Checking for users...');
    const userCount = await client.query('SELECT COUNT(*) FROM auth.users');
    console.log(`✅ Found ${userCount.rows[0].count} users in auth.users table`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Check common issues
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if database is running');
    console.log('2. Verify connection credentials');
    console.log('3. Check if SSL is required');
    console.log('4. Verify network connectivity');
    
  } finally {
    await pool.end();
  }
}

testConnection();
