const { Client } = require('pg');
require('dotenv').config({ path: '.env.nextauth' });

async function createDailyContributionSystem() {
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
    console.log('🏗️  CREATING DAILY CONTRIBUTION SYSTEM');
    console.log('='.repeat(60));

    // 1. Create penalty_tracking table
    console.log('📋 Creating penalty_tracking table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS penalty_tracking (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id),
        thrift_account_id UUID REFERENCES thrift_accounts(id),
        default_date DATE NOT NULL,
        original_amount DECIMAL(15,2) NOT NULL,
        penalty_amount DECIMAL(15,2) NOT NULL, -- 100% penalty
        total_amount_due DECIMAL(15,2) NOT NULL, -- original + penalty
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'settled'
        settled_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ penalty_tracking table created');

    // 2. Update daily_contributions table structure
    console.log('📋 Updating daily_contributions table...');
    await client.query(`
      ALTER TABLE daily_contributions 
      ADD COLUMN IF NOT EXISTS penalty_applied BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS penalty_amount DECIMAL(15,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS settlement_date DATE,
      ADD COLUMN IF NOT EXISTS auto_processed BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ daily_contributions table updated');

    // 3. Create daily contribution processing function
    console.log('📋 Creating daily contribution processing function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION process_daily_contributions()
      RETURNS void AS $$
      DECLARE
        account_record RECORD;
        user_wallet_balance DECIMAL(15,2);
        contribution_amount DECIMAL(15,2);
        today_date DATE := CURRENT_DATE;
      BEGIN
        -- Process all active thrift accounts
        FOR account_record IN 
          SELECT ta.id, ta.user_id, cp.daily_amount, ta.start_date
          FROM thrift_accounts ta
          JOIN contribution_plans cp ON ta.plan_id = cp.id
          WHERE ta.status = 'active'
          AND ta.start_date <= today_date
        LOOP
          -- Get user's current wallet balance
          SELECT wallet_balance INTO user_wallet_balance
          FROM users_profiles
          WHERE user_id = account_record.user_id;
          
          contribution_amount := account_record.daily_amount;
          
          -- Check if contribution already processed for today
          IF NOT EXISTS (
            SELECT 1 FROM daily_contributions 
            WHERE thrift_account_id = account_record.id 
            AND expected_date = today_date
          ) THEN
            -- Check if sufficient balance
            IF user_wallet_balance >= contribution_amount THEN
              -- Deduct from wallet
              UPDATE users_profiles 
              SET wallet_balance = wallet_balance - contribution_amount
              WHERE user_id = account_record.user_id;
              
              -- Record successful contribution
              INSERT INTO daily_contributions (
                thrift_account_id, user_id, expected_date, actual_date,
                expected_amount, actual_amount, status, auto_processed
              ) VALUES (
                account_record.id, account_record.user_id, today_date, today_date,
                contribution_amount, contribution_amount, 'completed', true
              );
              
              -- Update thrift account balance
              UPDATE thrift_accounts
              SET amount_saved = amount_saved + contribution_amount,
                  last_contribution_date = today_date
              WHERE id = account_record.id;
              
            ELSE
              -- Insufficient balance - create default record
              INSERT INTO daily_contributions (
                thrift_account_id, user_id, expected_date, actual_date,
                expected_amount, actual_amount, status, penalty_applied, 
                penalty_amount, auto_processed
              ) VALUES (
                account_record.id, account_record.user_id, today_date, NULL,
                contribution_amount, 0, 'defaulted', true,
                contribution_amount, true -- 100% penalty
              );
              
              -- Create penalty tracking record
              INSERT INTO penalty_tracking (
                user_id, thrift_account_id, default_date, original_amount,
                penalty_amount, total_amount_due
              ) VALUES (
                account_record.user_id, account_record.id, today_date,
                contribution_amount, contribution_amount, contribution_amount * 2
              );
            END IF;
          END IF;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Daily processing function created');

    // 4. Create penalty settlement function
    console.log('📋 Creating penalty settlement function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION settle_penalties_on_wallet_credit(p_user_id UUID)
      RETURNS void AS $$
      DECLARE
        penalty_record RECORD;
        user_wallet_balance DECIMAL(15,2);
        total_settled DECIMAL(15,2) := 0;
      BEGIN
        -- Get current wallet balance
        SELECT wallet_balance INTO user_wallet_balance
        FROM users_profiles
        WHERE user_id = p_user_id;
        
        -- Process pending penalties in chronological order
        FOR penalty_record IN 
          SELECT * FROM penalty_tracking
          WHERE user_id = p_user_id AND status = 'pending'
          ORDER BY default_date ASC
        LOOP
          -- Check if sufficient balance to settle this penalty
          IF user_wallet_balance >= penalty_record.total_amount_due THEN
            -- Deduct penalty amount from wallet
            UPDATE users_profiles 
            SET wallet_balance = wallet_balance - penalty_record.total_amount_due
            WHERE user_id = p_user_id;
            
            -- Mark penalty as settled
            UPDATE penalty_tracking
            SET status = 'settled', settled_date = CURRENT_DATE
            WHERE id = penalty_record.id;
            
            -- Update the corresponding daily contribution record
            UPDATE daily_contributions
            SET status = 'completed',
                actual_date = CURRENT_DATE,
                actual_amount = penalty_record.original_amount,
                settlement_date = CURRENT_DATE
            WHERE thrift_account_id = penalty_record.thrift_account_id
            AND expected_date = penalty_record.default_date;
            
            -- Update thrift account balance (add only the original contribution)
            UPDATE thrift_accounts
            SET amount_saved = amount_saved + penalty_record.original_amount
            WHERE id = penalty_record.thrift_account_id;
            
            -- Update wallet balance for next iteration
            user_wallet_balance := user_wallet_balance - penalty_record.total_amount_due;
            total_settled := total_settled + penalty_record.total_amount_due;
          ELSE
            -- Not enough balance, stop processing
            EXIT;
          END IF;
        END LOOP;
        
        RAISE NOTICE 'Settled penalties totaling: %', total_settled;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Penalty settlement function created');

    // 5. Create wallet credit trigger
    console.log('📋 Creating wallet credit trigger...');
    await client.query(`
      CREATE OR REPLACE FUNCTION trigger_penalty_settlement()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Check if wallet balance increased
        IF NEW.wallet_balance > OLD.wallet_balance THEN
          -- Automatically attempt to settle penalties
          PERFORM settle_penalties_on_wallet_credit(NEW.user_id);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS wallet_balance_update_trigger ON users_profiles;
      CREATE TRIGGER wallet_balance_update_trigger
        AFTER UPDATE OF wallet_balance ON users_profiles
        FOR EACH ROW
        EXECUTE FUNCTION trigger_penalty_settlement();
    `);
    console.log('✅ Wallet credit trigger created');

    console.log('\n' + '='.repeat(60));
    console.log('🎯 DAILY CONTRIBUTION SYSTEM CREATED!');
    console.log('✅ Auto-deduction from wallet balance');
    console.log('✅ 100% penalty on insufficient balance');
    console.log('✅ Auto-settlement when wallet is credited');
    console.log('✅ Proper contribution recording');
    console.log('\n🚀 System is ready for daily operations!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createDailyContributionSystem();
