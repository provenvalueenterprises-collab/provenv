// Manual test payment verification
const { Client } = require('pg');

async function testPaymentVerification() {
  console.log('🧪 Testing payment verification with fixed database query...');
  
  const userEmail = 'realsammy86@gmail.com';
  
  try {
    // Create PostgreSQL client
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: false
    })

    console.log('🔗 Connecting to database...');
    await client.connect()
    console.log('✅ Database connected');

    // Test the FIXED user query (with auth.users)
    const userQuery = `
      SELECT u.id, u.email, up.wallet_balance 
      FROM auth.users u 
      JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1
    `
    console.log('👤 Testing fixed user lookup for:', userEmail);
    const userResult = await client.query(userQuery, [userEmail])

    if (userResult.rows.length === 0) {
      console.error('❌ User still not found with fixed query');
    } else {
      const user = userResult.rows[0];
      console.log('✅ User found with fixed query!', {
        id: user.id,
        email: user.email,
        currentBalance: user.wallet_balance
      });
    }

    await client.end()
    console.log('👋 Database connection closed');

  } catch (error) {
    console.error('❌ Database test error:', error);
  }
}

testPaymentVerification();
