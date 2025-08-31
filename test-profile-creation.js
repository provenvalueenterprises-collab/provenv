// Test script to verify profile creation works after RLS fix
const { userStore } = require('./lib/user-store');

async function testProfileCreation() {
  console.log('🧪 Testing user registration with profile creation...');

  const testUser = {
    name: 'Test User Profile',
    email: `testprofile${Date.now()}@example.com`,
    phone: '1234567890',
    password: 'test123',
    referralCode: `REF${Date.now()}`
  };

  try {
    console.log(`📝 Creating user: ${testUser.email}`);

    const user = await userStore.createUser({
      name: testUser.name,
      email: testUser.email,
      phone: testUser.phone,
      passwordHash: testUser.password,
      referralCode: testUser.referralCode
    });

    console.log('✅ User creation result:', {
      id: user.id,
      email: user.email,
      name: user.name,
      hasWalletBalance: user.walletBalance !== undefined,
      hasBonusWallet: user.bonusWallet !== undefined,
      hasTotalReferrals: user.totalReferrals !== undefined
    });

    if (user.walletBalance !== undefined && user.bonusWallet !== undefined && user.totalReferrals !== undefined) {
      console.log('🎉 SUCCESS: User profile was created in the database!');
      console.log('✅ user_profiles table should now contain this user\'s data');
    } else {
      console.log('⚠️ PARTIAL: User created in auth but profile creation failed');
      console.log('❌ Check the console logs above for RLS policy error details');
    }

    // Test finding the user
    console.log('🔍 Testing user lookup...');
    const foundUser = await userStore.findUserByEmail(testUser.email);

    if (foundUser) {
      console.log('✅ User found in database:', {
        id: foundUser.id,
        email: foundUser.email,
        walletBalance: foundUser.walletBalance,
        totalReferrals: foundUser.totalReferrals,
        hasProfile: foundUser.walletBalance !== undefined
      });
    } else {
      console.log('❌ User not found in database');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testProfileCreation();
