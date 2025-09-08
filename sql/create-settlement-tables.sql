-- Create pending_settlements table for tracking defaults and penalties
CREATE TABLE IF NOT EXISTS pending_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    thrift_account_id UUID NOT NULL REFERENCES thrift_accounts(id),
    contribution_amount DECIMAL(10,2) NOT NULL,
    penalty_amount DECIMAL(10,2) NOT NULL,
    total_owed DECIMAL(10,2) NOT NULL,
    default_date DATE NOT NULL,
    settlement_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_contributions table if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thrift_account_id UUID NOT NULL REFERENCES thrift_accounts(id),
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    contribution_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_settlements_user_status ON pending_settlements(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pending_settlements_account ON pending_settlements(thrift_account_id);
CREATE INDEX IF NOT EXISTS idx_daily_contributions_account_date ON daily_contributions(thrift_account_id, contribution_date);
CREATE INDEX IF NOT EXISTS idx_daily_contributions_date ON daily_contributions(contribution_date);

-- Add unique constraint to prevent duplicate contributions on same date
ALTER TABLE daily_contributions 
ADD CONSTRAINT unique_contribution_per_day 
UNIQUE(thrift_account_id, contribution_date);

COMMENT ON TABLE pending_settlements IS 'Tracks defaults and penalties that need to be settled when wallet is funded';
COMMENT ON TABLE daily_contributions IS 'Records all daily contribution attempts (successful and failed)';
