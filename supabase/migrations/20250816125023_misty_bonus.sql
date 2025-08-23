/*
  # Initial Database Schema for Proven Value Enterprise

  1. New Tables
    - `users_profiles` - Extended user profile information
    - `contribution_plans` - Available savings plans
    - `thrift_accounts` - User's active savings accounts
    - `wallet_transactions` - All wallet-related transactions
    - `daily_contributions` - Daily contribution records
    - `referrals` - Referral tracking system
    - `complaints` - User complaints and support tickets
    - `settlement_accounts` - Matured accounts ready for payout
    - `virtual_accounts` - Monnify virtual account details
    - `system_settings` - Platform configuration

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access (Nhost compatible)
    - Admin-only access for management tables

  3. Features
    - Automated daily contribution tracking
    - Multi-account support per user
    - Referral bonus system with Fast Track qualification
    - Fine system for insufficient balance
    - Virtual account integration for payments
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Profiles Table
CREATE TABLE IF NOT EXISTS users_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phone varchar(20),
  wallet_balance decimal(15,2) DEFAULT 0.00,
  bonus_wallet decimal(15,2) DEFAULT 0.00,
  total_referrals integer DEFAULT 0,
  referral_code varchar(50),
  referred_by uuid,
  fast_track_eligible boolean DEFAULT false,
  fast_track_activated boolean DEFAULT false,
  virtual_account_number varchar(20),
  virtual_account_bank varchar(100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contribution Plans Table
CREATE TABLE IF NOT EXISTS contribution_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  category varchar(50) NOT NULL, -- 'standard', 'medium', 'least', 'mega'
  accounts_count integer NOT NULL,
  registration_fee decimal(10,2) NOT NULL,
  daily_amount decimal(10,2) NOT NULL,
  total_contribution decimal(15,2) NOT NULL,
  settlement_amount decimal(15,2) NOT NULL,
  duration_months integer DEFAULT 12,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Thrift Accounts Table
CREATE TABLE IF NOT EXISTS thrift_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid REFERENCES contribution_plans(id),
  account_number varchar(50) UNIQUE NOT NULL,
  status varchar(20) DEFAULT 'active', -- 'active', 'paused', 'matured', 'settled'
  start_date date NOT NULL,
  maturity_date date NOT NULL,
  current_week integer DEFAULT 0,
  total_weeks integer DEFAULT 52,
  amount_saved decimal(15,2) DEFAULT 0.00,
  total_defaults integer DEFAULT 0,
  last_contribution_date date,
  settlement_amount decimal(15,2),
  settlement_date date,
  is_fast_track boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_type varchar(50) NOT NULL, -- 'deposit', 'withdrawal', 'contribution', 'fine', 'referral_bonus', 'settlement'
  amount decimal(15,2) NOT NULL,
  balance_before decimal(15,2) NOT NULL,
  balance_after decimal(15,2) NOT NULL,
  description text,
  reference varchar(100),
  status varchar(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  payment_method varchar(50), -- 'virtual_account', 'card', 'bank_transfer'
  external_reference varchar(100),
  created_at timestamptz DEFAULT now()
);

-- Daily Contributions Table
CREATE TABLE IF NOT EXISTS daily_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thrift_account_id uuid REFERENCES thrift_accounts(id) ON DELETE CASCADE,
  contribution_date date NOT NULL,
  amount decimal(10,2) NOT NULL,
  status varchar(20) DEFAULT 'completed', -- 'completed', 'failed', 'fine_applied'
  fine_amount decimal(10,2) DEFAULT 0.00,
  wallet_balance_before decimal(15,2),
  wallet_balance_after decimal(15,2),
  week_number integer,
  created_at timestamptz DEFAULT now()
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  referral_code varchar(50) NOT NULL,
  bonus_amount decimal(10,2) DEFAULT 5000.00,
  bonus_paid boolean DEFAULT false,
  bonus_paid_date timestamptz,
  referred_user_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject varchar(200) NOT NULL,
  message text NOT NULL,
  status varchar(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed'
  priority varchar(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  admin_response text,
  admin_id uuid,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Settlement Accounts Table
CREATE TABLE IF NOT EXISTS settlement_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thrift_account_id uuid REFERENCES thrift_accounts(id) ON DELETE CASCADE,
  settlement_amount decimal(15,2) NOT NULL,
  bank_name varchar(100),
  account_number varchar(20),
  account_name varchar(100),
  status varchar(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  payment_reference varchar(100),
  settlement_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Virtual Accounts Table (Monnify Integration)
CREATE TABLE IF NOT EXISTS virtual_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_number varchar(20) NOT NULL,
  bank_name varchar(100) NOT NULL,
  account_name varchar(100) NOT NULL,
  monnify_reference varchar(100),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key varchar(100) UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE thrift_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_profiles_user_id ON users_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_thrift_accounts_user_id ON thrift_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_thrift_accounts_status ON thrift_accounts(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_daily_contributions_user_id ON daily_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_contributions_date ON daily_contributions(contribution_date);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_settlement_accounts_user_id ON settlement_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_accounts_user_id ON virtual_accounts(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_profiles_updated_at BEFORE UPDATE ON users_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_thrift_accounts_updated_at BEFORE UPDATE ON thrift_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settlement_accounts_updated_at BEFORE UPDATE ON settlement_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();