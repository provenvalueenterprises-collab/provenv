const { NhostClient } = require('@nhost/nhost-js');

const nhost = new NhostClient({
  subdomain: 'sbpnfqrsnvtyvkgldcco',
  region: 'eu-central-1'
});

async function testNhostConnection() {
  try {
    console.log('🔍 Testing Nhost connection...');

    // Try to query users
    const { data, error } = await nhost.graphql.request(`
      query GetUsers {
        users {
          id
          email
          display_name
          email_verified
          created_at
        }
      }
    `);

    if (error) {
      console.log('❌ Nhost query error:', error);
      return;
    }

    console.log('✅ Nhost connection successful');
    console.log('📋 Users found:', data?.users?.length || 0);

    if (data?.users && data.users.length > 0) {
      console.log('👥 Existing users:');
      data.users.forEach(user => {
        console.log(`  - ${user.email} (${user.display_name || 'No name'})`);
      });
    } else {
      console.log('ℹ️ No users found in Nhost');
    }

  } catch (error) {
    console.error('❌ Nhost connection failed:', error.message);
  }
}

testNhostConnection();
