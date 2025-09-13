-- Enhanced daily contribution processing with comprehensive penalty management
CREATE OR REPLACE FUNCTION process_daily_contributions_enhanced()
RETURNS TABLE(
  total_users_processed INTEGER,
  successful_deductions INTEGER,
  defaults_created INTEGER,
  total_amount_deducted DECIMAL,
  total_penalties_applied DECIMAL,
  processing_summary JSONB
) AS $$
DECLARE
  user_record RECORD;
  contribution_record RECORD;
  user_balance DECIMAL;
  daily_amount DECIMAL;
  account_id UUID;
  processing_date DATE := CURRENT_DATE;
  success_count INTEGER := 0;
  default_count INTEGER := 0;
  total_deducted DECIMAL := 0;
  total_penalties DECIMAL := 0;
  users_processed INTEGER := 0;
  summary JSONB := '{}';
BEGIN
  -- Log processing start
  INSERT INTO daily_deduction_logs (id, deduction_date, total_processed, success_count, failure_count, total_amount, details)
  VALUES (gen_random_uuid(), processing_date, 0, 0, 0, 0, jsonb_build_object('status', 'started', 'timestamp', NOW()));
  
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
    users_processed := users_processed + 1;
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
        
        -- Log wallet transaction
        INSERT INTO wallet_transactions (
          id, user_id, transaction_type, type, amount, balance_before, balance_after,
          reference, status, description, created_at
        ) VALUES (
          gen_random_uuid(), user_record.user_id, 'debit', 'daily_contribution', 
          daily_amount, user_balance, user_balance - daily_amount,
          'DC-' || EXTRACT(EPOCH FROM NOW()), 'completed',
          'Daily contribution for ' || user_record.account_number, NOW()
        );
        
        -- Update thrift account
        UPDATE thrift_accounts 
        SET 
          amount_saved = amount_saved + daily_amount,
          last_contribution_date = processing_date,
          updated_at = NOW()
        WHERE id = account_id;
        
        success_count := success_count + 1;
        total_deducted := total_deducted + daily_amount;
        
      ELSE
        -- Insufficient balance - create default
        UPDATE daily_contributions 
        SET 
          status = 'defaulted',
          penalty_applied = true,
          penalty_amount = daily_amount  -- 100% penalty
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
        
        default_count := default_count + 1;
        total_penalties := total_penalties + daily_amount;
      END IF;
    END IF;
  END LOOP;
  
  -- Update processing log
  UPDATE daily_deduction_logs 
  SET 
    total_processed = users_processed,
    success_count = success_count,
    failure_count = default_count,
    total_amount = total_deducted,
    details = jsonb_build_object(
      'status', 'completed',
      'timestamp', NOW(),
      'total_penalties_applied', total_penalties,
      'processing_date', processing_date
    )
  WHERE deduction_date = processing_date
  AND details->>'status' = 'started';
  
  -- Build summary
  summary := jsonb_build_object(
    'processing_date', processing_date,
    'users_processed', users_processed,
    'successful_deductions', success_count,
    'defaults_created', default_count,
    'total_deducted', total_deducted,
    'total_penalties', total_penalties,
    'completion_time', NOW()
  );
  
  -- Return results
  RETURN QUERY SELECT 
    users_processed::INTEGER,
    success_count::INTEGER,
    default_count::INTEGER,
    total_deducted::DECIMAL,
    total_penalties::DECIMAL,
    summary::JSONB;
END;
$$ LANGUAGE plpgsql;

-- Enhanced penalty settlement function
CREATE OR REPLACE FUNCTION settle_penalties_on_wallet_credit_enhanced(p_user_id UUID)
RETURNS TABLE(
  penalties_settled INTEGER,
  total_amount_settled DECIMAL,
  remaining_penalties INTEGER,
  settlement_details JSONB
) AS $$
DECLARE
  user_balance DECIMAL;
  penalty_record RECORD;
  settled_count INTEGER := 0;
  total_settled DECIMAL := 0;
  remaining_count INTEGER;
  settlement_info JSONB := '[]';
BEGIN
  -- Get current wallet balance
  SELECT wallet_balance INTO user_balance 
  FROM user_profiles 
  WHERE user_id = p_user_id;
  
  IF user_balance IS NULL OR user_balance <= 0 THEN
    -- Return empty result if no balance
    RETURN QUERY SELECT 0::INTEGER, 0::DECIMAL, 0::INTEGER, '[]'::JSONB;
    RETURN;
  END IF;
  
  -- Process pending penalties in order (oldest first)
  FOR penalty_record IN 
    SELECT * FROM penalty_tracking 
    WHERE user_id = p_user_id 
    AND status = 'pending'
    ORDER BY default_date ASC
  LOOP
    -- Check if we have enough balance for this penalty
    IF user_balance >= penalty_record.total_amount_due THEN
      -- Settle this penalty
      UPDATE penalty_tracking 
      SET 
        status = 'settled',
        settled_date = CURRENT_DATE
      WHERE id = penalty_record.id;
      
      -- Update daily contribution status
      UPDATE daily_contributions 
      SET 
        status = 'settled',
        settlement_date = CURRENT_DATE,
        actual_date = CURRENT_DATE,
        actual_amount = penalty_record.original_amount
      WHERE user_id = p_user_id 
      AND thrift_account_id = penalty_record.thrift_account_id
      AND expected_date = penalty_record.default_date;
      
      -- Deduct from wallet
      UPDATE user_profiles 
      SET 
        wallet_balance = wallet_balance - penalty_record.total_amount_due,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      
      -- Log transaction
      INSERT INTO wallet_transactions (
        id, user_id, transaction_type, type, amount, balance_before, balance_after,
        reference, status, description, created_at
      ) VALUES (
        gen_random_uuid(), p_user_id, 'debit', 'penalty_settlement',
        penalty_record.total_amount_due, user_balance, 
        user_balance - penalty_record.total_amount_due,
        'PS-' || EXTRACT(EPOCH FROM NOW()), 'completed',
        'Penalty settlement for default on ' || penalty_record.default_date, NOW()
      );
      
      -- Update counters
      user_balance := user_balance - penalty_record.total_amount_due;
      settled_count := settled_count + 1;
      total_settled := total_settled + penalty_record.total_amount_due;
      
      -- Add to settlement details
      settlement_info := settlement_info || jsonb_build_object(
        'penalty_id', penalty_record.id,
        'default_date', penalty_record.default_date,
        'amount_settled', penalty_record.total_amount_due,
        'settlement_date', CURRENT_DATE
      );
      
    ELSE
      -- Not enough balance, stop processing
      EXIT;
    END IF;
  END LOOP;
  
  -- Count remaining penalties
  SELECT COUNT(*) INTO remaining_count 
  FROM penalty_tracking 
  WHERE user_id = p_user_id AND status = 'pending';
  
  -- Return results
  RETURN QUERY SELECT 
    settled_count::INTEGER,
    total_settled::DECIMAL,
    remaining_count::INTEGER,
    settlement_info::JSONB;
END;
$$ LANGUAGE plpgsql;
