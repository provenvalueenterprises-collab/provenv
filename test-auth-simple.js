const { nhost } = require('./lib/nhost');

async function testAuthFunctions() {
  console.log('🔍 Testing different auth functions in Nhost...');

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data: testData, error: testError } = await nhost.graphql.request(`
      query { __typename }
    `);

    if (testError) {
      console.error('❌ Basic connection failed:', testError);
      return;
    }
    console.log('✅ Basic connection successful');

    // Test different auth functions
    console.log('\n2. Testing auth functions...');

    const authTests = [
      {
        name: 'auth.uid()',
        query: `query { testAuth: user_profiles(limit: 1) { user_id } }`
      },
      {
        name: 'JWT claims',
        query: `query { testAuth: user_profiles(where: {user_id: {_eq: "test"}}) { user_id } }`
      }
    ];

    for (const test of authTests) {
      console.log(`Testing: ${test.name}`);
      try {
        const { data, error } = await nhost.graphql.request(test.query);
        if (error) {
          console.log(`❌ ${test.name} failed:`, error.message);
        } else {
          console.log(`✅ ${test.name} might work`);
        }
      } catch (err) {
        console.log(`❌ ${test.name} error:`, err.message);
      }
    }

    // Try to create a profile to see the exact error
    console.log('\n3. Testing profile creation to see exact error...');

    const { data: profileData, error: profileError } = await nhost.graphql.request(`
      mutation TestProfileCreation {
        insert_user_profiles_one(object: {
          user_id: "00000000-0000-0000-0000-000000000000"
          phone: "1234567890"
          referral_code: "TEST123"
          wallet_balance: 0.00
          bonus_wallet: 0.00
          total_referrals: 0
        }) {
          id
        }
      }
    `);

    if (profileError) {
      console.log('❌ Profile creation failed with error:');
      console.log(JSON.stringify(profileError, null, 2));
    } else {
      console.log('✅ Profile creation successful (unexpected!)');
    }

  } catch (err) {
    console.error('❌ Script error:', err);
  }
}

testAuthFunctions();
