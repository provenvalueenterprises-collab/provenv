const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_s0v6Iz3F0PQj@ep-flat-voice-a5vcfczn.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function checkThriftAccountsTable() {
  try {
    console.log('🔍 Checking thrift_accounts table structure...');
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'thrift_accounts'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 thrift_accounts table columns:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    client.release();
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

checkThriftAccountsTable();
