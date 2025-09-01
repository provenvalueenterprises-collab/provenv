import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing database connection...');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('SSL:', process.env.DB_SSL);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
  connectionTimeoutMillis: 10000, // 10 seconds
  query_timeout: 10000,
  idleTimeoutMillis: 30000,
  max: 5
});

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');

    const result = await client.query('SELECT NOW()');
    console.log('✅ Query successful, current time:', result.rows[0].now);

    client.release();
    await pool.end();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error);

    if (error.code === 'ENOTFOUND') {
      console.error('❌ DNS resolution failed - check if the host is reachable');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - check if the database server is running');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ Connection timeout - check network connectivity');
    }
  }
}

testConnection();
