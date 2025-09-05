import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in database
    await pool.query(
      `INSERT INTO public.email_verifications (user_email, token, expires_at) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_email) 
       DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()`,
      [session.user.email, verificationToken, expiresAt]
    );

    // In a real application, you would send an email here
    // For now, we'll just return the token for testing purposes
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/profile/verify-email?token=${verificationToken}&email=${encodeURIComponent(session.user.email)}`;

    console.log('📧 Email verification URL (for testing):', verificationUrl);

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      // Remove this in production and send actual email
      verificationUrl: process.env.NODE_ENV === 'development' ? verificationUrl : undefined
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
