import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
const AutoDeductionService = require('../../../lib/auto-deduction-service');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`🔧 Manual settlement processing for ${session.user.email}`);

    // Get user ID from email
    const { Client } = require('pg');
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    await client.connect();

    const userQuery = `SELECT id FROM auth.users WHERE email = $1`;
    const userResult = await client.query(userQuery, [session.user.email]);
    
    if (userResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    await client.end();

    // Process settlements
    const autoDeductionService = new AutoDeductionService();
    await autoDeductionService.processWalletFundingSettlements(user.id, 0); // 0 amount since we're just processing existing balance

    console.log('✅ Manual settlement processing completed');

    res.status(200).json({
      success: true,
      message: 'Settlement processing completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Manual settlement error:', error);
    res.status(500).json({ 
      error: 'Settlement processing failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
