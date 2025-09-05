import { NextApiRequest, NextApiResponse } from 'next';
import { directDb } from '../../../lib/direct-db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all users to check existing emails and phone numbers
    const client = await directDb.getClient();
    
    const result = await client.query(`
      SELECT 
        u.email,
        u.phone_number,
        u.created_at,
        up.phone as profile_phone
      FROM auth.users u
      LEFT JOIN public.users_profiles up ON u.id = up.user_id
      ORDER BY u.created_at DESC
      LIMIT 10
    `);
    
    client.release();
    
    res.status(200).json({
      users: result.rows,
      message: 'Existing users retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
