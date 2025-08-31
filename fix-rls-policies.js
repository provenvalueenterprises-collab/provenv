// Script to fix RLS policies for user_profiles table
const { NhostClient } = require('@nhost/nhost-js');

const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'sbpnfqrsnvtyvkgldcco',
  region: process.env.NEXT_PUBLIC_NHOST_REGION || 'eu-central-1'
});

async function fixUserProfilesRLS() {
  console.log('🔧 Fixing RLS policies for user_profiles table...');

  try {
    // First, let's test different auth functions
    console.log('1. Testing available auth functions...');

    const authFunctions = [
      'auth.uid()',
      'current_setting(\'request.jwt.claims\', true)::json->>\'sub\'',
      'nullif(current_setting(\'request.jwt.claim.sub\', true), \'\')::uuid',
      'nhost.user.id'
    ];

    for (const func of authFunctions) {
      console.log(`Testing: ${func}`);
      try {
        const testQuery = `
          SELECT ${func} as user_id
        `;
        const { data, error } = await nhost.graphql.request(`
          query TestAuthFunction {
            test: ${testQuery.replace('SELECT', '').replace('as user_id', '')}
          }
        `);
        if (!error) {
          console.log(`✅ ${func} works!`);
        } else {
          console.log(`❌ ${func} failed:`, error.message);
        }
      } catch (err) {
        console.log(`❌ ${func} error:`, err.message);
      }
    }

    // Try to add the INSERT policy using different approaches
    console.log('2. Adding INSERT policy for user_profiles...');

    const insertPolicies = [
      // Standard Nhost approach
      `CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());`,

      // JWT claims approach
      `CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);`,

      // Alternative JWT approach
      `CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (user_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);`,

      // Simplified approach (allow authenticated users to insert)
      `CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');`
    ];

    console.log('📋 Try these SQL commands in your Nhost SQL Editor:');
    console.log('========================================');
    insertPolicies.forEach((policy, index) => {
      console.log(`${index + 1}. ${policy}`);
      console.log('');
    });
    console.log('========================================');

    // Try to test if we can create a user profile now
    console.log('3. Testing profile creation...');

    // First, let's try to sign up a test user
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'test123';

    console.log(`Attempting to create test user: ${testEmail}`);

    const signUpResponse = await nhost.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        displayName: 'Test User'
      }
    });

    if (signUpResponse.error) {
      console.error('❌ Sign up failed:', signUpResponse.error.message);

      // If it's the "already signed in" error, try to sign out and retry
      if (signUpResponse.error.message === 'User is already signed in') {
        console.log('🔄 Signing out and retrying...');
        await nhost.auth.signOut();

        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Retry signup
        const retryResponse = await nhost.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            displayName: 'Test User'
          }
        });

        if (retryResponse.error) {
          console.error('❌ Retry sign up failed:', retryResponse.error.message);
          return;
        }

        console.log('✅ User created on retry');
        if (retryResponse.session?.user?.id) {
          await testProfileCreation(retryResponse.session.user.id, testEmail);
        }
      }
    } else {
      console.log('✅ User created successfully');
      if (signUpResponse.session?.user?.id) {
        await testProfileCreation(signUpResponse.session.user.id, testEmail);
      }
    }

  } catch (error) {
    console.error('❌ Error in fix script:', error.message);
  }
}

async function testProfileCreation(userId, email) {
  console.log(`4. Testing profile creation for user: ${userId}`);

  try {
    const { data: profileData, error: profileError } = await nhost.graphql.request(`
      mutation CreateUserProfile($userId: uuid!, $phone: String!, $referralCode: String!) {
        insert_user_profiles_one(object: {
          user_id: $userId
          phone: "1234567890"
          referral_code: "REF${Date.now()}"
          wallet_balance: 0.00
          bonus_wallet: 0.00
          total_referrals: 0
        }) {
          id
          user_id
          phone
          referral_code
          created_at
        }
      }
    `, {
      userId,
      phone: "1234567890",
      referralCode: `REF${Date.now()}`
    });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      console.log('This indicates the INSERT policy is missing.');
      console.log('Please run the SQL above in your Nhost SQL Editor.');
    } else {
      console.log('✅ Profile created successfully:', profileData?.insert_user_profiles_one);
    }
  } catch (error) {
    console.error('❌ Profile creation error:', error);
  }
}

fixUserProfilesRLS();
