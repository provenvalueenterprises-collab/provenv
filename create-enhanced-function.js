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

async function createSimpleEnhancedFunction() {
  try {
    console.log('🚀 CREATING SIMPLE ENHANCED DAILY PROCESSING...\n');
    
    // Drop existing function first
    await pool.query('DROP FUNCTION IF EXISTS process_daily_contributions_enhanced()');
    
    // Create the enhanced function with proper variable naming
    const sql = `
      CREATE OR REPLACE FUNCTION process_daily_contributions_enhanced()
      RETURNS JSONB AS $$
      DECLARE
        user_record RECORD;
        user_balance DECIMAL;
        daily_amount DECIMAL;
        account_id UUID;
        processing_date DATE := CURRENT_DATE;
        local_success_count INTEGER := 0;
        local_default_count INTEGER := 0;
        local_total_deducted DECIMAL := 0;
        local_total_penalties DECIMAL := 0;
        local_users_processed INTEGER := 0;
        summary JSONB;
      BEGIN
        -- Process all active thrift accounts
        FOR user_record IN 
          SELECT DISTINCT 
            ta.user_id,
            ta.id as thrift_account_id,
            cp.daily_amount,
            ta.account_number,
            up.wallet_balance
          FROM thrift_accounts ta
          JOIN contribution_plans cp ON ta.plan_id = cp.id
          JOIN user_profiles up ON ta.user_id = up.user_id
          WHERE ta.status = 'active'
          AND ta.start_date <= processing_date
          AND ta.maturity_date > processing_date
        LOOP
          local_users_processed := local_users_processed + 1;
          user_balance := COALESCE(user_record.wallet_balance, 0);
          daily_amount := user_record.daily_amount;
          account_id := user_record.thrift_account_id;
          
          -- Check if contribution already processed for today
          IF NOT EXISTS (
            SELECT 1 FROM daily_contributions 
            WHERE user_id = user_record.user_id 
            AND thrift_account_id = account_id
            AND expected_date = processing_date
          ) THEN
            
            -- Create daily contribution record
            INSERT INTO daily_contributions (
              id, thrift_account_id, user_id, expected_date, expected_amount,
              status, created_at, auto_processed
            ) VALUES (
              gen_random_uuid(), account_id, user_record.user_id, processing_date, 
              daily_amount, 'pending', NOW(), true
            );
            
            -- Check if user has sufficient balance
            IF user_balance >= daily_amount THEN
              -- Deduct contribution
              UPDATE user_profiles 
              SET wallet_balance = wallet_balance - daily_amount,
                  updated_at = NOW()
              WHERE user_id = user_record.user_id;
              
              -- Update contribution record
              UPDATE daily_contributions 
              SET 
                actual_date = processing_date,
                actual_amount = daily_amount,
                status = 'paid'
              WHERE user_id = user_record.user_id 
              AND thrift_account_id = account_id
              AND expected_date = processing_date;
              
              -- Update thrift account
              UPDATE thrift_accounts 
              SET 
                amount_saved = amount_saved + daily_amount,
                last_contribution_date = processing_date,
                updated_at = NOW()
              WHERE id = account_id;
              
              local_success_count := local_success_count + 1;
              local_total_deducted := local_total_deducted + daily_amount;
              
            ELSE
              -- Insufficient balance - create default
              UPDATE daily_contributions 
              SET 
                status = 'defaulted',
                penalty_applied = true,
                penalty_amount = daily_amount
              WHERE user_id = user_record.user_id 
              AND thrift_account_id = account_id
              AND expected_date = processing_date;
              
              -- Create penalty tracking record
              INSERT INTO penalty_tracking (
                id, user_id, thrift_account_id, default_date, original_amount,
                penalty_amount, total_amount_due, status, created_at
              ) VALUES (
                gen_random_uuid(), user_record.user_id, account_id, processing_date,
                daily_amount, daily_amount, daily_amount * 2, 'pending', NOW()
              );
              
              -- Update thrift account defaults
              UPDATE thrift_accounts 
              SET 
                total_defaults = total_defaults + 1,
                updated_at = NOW()
              WHERE id = account_id;
              
              local_default_count := local_default_count + 1;
              local_total_penalties := local_total_penalties + daily_amount;
            END IF;
          END IF;
        END LOOP;
        
        -- Build summary
        summary := jsonb_build_object(
          'processing_date', processing_date,
          'users_processed', local_users_processed,
          'successful_deductions', local_success_count,
          'defaults_created', local_default_count,
          'total_deducted', local_total_deducted,
          'total_penalties', local_total_penalties,
          'completion_time', NOW()
        );
        
        -- Log the processing
        INSERT INTO daily_deduction_logs (id, deduction_date, total_processed, success_count, failure_count, total_amount, details)
        VALUES (gen_random_uuid(), processing_date, local_users_processed, local_success_count, local_default_count, local_total_deducted, summary);
        
        RETURN summary;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await pool.query(sql);
    console.log('✅ Enhanced function created successfully!');
    
    // Test the function
    console.log('\n🧪 TESTING ENHANCED FUNCTION...');
    const result = await pool.query('SELECT process_daily_contributions_enhanced() as result');
    
    const summary = result.rows[0].result;
    console.log('📊 Processing Summary:', JSON.stringify(summary, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createSimpleEnhancedFunction();
