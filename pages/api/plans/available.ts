import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

// PostgreSQL connection pool using credentials from .env.nextauth
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  let client;
  try {
    console.log('🔗 Fetching contribution plans from PostgreSQL...')
    client = await pool.connect()

    // Fetch all available contribution plans
    const planQuery = `
      SELECT * FROM contribution_plans 
      ORDER BY category ASC, daily_amount ASC
    `
    const result = await client.query(planQuery)

    return res.status(200).json({
      plans: result.rows || [],
      count: result.rows?.length || 0
    })

  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (client) {
      client.release()
    }
  }
}
