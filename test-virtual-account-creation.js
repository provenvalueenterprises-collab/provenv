const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function testVirtualAccountCreation() {
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
    
    // Get user ID
    const userResult = await client.query(
      'SELECT id, display_name FROM auth.users WHERE email = $1',
      ['realsammy86@gmail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('👤 User found:', user);
    
    // Create a test virtual account
    const mockAccountNumber = `90${Math.floor(Math.random() * 100000000)}`;
    const mockBankName = 'Test Bank (Manual Test)';
    const mockReference = `MANUAL_TEST_${Date.now()}`;
    
    const insertQuery = `
      INSERT INTO virtual_accounts (
        user_id, 
        account_number, 
        bank_name, 
        account_name, 
        monnify_reference, 
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const insertResult = await client.query(insertQuery, [
      user.id,
      mockAccountNumber,
      mockBankName,
      user.display_name || 'Test User',
      mockReference,
      true
    ]);
    
    console.log('✅ Virtual account created:', insertResult.rows[0]);
    
    // Verify it can be retrieved
    const retrieveResult = await client.query(
      'SELECT * FROM virtual_accounts WHERE user_id = $1',
      [user.id]
    );
    
    console.log('🔍 Retrieved virtual accounts:', retrieveResult.rows.length);
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

testVirtualAccountCreation();
