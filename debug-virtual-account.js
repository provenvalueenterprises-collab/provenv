const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function checkVirtualAccountData() {
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
    
    // First, check what users exist
    const usersResult = await client.query(
      'SELECT id, email, display_name FROM auth.users WHERE email = $1',
      ['realsammy86@gmail.com']
    );
    console.log('👤 User data:', usersResult.rows[0]);
    
    // Check virtual accounts for this user
    if (usersResult.rows[0]) {
      const vaResult = await client.query(
        'SELECT * FROM virtual_accounts WHERE user_id = $1',
        [usersResult.rows[0].id]
      );
      console.log('🏦 Virtual accounts found:', vaResult.rows.length);
      if (vaResult.rows.length > 0) {
        console.log('📋 Virtual account details:', vaResult.rows[0]);
      }
      
      // Test the exact query from the API
      const apiQueryResult = await client.query(`
        SELECT 
          u.id,
          u.email,
          u.display_name,
          up.wallet_balance,
          up.nin,
          va.id as virtual_account_id,
          va.account_number,
          va.bank_name,
          va.account_name,
          va.monnify_reference,
          va.is_active,
          va.created_at as virtual_account_created_at
        FROM auth.users u
        LEFT JOIN users_profiles up ON u.id = up.user_id
        LEFT JOIN virtual_accounts va ON u.id = va.user_id AND va.is_active = true
        WHERE u.email = $1
      `, ['realsammy86@gmail.com']);
      
      console.log('🔍 API Query Result:', apiQueryResult.rows[0]);
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
    await client.end();
  }
}

checkVirtualAccountData();
