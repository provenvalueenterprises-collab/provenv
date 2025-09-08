const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.nextauth' });

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const sql = fs.readFileSync('create-simple-virtual-accounts.sql', 'utf8');
    await client.query(sql);
    
    console.log('✅ Virtual accounts table created successfully!');
    
    // Check if table exists
    const result = await client.query(
      'SELECT table_name FROM information_schema.tables WHERE table_name = $1',
      ['virtual_accounts']
    );
    console.log('📋 Table exists:', result.rows.length > 0);
    
    await client.end();
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    await client.end();
  }
}

runMigration();
