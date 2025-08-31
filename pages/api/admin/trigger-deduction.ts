import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // Only allow admin users to trigger manual deduction
  if (!session || session.user.email !== 'admin@provenvalue.com') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cron/daily-deduction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({
        message: 'Manual daily deduction completed',
        ...result
      });
    } else {
      res.status(response.status).json({
        message: 'Manual daily deduction failed',
        error: result
      });
    }

  } catch (error) {
    console.error('Manual deduction trigger error:', error);
    res.status(500).json({
      message: 'Failed to trigger manual deduction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
