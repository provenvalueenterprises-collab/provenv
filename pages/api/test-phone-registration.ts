import { NextApiRequest, NextApiResponse } from 'next';
import { userStore } from '../../lib/user-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing phone-only user creation...');

    // Create a test user with phone only (no email)
    const testUser = await userStore.createUser({
      display_name: 'Test Phone User',
      email: null, // No email provided
      phone: '+2348012345678',
      phone_number: '+2348012345678',
      password: 'testpass123',
    });

    if (testUser) {
      console.log('✅ Phone-only user created successfully:', {
        id: testUser.id,
        name: testUser.display_name,
        phone: testUser.phone,
        email: testUser.email
      });

      res.status(200).json({
        success: true,
        message: 'Phone-only user created successfully',
        user: {
          id: testUser.id,
          name: testUser.display_name,
          phone: testUser.phone,
          email: testUser.email
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create phone-only user'
      });
    }

  } catch (error) {
    console.error('❌ Phone-only user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating phone-only user',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
