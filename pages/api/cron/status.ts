import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check environment configuration
    const cronSecret = process.env.CRON_SECRET_TOKEN;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nodeEnv = process.env.NODE_ENV;

    const config = {
      timestamp: new Date().toISOString(),
      environment: {
        CRON_SECRET_TOKEN: cronSecret ? '✅ Configured' : '❌ Missing',
        NEXTAUTH_URL: nextAuthUrl || '❌ Not set',
        NODE_ENV: nodeEnv || 'development'
      },
      cronSchedule: {
        pattern: '0 6 * * *',
        description: 'Daily at 6:00 AM WAT',
        timezone: 'Africa/Lagos',
        nextRun: getNextCronRun()
      },
      endpoints: {
        primary: '/api/cron/daily-contributions',
        alternative: '/api/cron/daily-deduction',
        testInterface: '/test-auto-deduction',
        status: '/api/cron/status'
      },
      features: [
        'Daily contribution processing',
        'Wallet balance validation', 
        'Penalty system for missed payments',
        'Pending settlements management',
        'Comprehensive transaction logging',
        'Error handling and recovery'
      ],
      status: cronSecret ? 'READY' : 'CONFIGURATION_REQUIRED'
    };

    res.status(200).json({
      success: true,
      message: 'Auto-deduction system status',
      config
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getNextCronRun(): string {
  const now = new Date();
  const lagos = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Lagos"}));
  
  // Set to 6:00 AM Lagos time
  const nextRun = new Date(lagos);
  nextRun.setHours(6, 0, 0, 0);
  
  // If 6 AM has passed today, set for tomorrow
  if (nextRun <= lagos) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  return nextRun.toISOString();
}
