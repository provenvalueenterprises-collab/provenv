import { NhostClient } from '@nhost/nhost-js'

const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'sbpnfqrsnvtyvkgldcco',
  region: process.env.NEXT_PUBLIC_NHOST_REGION || 'eu-central-1'
})

// Direct PostgreSQL connection configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'sbpnfqrsnvtyvkgldcco.db.eu-central-1.nhost.run',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sbpnfqrsnvtyvkgldcco',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL !== 'false'
};

// Connection test function
export const testNhostConnection = async () => {
  try {
    console.log('🔍 Testing Nhost connection...');
    console.log('📍 Nhost Config:', {
      subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
      region: process.env.NEXT_PUBLIC_NHOST_REGION,
      useNhost: process.env.NEXT_PUBLIC_USE_NHOST
    });

    // Test basic connectivity
    const isAuthenticated = nhost.auth.isAuthenticated();
    console.log('🔐 Current auth status:', isAuthenticated);

    // Test GraphQL endpoint
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN}.nhost.run/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            __typename
          }
        `
      })
    });

    if (response.ok) {
      console.log('✅ Nhost GraphQL endpoint is reachable');
      return { success: true, message: 'Nhost connection successful' };
    } else {
      console.error('❌ Nhost GraphQL endpoint error:', response.status, response.statusText);
      return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('❌ Nhost connection test failed:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Direct PostgreSQL connection test
export const testDirectDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing direct PostgreSQL connection...');

    // For now, we'll test the connection string format
    const connectionString = `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

    console.log('📋 Connection Details:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   SSL: ${dbConfig.ssl}`);
    console.log(`   Connection String: ${connectionString.replace(/:[^:]*@/, ':***@')}`); // Hide password

    // Test if we can reach the database host
    const testResponse = await fetch(`https://dns.google/resolve?name=${dbConfig.host}`, {
      method: 'GET'
    });

    if (testResponse.ok) {
      const dnsData = await testResponse.json();
      if (dnsData.Answer && dnsData.Answer.length > 0) {
        console.log('✅ Database host is reachable via DNS');
        return {
          success: true,
          message: 'Database host is reachable',
          connectionString: connectionString,
          dnsResolved: true
        };
      }
    }

    console.log('⚠️ Cannot verify database host reachability');
    return {
      success: false,
      message: 'Cannot verify database host reachability',
      connectionString: connectionString,
      dnsResolved: false
    };

  } catch (error) {
    console.error('❌ Direct database connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      connectionString: null,
      dnsResolved: false
    };
  }
};

export { nhost }