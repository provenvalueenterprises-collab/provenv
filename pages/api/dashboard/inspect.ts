import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// API endpoint to inspect database schema and contents
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('🔍 Database Inspector: Starting comprehensive database analysis...');

  try {
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    console.log('🔌 Database Inspector: Connected successfully');

    // 1. Get all tables in the database
    console.log('📋 Database Inspector: Fetching table list...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('📊 Database Inspector: Found tables:', tables);

    // 2. For each table, get column info and row count
    const tableInfo: Record<string, any> = {};
    
    for (const tableName of tables) {
      try {
        console.log(`🔍 Database Inspector: Analyzing table '${tableName}'...`);
        
        // Get columns
        const columnsResult = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [tableName]);

        // Get row count
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const rowCount = parseInt(countResult.rows[0].count);

        // Get sample data if rows exist
        let sampleData = [];
        if (rowCount > 0) {
          const sampleResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT 3`);
          sampleData = sampleResult.rows;
        }

        tableInfo[tableName] = {
          columns: columnsResult.rows,
          rowCount,
          sampleData
        };

        console.log(`✅ Database Inspector: Table '${tableName}' - ${rowCount} rows, ${columnsResult.rows.length} columns`);
        
      } catch (tableError: any) {
        console.error(`❌ Database Inspector: Error analyzing table '${tableName}':`, tableError?.message);
        tableInfo[tableName] = { error: tableError?.message };
      }
    }

    // 3. Check environment info
    const envInfo = {
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PORT: process.env.DB_PORT,
      passwordExists: !!process.env.DB_PASSWORD
    };

    console.log('🔧 Database Inspector: Environment check completed');

    await pool.end();

    console.log('✅ Database Inspector: Analysis complete!');

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        environment: envInfo
      },
      schema: {
        tableCount: tables.length,
        tables: tableInfo
      },
      summary: {
        totalTables: tables.length,
        tablesWithData: Object.values(tableInfo).filter((info: any) => info?.rowCount > 0).length,
        totalRows: Object.values(tableInfo).reduce((sum: number, info: any) => sum + (info?.rowCount || 0), 0)
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('❌ Database Inspector Error:', error);
    res.status(500).json({ 
      error: 'Database inspection failed',
      message: error?.message,
      timestamp: new Date().toISOString()
    });
  }
}
