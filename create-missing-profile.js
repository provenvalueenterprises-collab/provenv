const { Pool } = require('pg');
require('dotenv').config();

function createDirectConnection() {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

async function createMissingProfile() {
  console.log('🔧 Creating Missing User Profile');
  console.log('=' .repeat(50));

  const pool = createDirectConnection();
  
  try {
    // Get the actual user from auth.users
    console.log('\n👤 1. Finding auth user...');
    const authUser = await pool.query(`
      SELECT id, email, display_name, created_at
      FROM auth.users 
      WHERE email = 'samuelekelejnr@gmail.com'
      LIMIT 1;
    `);

    if (authUser.rows.length === 0) {
      console.log('❌ No auth user found with that email');
      return;
    }

    const user = authUser.rows[0];
    console.log('✅ Found auth user:');
    console.log(`  - ID: ${user.id}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Display Name: ${user.display_name}`);
    console.log(`  - Created: ${user.created_at}`);

    // Split the display name into first and last name
    const fullName = user.display_name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    console.log('\n📝 2. Creating user profile...');
    console.log(`  - First Name: ${firstName}`);
    console.log(`  - Last Name: ${lastName}`);
    console.log(`  - Full Name: ${fullName}`);

    // Create the user profile
    const profileResult = await pool.query(`
      INSERT INTO public.users_profiles (
        user_id, 
        email, 
        first_name, 
        last_name, 
        full_name, 
        wallet_balance,
        bonus_wallet,
        total_referrals,
        fast_track_eligible,
        fast_track_activated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `, [
      user.id,           // user_id
      user.email,        // email
      firstName,         // first_name
      lastName,          // last_name
      fullName,          // full_name
      0,                 // wallet_balance
      0,                 // bonus_wallet
      0,                 // total_referrals
      false,             // fast_track_eligible
      false              // fast_track_activated
    ]);

    const profile = profileResult.rows[0];
    console.log('\n🎉 Profile created successfully!');
    console.log(`  - Profile ID: ${profile.id}`);
    console.log(`  - User ID: ${profile.user_id}`);
    console.log(`  - Email: ${profile.email}`);
    console.log(`  - Name: ${profile.first_name} ${profile.last_name}`);
    console.log(`  - Full Name: ${profile.full_name}`);
    console.log(`  - Wallet Balance: ₦${profile.wallet_balance}`);
    console.log(`  - Created At: ${profile.created_at}`);

    // Test wallet update
    console.log('\n💰 3. Testing wallet update...');
    const walletUpdate = await pool.query(`
      UPDATE public.users_profiles 
      SET wallet_balance = wallet_balance + $1
      WHERE user_id = $2
      RETURNING wallet_balance;
    `, [1000, user.id]);

    if (walletUpdate.rows.length > 0) {
      console.log(`✅ Wallet updated successfully: ₦${walletUpdate.rows[0].wallet_balance}`);
      
      // Reset it back to 0 for clean state
      await pool.query(`
        UPDATE public.users_profiles 
        SET wallet_balance = 0
        WHERE user_id = $1;
      `, [user.id]);
      console.log('✅ Wallet balance reset to ₦0');
    }

    console.log('\n🎊 Profile creation completed successfully!');
    console.log('\n💡 Now your payment verification should work correctly');
    console.log('   and wallet balance will update after successful payments.');

  } catch (error) {
    console.error('❌ Failed to create profile:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

// Run the profile creation
createMissingProfile().catch(console.error);
