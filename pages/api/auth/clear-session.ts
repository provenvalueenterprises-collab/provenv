import { NextApiRequest, NextApiResponse } from 'next';
import { nhost } from '../../../lib/nhost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Clearing Nhost session...');

    // Check current authentication status
    const currentUser = nhost.auth.getUser();
    console.log('Current user before signout:', currentUser ? currentUser.email : 'No user');

    // Sign out if there's an active session
    if (currentUser) {
      console.log('📤 Signing out current user...');
      await nhost.auth.signOut();
      console.log('✅ Successfully signed out');
    } else {
      console.log('ℹ️ No active session found');
    }

    // Verify session is cleared
    const userAfterSignOut = nhost.auth.getUser();
    console.log('User after signout:', userAfterSignOut ? userAfterSignOut.email : 'No user');

    res.status(200).json({
      success: true,
      message: 'Nhost session cleared successfully',
      hadActiveSession: !!currentUser,
      currentUser: userAfterSignOut
    });

  } catch (error) {
    console.error('❌ Error clearing Nhost session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear Nhost session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
