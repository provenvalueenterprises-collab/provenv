import { NextApiRequest, NextApiResponse } from 'next';
import { nhost } from '../../../lib/nhost';
import { emailService } from '../../../lib/email';
import { userStore } from '../../../lib/user-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'Invalid verification token' });
  }

  try {
    // Since we're using Nhost auth, email verification is handled automatically
    // Users are created as verified by default
    console.log('Email verification attempt with token:', token);

    // For backward compatibility, we'll just redirect to login with success message
    res.redirect('/login?verified=true');

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      message: 'Internal server error during email verification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
