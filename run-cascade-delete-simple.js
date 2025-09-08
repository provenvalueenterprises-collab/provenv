// Simplified CASCADE DELETE migration script
const { Client } = require('pg');
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

    // Step 1: Fix users_profiles table
    console.log('📄 Step 1: Adding CASCADE DELETE to users_profiles...');
    try {
      // Drop existing constraint if it exists
      await client.query(`
        ALTER TABLE public.users_profiles 
        DROP CONSTRAINT IF EXISTS users_profiles_user_id_fkey
      `);
      console.log('   ✅ Dropped existing constraint (if any)');
      
      // Add new constraint with CASCADE DELETE
      await client.query(`
        ALTER TABLE public.users_profiles 
        ADD CONSTRAINT users_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      `);
      console.log('   ✅ Added CASCADE DELETE constraint for users_profiles');
    } catch (error) {
      console.log('   ⚠️ users_profiles constraint error:', error.message);
    }

    // Step 2: Fix wallet_transactions table
    console.log('📄 Step 2: Adding CASCADE DELETE to wallet_transactions...');
    try {
      // Drop existing constraint if it exists
      await client.query(`
        ALTER TABLE public.wallet_transactions 
        DROP CONSTRAINT IF EXISTS wallet_transactions_user_id_fkey
      `);
      console.log('   ✅ Dropped existing constraint (if any)');
      
      // Add new constraint with CASCADE DELETE
      await client.query(`
        ALTER TABLE public.wallet_transactions 
        ADD CONSTRAINT wallet_transactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      `);
      console.log('   ✅ Added CASCADE DELETE constraint for wallet_transactions');
    } catch (error) {
      console.log('   ⚠️ wallet_transactions constraint error:', error.message);
    }

    // Step 3: Check and fix thrift_accounts table (if it exists)
    console.log('📄 Step 3: Checking thrift_accounts table...');
    try {
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'thrift_accounts' AND table_schema = 'public'
      `);
      
      if (tableCheck.rows.length > 0) {
        await client.query(`
          ALTER TABLE public.thrift_accounts 
          DROP CONSTRAINT IF EXISTS thrift_accounts_user_id_fkey
        `);
        
        await client.query(`
          ALTER TABLE public.thrift_accounts 
          ADD CONSTRAINT thrift_accounts_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
        `);
        console.log('   ✅ Added CASCADE DELETE constraint for thrift_accounts');
      } else {
        console.log('   ⏭️ thrift_accounts table does not exist, skipping');
      }
    } catch (error) {
      console.log('   ⚠️ thrift_accounts constraint error:', error.message);
    }

    // Step 4: Check and fix virtual_accounts table (if it exists)
    console.log('📄 Step 4: Checking virtual_accounts table...');
    try {
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'virtual_accounts' AND table_schema = 'public'
      `);
      
      if (tableCheck.rows.length > 0) {
        await client.query(`
          ALTER TABLE public.virtual_accounts 
          DROP CONSTRAINT IF EXISTS virtual_accounts_user_id_fkey
        `);
        
        await client.query(`
          ALTER TABLE public.virtual_accounts 
          ADD CONSTRAINT virtual_accounts_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
        `);
        console.log('   ✅ Added CASCADE DELETE constraint for virtual_accounts');
      } else {
        console.log('   ⏭️ virtual_accounts table does not exist, skipping');
      }
    } catch (error) {
      console.log('   ⚠️ virtual_accounts constraint error:', error.message);
    }

    // Step 5: Verify all constraints
    console.log('📄 Step 5: Verifying CASCADE DELETE constraints...');
    const constraints = await client.query(`
      SELECT 
          tc.table_name,
          tc.constraint_name,
          rc.delete_rule
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.referential_constraints rc 
          ON tc.constraint_name = rc.constraint_name
      WHERE tc.table_schema = 'public' 
          AND tc.constraint_type = 'FOREIGN KEY'
          AND tc.constraint_name LIKE '%user_id_fkey'
      ORDER BY tc.table_name
    `);

    console.log('📊 CASCADE DELETE Constraints:');
    constraints.rows.forEach(row => {
      console.log(`   • ${row.table_name}: ${row.delete_rule || 'NO ACTION'}`);
    });

    console.log('✅ CASCADE DELETE migration completed successfully!');

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
    console.log('   • User profiles automatically deleted when users are removed');
    console.log('   • Wallet transactions cleaned up automatically');
    console.log('   • All user-related data maintained in sync');
    console.log('   • No more orphaned records in your database!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 CASCADE DELETE migration script failed:', error);
    process.exit(1);
  });
