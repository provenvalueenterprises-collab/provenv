import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Testing Nhost GraphQL endpoint...');

    // Test GraphQL endpoint with a simple query
    const response = await fetch('https://sbpnfqrsnvtyvkgldcco.graphql.eu-central-1.nhost.run/v1', {
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

    const data = await response.json();

    res.status(200).json({
      timestamp: new Date().toISOString(),
      endpoint: 'https://sbpnfqrsnvtyvkgldcco.graphql.eu-central-1.nhost.run/v1',
      status: response.status,
      statusText: response.statusText,
      response: data,
      success: response.ok
    });

  } catch (error) {
    console.error('❌ GraphQL test failed:', error);
    res.status(500).json({
      error: 'GraphQL test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
