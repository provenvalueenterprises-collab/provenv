const { userStore } = require('./lib/user-store');

async function testSignup() {
  try {
    console.log('🧪 Testing user signup...');

    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'test123',
      referralCode: `REF${Date.now()}`
    };

    console.log('📝 Registering user:', testUser.email);

    const user = await userStore.createUser({
      name: testUser.name,
      email: testUser.email,
      phone: testUser.phone,
      passwordHash: testUser.password,
      referralCode: testUser.referralCode
    });

    console.log('✅ User created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      hasProfile: user.walletBalance !== undefined
    });

    // Test finding the user
    console.log('🔍 Testing user lookup...');
    const foundUser = await userStore.findUserByEmail(testUser.email);

    if (foundUser) {
      console.log('✅ User found in database:', {
        id: foundUser.id,
        email: foundUser.email,
        walletBalance: foundUser.walletBalance,
        totalReferrals: foundUser.totalReferrals
      });
    } else {
      console.log('❌ User not found in database');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testSignup();
