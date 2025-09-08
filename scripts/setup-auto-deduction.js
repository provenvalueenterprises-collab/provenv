const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Provenvalueenterprise@123!@sbpnfqrsnvtyvkgldcco.db.eu-central-1.nhost.run:5432/sbpnfqrsnvtyvkgldcco?sslmode=require'
});

async function setupTables() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up auto-deduction tables...');
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, '../sql/create-settlement-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    console.log('✅ Tables created successfully');
    
    // Verify tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('pending_settlements', 'daily_contributions')
    `;
    
    const result = await client.query(tablesQuery);
    console.log('📋 Tables verified:', result.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Error setting up tables:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

setupTables().catch(console.error);
