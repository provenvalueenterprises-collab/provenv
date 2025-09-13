require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true'
});

async function checkThriftTables() {
  try {
    console.log('📋 CHECKING DATABASE TABLES FOR THRIFT SYSTEM...\n');
    
    // Tables needed for complete thrift system
    const requiredTables = [
      'daily_contributions',
      'thrift_accounts', 
      'penalty_tracking',
      'daily_deduction_logs',
      'contributions',
      'contribution_plans',
      'wallet_transactions',
      'user_profiles',
      'referral_bonuses',
      'complaint_tickets'
    ];
    
    for (const table of requiredTables) {
      try {
        const result = await pool.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [table]);
        
        if (result.rows.length > 0) {
          console.log(`✅ TABLE: ${table.toUpperCase()}`);
          result.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
          });
          console.log('');
        } else {
          console.log(`❌ TABLE MISSING: ${table.toUpperCase()}`);
          console.log('');
        }
      } catch (err) {
        console.log(`❌ TABLE MISSING: ${table.toUpperCase()}`);
        console.log('');
      }
    }
    
    // Check for any additional relevant tables
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 ALL EXISTING TABLES:');
    allTables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check existing functions
    console.log('\n🔧 CHECKING DATABASE FUNCTIONS:');
    const functions = await pool.query(`
      SELECT routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      ORDER BY routine_name
    `);
    
    functions.rows.forEach(func => {
      console.log(`   - ${func.routine_name} (${func.routine_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await pool.end();
  }
}

checkThriftTables();
