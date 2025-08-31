// Test script to verify Nhost connection and schema
const { NhostClient } = require('@nhost/nhost-js');

const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'sbpnfqrsnvtyvkgldcco',
  region: process.env.NEXT_PUBLIC_NHOST_REGION || 'eu-central-1'
});

async function testNhostConnection() {
  console.log('Testing Nhost connection...');
  console.log('Subdomain:', process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN);
  console.log('Region:', process.env.NEXT_PUBLIC_NHOST_REGION);

  try {
    // Test basic connection first
    console.log('\n1. Testing basic GraphQL connection...');
    const { data: testData, error: testError } = await nhost.graphql.request(`
      query TestConnection {
        __typename
      }
    `);

    if (testError) {
      console.error('Basic connection failed:', testError);
      return false;
    }

    console.log('✅ Basic connection successful');

    // Test introspection to see available types
    console.log('\n2. Checking available GraphQL types...');
    const { data: schemaData, error: schemaError } = await nhost.graphql.request(`
      query Introspection {
        __schema {
          types {
            name
            kind
          }
        }
      }
    `);

    if (schemaError) {
      console.error('Schema introspection failed:', schemaError);
    } else {
      console.log('Available types:');
      const queryTypes = schemaData?.__schema?.types?.filter(type =>
        type.kind === 'OBJECT' && !type.name.startsWith('__')
      ) || [];
      queryTypes.forEach(type => console.log(`  - ${type.name}`));
    }

    // Test specific tables
    console.log('\n3. Testing user_profiles table...');
    const { data: userData, error: userError } = await nhost.graphql.request(`
      query TestUserProfiles {
        user_profiles(limit: 1) {
          id
        }
      }
    `);

    if (userError) {
      console.error('❌ user_profiles query failed:', userError);
    } else {
      console.log('✅ user_profiles table exists');
    }

    return true;
  } catch (error) {
    console.error('❌ Nhost connection failed:', error.message);
    return false;
  }
}

testNhostConnection();
