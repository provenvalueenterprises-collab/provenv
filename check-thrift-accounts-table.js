const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkAndCreateThriftAccountsTable() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if thrift_accounts table exists
    const tableExists = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'thrift_accounts'
    `);
    
    if (tableExists.rows.length === 0) {
      console.log('❌ thrift_accounts table does not exist. Creating it...');
      
      // Create the thrift_accounts table
      await client.query(`
        CREATE TABLE public.thrift_accounts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          plan_id UUID NOT NULL REFERENCES contribution_plans(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          start_date DATE NOT NULL DEFAULT CURRENT_DATE,
          next_contribution_date DATE,
          total_contributed DECIMAL(15,2) DEFAULT 0,
          current_balance DECIMAL(15,2) DEFAULT 0,
          settlement_amount DECIMAL(15,2),
          is_fast_track BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_thrift_accounts_user_id ON public.thrift_accounts(user_id);
        CREATE INDEX idx_thrift_accounts_plan_id ON public.thrift_accounts(plan_id);
        CREATE INDEX idx_thrift_accounts_status ON public.thrift_accounts(status);
      `);
      
      console.log('✅ thrift_accounts table created successfully');
    } else {
      console.log('✅ thrift_accounts table already exists');
      
      // Get column information
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'thrift_accounts'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Existing table columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})${col.is_nullable === 'YES' ? ' NULL' : ' NOT NULL'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAndCreateThriftAccountsTable();
