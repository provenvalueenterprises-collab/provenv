import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

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

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🕐 Daily contribution cron job started at:', new Date().toISOString());
    
    // Execute the automated daily contribution processing
    await client.query('SELECT process_daily_contributions()');
    
    // Get processing summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_processed,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_contributions,
        COUNT(CASE WHEN status = 'defaulted' THEN 1 END) as defaults_created,
        SUM(CASE WHEN status = 'completed' THEN actual_amount ELSE 0 END) as total_collected,
        SUM(CASE WHEN status = 'defaulted' THEN penalty_amount ELSE 0 END) as total_penalties
      FROM daily_contributions 
      WHERE expected_date = CURRENT_DATE 
      AND auto_processed = true
    `;
    
    const summaryResult = await client.query(summaryQuery);
    const summary = summaryResult.rows[0];

    // Get active accounts count
    const activeAccountsQuery = `
      SELECT COUNT(*) as active_accounts
      FROM thrift_accounts 
      WHERE status = 'active' 
      AND start_date <= CURRENT_DATE
    `;
    const activeAccountsResult = await client.query(activeAccountsQuery);
    const activeAccounts = parseInt(activeAccountsResult.rows[0].active_accounts);

    const response = {
      success: true,
      processed_date: new Date().toISOString().split('T')[0],
      processing_time: new Date().toISOString(),
      summary: {
        active_accounts: activeAccounts,
        total_processed: parseInt(summary.total_processed),
        successful_contributions: parseInt(summary.successful_contributions),
        defaults_created: parseInt(summary.defaults_created),
        total_amount_collected: parseFloat(summary.total_collected || 0),
        total_penalties_applied: parseFloat(summary.total_penalties || 0),
        success_rate: activeAccounts > 0 ? ((parseInt(summary.successful_contributions) / activeAccounts) * 100).toFixed(2) + '%' : '0%'
      }
    };
    
    console.log('✅ Daily contribution cron job completed successfully:', response.summary);
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Daily contribution cron job failed:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to process daily contributions',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  } finally {
    await client.end();
  }
}
