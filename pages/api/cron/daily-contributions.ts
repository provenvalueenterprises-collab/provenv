import { NextApiRequest, NextApiResponse } from 'next';
const AutoDeductionService = require('../../../lib/auto-deduction-service');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.CRON_SECRET_TOKEN || 'default-cron-secret';
  
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log('🕐 Daily contribution cron job started at:', new Date().toISOString());
    
    const autoDeductionService = new AutoDeductionService();
    await autoDeductionService.processDailyContributions();
    
    console.log('✅ Daily contribution cron job completed successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Daily contributions processed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Daily contribution cron job failed:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to process daily contributions',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
