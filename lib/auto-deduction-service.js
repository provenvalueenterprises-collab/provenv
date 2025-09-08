const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Provenvalueenterprise@123!@sbpnfqrsnvtyvkgldcco.db.eu-central-1.nhost.run:5432/sbpnfqrsnvtyvkgldcco?sslmode=require'
});

class AutoDeductionService {
  
  /**
   * Process daily contributions for all active thrift accounts
   */
  async processDailyContributions() {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      console.log('🚀 Starting daily contribution processing...');
      
      // Get all active thrift accounts that need daily contributions
      const activeAccountsQuery = `
        SELECT 
          ta.id as account_id,
          ta.user_id,
          ta.current_week as current_day,
          ta.total_weeks as total_days,
          ta.amount_saved,
          ta.total_defaults,
          ta.start_date,
          cp.daily_amount,
          cp.name as plan_name,
          up.wallet_balance,
          COALESCE(ta.last_contribution_date, ta.start_date::date - INTERVAL '1 day') as last_contribution_date
        FROM thrift_accounts ta
        JOIN contribution_plans cp ON cp.id = ta.plan_id
        JOIN users_profiles up ON up.user_id = ta.user_id
        WHERE ta.status = 'active'
        AND ta.current_week < ta.total_weeks
        AND ta.start_date::date <= CURRENT_DATE
      `;
      
      const activeAccounts = await client.query(activeAccountsQuery);
      console.log(`📊 Found ${activeAccounts.rows.length} active accounts to process`);
      
      for (const account of activeAccounts.rows) {
        await this.processAccountContribution(client, account);
      }
      
      await client.query('COMMIT');
      console.log('✅ Daily contribution processing completed successfully');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error processing daily contributions:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Process contribution for a single account
   */
  async processAccountContribution(client, account) {
    const {
      account_id,
      user_id,
      current_day,
      daily_amount,
      plan_name,
      wallet_balance,
      last_contribution_date
    } = account;
    
    const contributionAmount = parseFloat(daily_amount);
    const currentBalance = parseFloat(wallet_balance);
    const today = new Date().toISOString().split('T')[0];
    const lastContribDate = new Date(last_contribution_date).toISOString().split('T')[0];
    
    // Check if contribution already processed today
    if (lastContribDate === today) {
      console.log(`⏭️ Contribution already processed today for account ${account_id}`);
      return;
    }
    
    console.log(`💰 Processing contribution for account ${account_id}: ₦${contributionAmount}`);
    
    if (currentBalance >= contributionAmount) {
      // Sufficient balance - process normal contribution
      await this.processSuccessfulContribution(client, account, contributionAmount);
    } else {
      // Insufficient balance - mark as default with penalty
      await this.processDefaultContribution(client, account, contributionAmount, currentBalance);
    }
  }
  
  /**
   * Process successful contribution (sufficient balance)
   */
  async processSuccessfulContribution(client, account, contributionAmount) {
    const { account_id, user_id, current_day, amount_saved } = account;
    const newBalance = parseFloat(account.wallet_balance) - contributionAmount;
    const newAmountSaved = parseFloat(amount_saved) + contributionAmount;
    const newCurrentDay = current_day + 1;
    
    // Update wallet balance
    await client.query(
      'UPDATE users_profiles SET wallet_balance = $1 WHERE user_id = $2',
      [newBalance, user_id]
    );
    
    // Update thrift account
    await client.query(`
      UPDATE thrift_accounts 
      SET amount_saved = $1, 
          current_week = $2, 
          last_contribution_date = CURRENT_DATE 
      WHERE id = $3
    `, [newAmountSaved, newCurrentDay, account_id]);
    
    // Record successful contribution transaction
    await this.recordTransaction(client, {
      user_id,
      account_id,
      transaction_type: 'DEBIT',
      type: 'debit',
      amount: contributionAmount,
      balance_before: parseFloat(account.wallet_balance),
      balance_after: newBalance,
      description: `Daily contribution for ${account.plan_name}`,
      status: 'completed',
      reference: `CONTRIB-${account_id}-${Date.now()}`
    });
    
    // Record contribution to daily_contributions table
    await client.query(`
      INSERT INTO daily_contributions (
        user_id, thrift_account_id, amount, contribution_date, status, created_at
      ) VALUES ($1, $2, $3, CURRENT_DATE, 'completed', NOW())
    `, [user_id, account_id, contributionAmount]);
    
    console.log(`✅ Successful contribution: ₦${contributionAmount} for account ${account_id}`);
  }
  
  /**
   * Process default contribution (insufficient balance)
   */
  async processDefaultContribution(client, account, contributionAmount, currentBalance) {
    const { account_id, user_id, current_day, total_defaults } = account;
    const penalty = contributionAmount; // 100% penalty
    const totalOwed = contributionAmount + penalty;
    const newCurrentDay = current_day + 1;
    const newTotalDefaults = total_defaults + 1;
    
    // Update thrift account - increment day and defaults, but don't add to amount_saved
    await client.query(`
      UPDATE thrift_accounts 
      SET current_week = $1, 
          total_defaults = $2, 
          last_contribution_date = CURRENT_DATE 
      WHERE id = $3
    `, [newCurrentDay, newTotalDefaults, account_id]);
    
    // Record default in pending_settlements table
    await client.query(`
      INSERT INTO pending_settlements (
        user_id, thrift_account_id, contribution_amount, penalty_amount, 
        total_owed, default_date, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'pending', NOW())
    `, [user_id, account_id, contributionAmount, penalty, totalOwed]);
    
    // Record failed contribution transaction
    await this.recordTransaction(client, {
      user_id,
      account_id,
      transaction_type: 'DEBIT',
      type: 'debit',
      amount: 0, // No amount deducted
      balance_before: currentBalance,
      balance_after: currentBalance,
      description: `Failed contribution for ${account.plan_name} - Insufficient balance (₦${contributionAmount} needed, ₦${currentBalance} available)`,
      status: 'failed',
      reference: `FAILED-${account_id}-${Date.now()}`
    });
    
    // Record failed contribution
    await client.query(`
      INSERT INTO daily_contributions (
        user_id, thrift_account_id, amount, contribution_date, status, created_at
      ) VALUES ($1, $2, $3, CURRENT_DATE, 'failed', NOW())
    `, [user_id, account_id, 0]);
    
    console.log(`❌ Default contribution: Account ${account_id} - ₦${contributionAmount} + ₦${penalty} penalty = ₦${totalOwed} owed`);
  }
  
  /**
   * Process pending settlements when wallet is funded
   */
  async processWalletFundingSettlements(user_id, fundedAmount) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      console.log(`💳 Processing settlements for user ${user_id} after funding ₦${fundedAmount}`);
      
      // Get pending settlements for user
      const pendingQuery = `
        SELECT * FROM pending_settlements 
        WHERE user_id = $1 AND status = 'pending' 
        ORDER BY default_date ASC
      `;
      const pendingSettlements = await client.query(pendingQuery, [user_id]);
      
      if (pendingSettlements.rows.length === 0) {
        console.log('✅ No pending settlements to process');
        await client.query('COMMIT');
        return;
      }
      
      // Get current wallet balance
      const balanceQuery = await client.query(
        'SELECT wallet_balance FROM users_profiles WHERE user_id = $1',
        [user_id]
      );
      let currentBalance = parseFloat(balanceQuery.rows[0].wallet_balance);
      
      for (const settlement of pendingSettlements.rows) {
        if (currentBalance >= settlement.total_owed) {
          await this.settleDefault(client, settlement, currentBalance);
          currentBalance -= settlement.total_owed;
        } else {
          console.log(`⚠️ Insufficient balance to settle ₦${settlement.total_owed} (Available: ₦${currentBalance})`);
          break;
        }
      }
      
      await client.query('COMMIT');
      console.log('✅ Settlement processing completed');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error processing settlements:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Settle a specific default
   */
  async settleDefault(client, settlement, currentBalance) {
    const {
      id: settlement_id,
      user_id,
      thrift_account_id,
      contribution_amount,
      penalty_amount,
      total_owed
    } = settlement;
    
    const newBalance = currentBalance - total_owed;
    
    // Update wallet balance
    await client.query(
      'UPDATE users_profiles SET wallet_balance = $1 WHERE user_id = $2',
      [newBalance, user_id]
    );
    
    // Update thrift account - only add contribution amount to savings
    await client.query(
      'UPDATE thrift_accounts SET amount_saved = amount_saved + $1 WHERE id = $2',
      [contribution_amount, thrift_account_id]
    );
    
    // Mark settlement as completed
    await client.query(
      'UPDATE pending_settlements SET status = $1, settlement_date = NOW() WHERE id = $2',
      ['completed', settlement_id]
    );
    
    // Record settlement transaction
    await this.recordTransaction(client, {
      user_id,
      account_id: thrift_account_id,
      transaction_type: 'DEBIT',
      type: 'debit',
      amount: total_owed,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: `Settlement: ₦${contribution_amount} contribution + ₦${penalty_amount} penalty`,
      status: 'completed',
      reference: `SETTLE-${settlement_id}-${Date.now()}`
    });
    
    console.log(`✅ Settled default: ₦${total_owed} (₦${contribution_amount} contribution + ₦${penalty_amount} penalty)`);
  }
  
  /**
   * Record transaction
   */
  async recordTransaction(client, transactionData) {
    const {
      user_id,
      transaction_type,
      type,
      amount,
      balance_before,
      balance_after,
      description,
      status,
      reference
    } = transactionData;
    
    await client.query(`
      INSERT INTO wallet_transactions (
        user_id, transaction_type, type, amount, balance_before, balance_after,
        description, status, reference, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [user_id, transaction_type, type, amount, balance_before, balance_after, description, status, reference]);
  }
}

module.exports = AutoDeductionService;
