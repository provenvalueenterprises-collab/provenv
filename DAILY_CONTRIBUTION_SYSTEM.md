# Daily Auto-Contribution System with Penalty Management

## 🎯 System Overview

This system implements automatic daily contribution deduction from user wallets with comprehensive penalty management for thrift savings accounts.

## 🔧 Core Features

### 1. **Daily Auto-Deduction**
- Automatically deducts daily contribution amounts from user wallet balances
- Processes all active thrift accounts daily
- Only deducts if sufficient wallet balance is available

### 2. **Penalty Management**
- **100% Penalty Rule**: When insufficient balance, applies 100% penalty on the missed contribution
- **Example**: If daily contribution is ₦1,000 and wallet has insufficient funds:
  - Contribution amount: ₦1,000
  - Penalty amount: ₦1,000 (100%)
  - Total amount due: ₦2,000

### 3. **Auto-Settlement**
- When user credits their wallet, system automatically settles pending penalties
- Settles in chronological order (oldest defaults first)
- Only the original contribution amount is added to thrift savings
- Penalty amount is collected but not added to savings

### 4. **Contribution Recording**
- Only successful contributions are recorded in the user's thrift account
- Defaulted days remain as penalties until settled
- Clear audit trail of all transactions

## 📊 Database Structure

### New Tables Created:

#### `penalty_tracking`
```sql
- id: Serial primary key
- user_id: UUID reference to auth.users
- thrift_account_id: UUID reference to thrift_accounts
- default_date: Date of the missed contribution
- original_amount: The contribution amount that was missed
- penalty_amount: 100% penalty (same as original_amount)
- total_amount_due: original_amount + penalty_amount
- status: 'pending' or 'settled'
- settled_date: Date when penalty was paid
```

#### Enhanced `daily_contributions`
```sql
Added columns:
- penalty_applied: Boolean flag
- penalty_amount: Amount of penalty applied
- settlement_date: When penalty was settled
- auto_processed: Whether processed automatically
```

## 🔄 Automated Functions

### `process_daily_contributions()`
**Purpose**: Processes all active thrift accounts daily
**Logic**:
1. Loop through all active thrift accounts
2. Check user's wallet balance
3. If sufficient: Deduct contribution and record success
4. If insufficient: Create default record with 100% penalty

### `settle_penalties_on_wallet_credit(user_id)`
**Purpose**: Automatically settles penalties when wallet is credited
**Logic**:
1. Check pending penalties for user
2. Settle penalties in chronological order
3. Deduct total amount due (contribution + penalty)
4. Record only original contribution to thrift savings

### Wallet Credit Trigger
**Purpose**: Automatically triggers penalty settlement on wallet updates
**Trigger**: Fires when wallet_balance is updated and increased

## 🌐 API Endpoints

### 1. Daily Processing Endpoint
```
POST /api/cron/daily-contributions
Authorization: Bearer {CRON_SECRET_TOKEN}
```
**Purpose**: Manual trigger for daily processing (normally automated)

### 2. Wallet Funding with Auto-Settlement
```
POST /api/wallet/fund-with-penalty-settlement
Content-Type: application/json
Authorization: Bearer {user_session}

Body: {
  "amount": 5000
}
```
**Purpose**: Fund wallet and automatically settle any pending penalties

## 📅 Daily Processing Flow

### Morning Automation (Recommended: 6:00 AM daily)
1. **System scans** all active thrift accounts
2. **For each account**:
   - Check if today's contribution already processed
   - Get user's current wallet balance
   - Compare with required daily contribution

3. **If Sufficient Balance**:
   - Deduct contribution amount from wallet
   - Add to thrift account savings
   - Record successful contribution
   - Update last contribution date

4. **If Insufficient Balance**:
   - Create default record
   - Apply 100% penalty
   - Create penalty tracking entry
   - Send notification to user (optional)

## 💡 User Experience Flow

### Scenario 1: Successful Daily Contribution
```
User Wallet: ₦5,000
Daily Contribution: ₦1,000

Result:
- ₦1,000 deducted from wallet
- ₦1,000 added to thrift savings
- New wallet balance: ₦4,000
- Contribution recorded as successful
```

### Scenario 2: Insufficient Balance (Default)
```
User Wallet: ₦500
Daily Contribution: ₦1,000

Result:
- No deduction from wallet
- Default recorded for today
- Penalty: ₦1,000 (100% of ₦1,000)
- Total amount due: ₦2,000
- User notified of default
```

### Scenario 3: Wallet Funding with Auto-Settlement
```
User has pending penalty: ₦2,000 (₦1,000 contribution + ₦1,000 penalty)
User funds wallet: ₦3,000

Auto-settlement process:
1. ₦2,000 deducted for penalty settlement
2. ₦1,000 added to thrift savings (original contribution)
3. ₦1,000 penalty collected (not added to savings)
4. Remaining wallet balance: ₦1,000
5. Default day marked as settled
```

## 🔐 Security Features

1. **Authentication Required**: All user-facing APIs require valid session
2. **Cron Protection**: Daily processing endpoint protected with secret token
3. **Audit Trail**: Complete transaction history maintained
4. **Atomic Operations**: Database transactions ensure data consistency

## 📈 Monitoring & Reporting

### Daily Processing Summary
The system provides detailed reports including:
- Total accounts processed
- Successful contributions count
- Defaults created count
- Total amount collected
- Total penalties applied
- Success rate percentage

### Penalty Tracking
- Number of pending penalties per user
- Total amount due
- Settlement history
- Chronological penalty resolution

## 🎛️ Admin Controls

### Manual Processing
```javascript
// Trigger daily processing manually
SELECT process_daily_contributions();
```

### Penalty Settlement for Specific User
```javascript
// Settle penalties for specific user
SELECT settle_penalties_on_wallet_credit('user-uuid-here');
```

### View System Status
```sql
-- Active accounts summary
SELECT COUNT(*) as active_accounts 
FROM thrift_accounts 
WHERE status = 'active';

-- Today's processing summary
SELECT status, COUNT(*) 
FROM daily_contributions 
WHERE expected_date = CURRENT_DATE 
GROUP BY status;

-- Pending penalties summary
SELECT COUNT(*) as pending_penalties, SUM(total_amount_due) as total_due
FROM penalty_tracking 
WHERE status = 'pending';
```

## 🚀 Implementation Benefits

1. **Automated Operations**: Reduces manual intervention
2. **Fair Penalty System**: Clear 100% penalty rule
3. **Immediate Settlement**: Auto-settlement encourages prompt payment
4. **Transparent Tracking**: Complete audit trail
5. **Scalable Architecture**: Handles thousands of users efficiently
6. **Real-time Processing**: Immediate response to wallet funding

## ⚡ Performance Considerations

- Database functions use efficient SQL operations
- Indexes on user_id and date columns for fast queries
- Batch processing for daily operations
- Minimal API calls required for routine operations

This system ensures reliable, automated daily contribution collection while maintaining fair penalty policies and providing excellent user experience through immediate settlement capabilities.
