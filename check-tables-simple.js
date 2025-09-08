// Simple database query using the working direct-db connection style
require('dotenv').config();
const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false // Disable SSL for now to match working connection
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // List all tables
    console.log('\n📋 Available Tables:');
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    tablesResult.rows.forEach(table => {
      console.log(`- ${table.tablename}`);
    });

    // Check for thrift-related tables
    const thriftTables = tablesResult.rows.filter(table => 
      table.tablename.includes('thrift') || 
      table.tablename.includes('contribution') ||
      table.tablename.includes('plan')
    );

    if (thriftTables.length > 0) {
      console.log('\n💰 Thrift-related tables found:');
      for (const table of thriftTables) {
        console.log(`\n🔍 Checking ${table.tablename}:`);
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM ${table.tablename}`);
          console.log(`   - Records: ${countResult.rows[0].count}`);
          
          if (parseInt(countResult.rows[0].count) > 0) {
            const sampleResult = await client.query(`SELECT * FROM ${table.tablename} LIMIT 3`);
            console.log('   - Sample data:');
            sampleResult.rows.forEach((row, index) => {
              console.log(`     ${index + 1}.`, JSON.stringify(row, null, 2));
            });
          }
        } catch (err) {
          console.log(`   - Error querying table: ${err.message}`);
        }
      }
    } else {
      console.log('\n❌ No thrift-related tables found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n👋 Connection closed');
  }
}

checkTables();
