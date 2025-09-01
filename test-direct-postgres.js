import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables from .env.nextauth
dotenv.config({ path: '.env.nextauth' });

console.log('🔍 Testing PostgreSQL connection with .env.nextauth credentials...');
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
  connectionTimeoutMillis: 15000,
  query_timeout: 30000,
  idleTimeoutMillis: 30000,
  max: 5
});

async function testDirectConnection() {
  try {
    console.log('⏳ Attempting to connect to PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection successful!');

    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful, current time:', result.rows[0].current_time);

    // Test if users table exists
    try {
      const usersCheck = await client.query('SELECT COUNT(*) FROM auth.users LIMIT 1');
      console.log('✅ auth.users table accessible, count:', usersCheck.rows[0].count);
    } catch (err) {
      console.log('❌ auth.users table not accessible:', err.message);
    }

    // Test if users_profiles table exists
    try {
      const profilesCheck = await client.query('SELECT COUNT(*) FROM public.users_profiles LIMIT 1');
      console.log('✅ public.users_profiles table accessible, count:', profilesCheck.rows[0].count);
    } catch (err) {
      console.log('❌ public.users_profiles table not accessible:', err.message);
      
      // Try users_profile (singular)
      try {
        const profileCheck = await client.query('SELECT COUNT(*) FROM public.users_profile LIMIT 1');
        console.log('✅ public.users_profile table accessible, count:', profileCheck.rows[0].count);
      } catch (err2) {
        console.log('❌ public.users_profile table not accessible:', err2.message);
      }
    }

    client.release();
    await pool.end();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.error('❌ DNS resolution failed - check if the host is reachable');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - check if the database server is running');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ Connection timeout - check network connectivity and firewall');
    } else if (error.code === '28P01') {
      console.error('❌ Authentication failed - check username and password');
    } else if (error.code === '3D000') {
      console.error('❌ Database does not exist - check database name');
    }
  }
}

testDirectConnection();
