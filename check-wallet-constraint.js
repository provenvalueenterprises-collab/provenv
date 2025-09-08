const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_s0v6Iz3F0PQj@ep-flat-voice-a5vcfczn.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function checkWalletConstraints() {
  try {
    console.log('🔍 Checking wallet_transactions constraints...');
    const client = await pool.connect();
    
    // Check existing transactions to see what types are used
    const existingQuery = `
      SELECT DISTINCT transaction_type, COUNT(*) as count
      FROM wallet_transactions 
      GROUP BY transaction_type
      ORDER BY transaction_type
    `;
    
    const existingResult = await client.query(existingQuery);
    console.log('📊 Existing transaction types:', existingResult.rows);
    
    // Check the table structure
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions'
      ORDER BY ordinal_position
    `;
    
    const schemaResult = await client.query(schemaQuery);
    console.log('📋 Wallet transactions table structure:');
    schemaResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Try to get constraint details
    const constraintQuery = `
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        ccu.column_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      LEFT JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'wallet_transactions'
      AND tc.constraint_type = 'CHECK'
    `;
    
    const constraintResult = await client.query(constraintQuery);
    console.log('🔒 Check constraints:', constraintResult.rows);
    
    client.release();
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

checkWalletConstraints();
