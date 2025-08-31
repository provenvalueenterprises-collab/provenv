import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Generate a new verification token
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    console.log('Verification email resent to:', email);

    res.status(200).json({
      message: 'Verification email sent successfully! Check your inbox.'
    });

  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({
      message: 'Failed to resend verification email. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
