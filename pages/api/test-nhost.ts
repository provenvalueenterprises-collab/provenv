import { NextApiRequest, NextApiResponse } from 'next';
import { testNhostConnection, nhost, testDirectDatabaseConnection } from '@/lib/nhost';

interface TestResult {
  timestamp: string;
  environment: {
    useNhost: string | undefined;
    subdomain: string | undefined;
    region: string | undefined;
  };
  connectionTest: { success: boolean; message: string };
  authStatus: {
    isAuthenticated: boolean;
    user: any;
    session: any;
  };
  graphqlTest: { success: boolean; message: string };
  tablesTest: { success: boolean; message: string; data?: any };
  recommendations: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Starting Nhost connection test...');

    // Test basic connection
    const connectionTest = await testNhostConnection();

    // Test authentication status
    const authStatus = {
      isAuthenticated: nhost.auth.isAuthenticated(),
      user: nhost.auth.getUser(),
      session: nhost.auth.getSession()
    };

    // Test GraphQL query
    let graphqlTest = { success: false, message: 'Not tested' };
    try {
      const response = await fetch(`https://${process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN}.nhost.run/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query TestConnection {
              __typename
            }
          `
        })
      });

      graphqlTest = {
        success: response.ok,
        message: response.ok ? 'GraphQL endpoint reachable' : `HTTP ${response.status}: ${response.statusText}`
      };
    } catch (error) {
      graphqlTest = {
        success: false,
        message: error instanceof Error ? error.message : 'GraphQL test failed'
      };
    }

    // Test database tables (if available)
    let tablesTest: { success: boolean; message: string; data?: any } = { success: false, message: 'Not tested' };
    try {
      const response = await fetch(`https://${process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN}.nhost.run/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query TestTables {
              users_profiles(limit: 1) {
                id
                email
              }
            }
          `
        })
      });

      if (response.ok) {
        const data = await response.json();
        tablesTest = {
          success: true,
          message: 'Database tables accessible',
          data: data
        };
      } else {
        tablesTest = {
          success: false,
          message: `Database query failed: HTTP ${response.status}`
        };
      }
    } catch (error) {
      tablesTest = {
        success: false,
        message: error instanceof Error ? error.message : 'Database test failed'
      };
    }

    const result: TestResult = {
      timestamp: new Date().toISOString(),
      environment: {
        useNhost: process.env.NEXT_PUBLIC_USE_NHOST,
        subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
        region: process.env.NEXT_PUBLIC_NHOST_REGION
      },
      connectionTest,
      authStatus,
      graphqlTest,
      tablesTest,
      recommendations: []
    };

    // Add recommendations based on results
    if (!connectionTest.success) {
      result.recommendations.push('Check Nhost subdomain and region configuration');
      result.recommendations.push('Verify Nhost project is active and accessible');
    }

    if (!authStatus.isAuthenticated) {
      result.recommendations.push('No active authentication session found');
    }

    if (!graphqlTest.success) {
      result.recommendations.push('GraphQL endpoint is not reachable');
      result.recommendations.push('Check network connectivity and Nhost project status');
    }

    if (!tablesTest.success) {
      result.recommendations.push('Database tables may not exist or permissions are incorrect');
      result.recommendations.push('Check if migrations have been run in Nhost');
    }

    console.log('🧪 Nhost connection test completed:', result);

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Nhost connection test failed:', error);
    return res.status(500).json({
      error: 'Connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
