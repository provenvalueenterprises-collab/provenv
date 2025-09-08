// Migration script to add CASCADE DELETE constraints
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.nextauth' });

async function runCascadeDeleteMigration() {
  console.log('🔄 Starting CASCADE DELETE migration');
  console.log('📋 This will ensure user data is automatically cleaned up when users are deleted');

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'add-cascade-delete-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running CASCADE DELETE migration...');
    
    // Execute the migration
    const result = await client.query(migrationSQL);
    
    console.log('✅ CASCADE DELETE migration completed successfully!');
    
    // Show the results
    if (result && Array.isArray(result)) {
      // Get the verification query results (last query in the migration)
      const verificationResults = result[result.length - 2]; // Second to last result
      if (verificationResults && verificationResults.rows) {
        console.log('📊 Foreign Key Constraints with CASCADE DELETE:');
        verificationResults.rows.forEach(row => {
          console.log(`   Table: ${row.table_name}`);
          console.log(`   Constraint: ${row.constraint_name}`);
          console.log(`   Delete Rule: ${row.delete_rule}`);
          console.log('   ---');
        });
      }
      
      // Show final status
      const statusResult = result[result.length - 1];
      if (statusResult && statusResult.rows) {
        console.log('🎉', statusResult.rows[0].status);
      }
    }

  } catch (error) {
    console.error('❌ CASCADE DELETE migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runCascadeDeleteMigration()
  .then(() => {
    console.log('🎉 CASCADE DELETE migration script completed');
    console.log('');
    console.log('✅ Benefits:');
    console.log('   • User profiles are automatically deleted when users are removed');
    console.log('   • Wallet transactions are cleaned up automatically');
    console.log('   • Thrift accounts and plans are removed with users');
    console.log('   • Virtual accounts are cleaned up automatically');
    console.log('   • Email verifications are handled via trigger');
    console.log('   • No more orphaned data in your database!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 CASCADE DELETE migration script failed:', error);
    process.exit(1);
  });
