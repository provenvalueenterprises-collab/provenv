const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Provenvalueenterprise@123!@sbpnfqrsnvtyvkgldcco.db.eu-central-1.nhost.run:5432/sbpnfqrsnvtyvkgldcco?sslmode=require'
});

async function verifyTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying auto-deduction tables...');
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('pending_settlements', 'daily_contributions', 'thrift_accounts', 'contribution_plans')
      ORDER BY table_name
    `;
    
    const result = await client.query(tablesQuery);
    console.log('📋 Tables found:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name} (${row.column_count} columns)`);
    });
    
    // Check pending_settlements structure
    const settlementColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'pending_settlements'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 pending_settlements structure:');
    settlementColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check daily_contributions structure
    const contributionColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'daily_contributions'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 daily_contributions structure:');
    contributionColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n✅ Auto-deduction system ready!');
    
  } catch (error) {
    console.error('❌ Error verifying tables:', error);
  } finally {
    client.release();
    pool.end();
  }
}

verifyTables().catch(console.error);
