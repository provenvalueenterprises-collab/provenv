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

async function enhanceComplaintsSystem() {
  try {
    console.log('🎫 ENHANCING COMPLAINTS SYSTEM...\n');
    
    // Add category field if missing
    await pool.query(`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general'
    `);
    console.log('✅ Added category field');
    
    // Add description field (rename message to description for consistency)
    await pool.query(`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS description TEXT
    `);
    console.log('✅ Added description field');
    
    // Update existing records to use new fields
    await pool.query(`
      UPDATE complaints 
      SET description = message 
      WHERE description IS NULL AND message IS NOT NULL
    `);
    console.log('✅ Migrated existing data');
    
    // Show updated structure
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'complaints' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 UPDATED COMPLAINTS STRUCTURE:');
    result.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

enhanceComplaintsSystem();
