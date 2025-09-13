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

async function checkComplaintsTable() {
  try {
    console.log('🎫 CHECKING COMPLAINTS TABLE STRUCTURE...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'complaints' 
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ COMPLAINTS TABLE:');
      result.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
      });
    } else {
      console.log('❌ COMPLAINTS TABLE NOT FOUND');
    }
    
    // Check sample data
    console.log('\n📊 SAMPLE COMPLAINTS DATA:');
    const sampleData = await pool.query('SELECT * FROM complaints LIMIT 3');
    console.log(`Found ${sampleData.rows.length} complaints`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkComplaintsTable();
