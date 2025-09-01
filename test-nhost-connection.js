// Quick Nhost Connection Test Script
// Run with: node test-nhost-connection.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');

async function testNhostConnection() {
  console.log('🔍 Testing Nhost Connection...\n');

  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'sbpnfqrsnvtyvkgldcco';
  const region = process.env.NEXT_PUBLIC_NHOST_REGION || 'eu-central-1';
  const useNhost = process.env.NEXT_PUBLIC_USE_NHOST;

  // Database configuration
  const dbHost = process.env.DB_HOST || 'sbpnfqrsnvtyvkgldcco.db.eu-central-1.nhost.run';
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'sbpnfqrsnvtyvkgldcco';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '';

  console.log('📋 Configuration:');
  console.log(`   Use Nhost: ${useNhost}`);
  console.log(`   Subdomain: ${subdomain}`);
  console.log(`   Region: ${region}`);
  console.log(`   Database Host: ${dbHost}`);
  console.log(`   Database Port: ${dbPort}`);
  console.log(`   Database Name: ${dbName}`);
  console.log(`   Database User: ${dbUser}`);
  console.log(`   Has Password: ${!!dbPassword}\n`);

  let graphqlReachable = false;

  try {
    // Test 1: Basic GraphQL connectivity
    console.log('1️⃣ Testing GraphQL endpoint...');
    const graphqlUrl = `https://${subdomain}.nhost.run/v1/graphql`;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query { __typename }`
      })
    });

    if (response.ok) {
      console.log('✅ GraphQL endpoint is reachable');
      graphqlReachable = true;
    } else {
      console.log(`❌ GraphQL endpoint error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ GraphQL connection test failed:', error.message);
  }

  // Test 2: Direct database host reachability (always run)
  console.log('\n2️⃣ Testing direct database connectivity...');

  try {
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${dbHost}`, {
      method: 'GET'
    });

    if (dnsResponse.ok) {
      const dnsData = await dnsResponse.json();
      if (dnsData.Answer && dnsData.Answer.length > 0) {
        console.log('✅ Database host DNS resolution successful');
        console.log(`   Resolved IP: ${dnsData.Answer[0].data}`);
      } else {
        console.log('❌ Database host DNS resolution failed - no records found');
      }
    } else {
      console.log('❌ Database host DNS resolution failed');
    }
  } catch (dnsError) {
    console.log('❌ Database host DNS test failed:', dnsError.message);
  }

  // Test 3: Database tables (only if GraphQL works)
  if (graphqlReachable) {
    try {
      console.log('\n3️⃣ Testing database tables...');
      const graphqlUrl = `https://${subdomain}.nhost.run/v1/graphql`;
      const dbResponse = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              users_profiles(limit: 1) {
                id
                email
              }
            }
          `
        })
      });

      if (dbResponse.ok) {
        const data = await dbResponse.json();
        console.log('✅ Database tables accessible');
        console.log('📊 Sample data:', JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ Database query failed: ${dbResponse.status} ${dbResponse.statusText}`);
      }
    } catch (dbError) {
      console.error('❌ Database tables test failed:', dbError.message);
    }
  } else {
    console.log('\n⏭️ Skipping database tables test (GraphQL not available)');
  }

  console.log('\n🔗 Connection URLs:');
  console.log(`   GraphQL: https://${subdomain}.nhost.run/v1/graphql`);
  console.log(`   Auth: https://${subdomain}.nhost.run/v1/auth`);
  console.log(`   Storage: https://${subdomain}.nhost.run/v1/storage`);
  console.log(`   Functions: https://${subdomain}.nhost.run/v1/functions`);
  console.log(`   Direct DB: postgres://${dbUser}:${dbPassword ? '***' : ''}@${dbHost}:${dbPort}/${dbName}`);

  console.log('\n💡 Next Steps:');
  if (!dbPassword) {
    console.log('1. ⚠️  Set DB_PASSWORD in your .env.local file');
    console.log('2. Generate a new password from Nhost dashboard if needed');
  }
  console.log('3. Test authentication with real credentials');
  console.log('4. Check if database migrations are applied');
  console.log('5. Verify Nhost project permissions');
}

testNhostConnection().catch(console.error);
