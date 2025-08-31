const { nhost } = require('./lib/nhost');

async function checkDatabaseTables() {
  try {
    console.log('🔍 Checking database tables...');

    // Query to get all tables in the public schema
    const { data, error } = await nhost.graphql.request(`
      query {
        information_schema_tables(where: {table_schema: {_eq: "public"}}) {
          table_name
        }
      }
    `);

    if (error) {
      console.error('❌ Error querying database:', error);
      return;
    }

    console.log('📋 Tables in public schema:');
    data?.information_schema_tables?.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Specifically check for user profile related tables
    const userTables = data?.information_schema_tables?.filter(table =>
      table.table_name.includes('user') || table.table_name.includes('profile')
    );

    console.log('\n👤 User-related tables:');
    userTables?.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Try to query the user_profiles table to see if it exists
    console.log('\n🔍 Testing users_profiles table...');
    const profileQuery = await nhost.graphql.request(`
      query {
        users_profiles(limit: 1) {
          id
          user_id
          phone
          wallet_balance
        }
      }
    `);

    if (profileQuery.error) {
      console.error('❌ users_profiles table query failed:', profileQuery.error.message);
    } else {
      console.log('✅ users_profiles table exists and is accessible');
      console.log('Sample data:', profileQuery.data?.users_profiles?.[0] || 'No data');
    }

    // Try to query the users_profiles table to see if it exists
    console.log('\n🔍 Testing users_profiles table...');
    const profilesQuery = await nhost.graphql.request(`
      query {
        users_profiles(limit: 1) {
          id
          user_id
          phone
          wallet_balance
        }
      }
    `);

    if (profilesQuery.error) {
      console.error('❌ users_profiles table query failed:', profilesQuery.error.message);
    } else {
      console.log('✅ users_profiles table exists and is accessible');
      console.log('Sample data:', profilesQuery.data?.users_profiles?.[0] || 'No data');
    }

  } catch (err) {
    console.error('❌ Script error:', err);
  }
}

checkDatabaseTables();
