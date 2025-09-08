// pages/api/payments/verify-simple.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🔍 Simple verification endpoint called');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    console.log('🔐 Session check:', !!session, session?.user?.email);

    if (!session?.user?.email) {
      console.log('❌ Unauthorized - no session');
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - please login first' 
      })
    }

    // Return success for testing
    console.log('✅ Simple verification successful');
    return res.status(200).json({
      success: true,
      verified: false,
      message: 'Simple verification endpoint working',
      user: session.user.email
    });

  } catch (error) {
    console.error('❌ Error in simple verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
