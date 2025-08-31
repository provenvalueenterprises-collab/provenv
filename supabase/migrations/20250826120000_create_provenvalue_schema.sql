-- Users table (extend Nhost auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text,
  password_hash text,
  email_verified boolean DEFAULT false,
  verification_token text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  wallet_balance numeric(12,2) DEFAULT 0.00,
  bonus_wallet numeric(12,2) DEFAULT 0.00,
  total_referrals integer DEFAULT 0,
  referral_code text UNIQUE NOT NULL,
  referred_by uuid REFERENCES public.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Thrift plans table
CREATE TABLE IF NOT EXISTS public.thrift_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('basic', 'standard', 'premium')),
  daily_amount numeric(10,2) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  next_contribution_date date NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  total_contributed numeric(12,2) DEFAULT 0.00,
  expected_return numeric(12,2) NOT NULL,
  maturity_amount numeric(12,2) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Contributions table
CREATE TABLE IF NOT EXISTS public.contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thrift_plan_id uuid REFERENCES public.thrift_plans(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  contribution_date date NOT NULL,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'pending')),
  type text DEFAULT 'daily' CHECK (type IN ('daily', 'manual', 'bonus')),
  failure_reason text,
  reference text,
  created_at timestamp with time zone DEFAULT now()
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  amount numeric(12,2) NOT NULL,
  description text NOT NULL,
  reference text UNIQUE,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method text,
  created_at timestamp with time zone DEFAULT now()
);

-- Daily deduction logs table
CREATE TABLE IF NOT EXISTS public.daily_deduction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deduction_date date NOT NULL,
  total_processed integer NOT NULL,
  success_count integer NOT NULL,
  failure_count integer NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Settlement accounts table
CREATE TABLE IF NOT EXISTS public.settlement_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  account_number text NOT NULL,
  bank_name text NOT NULL,
  bank_code text NOT NULL,
  is_default boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Referral bonuses table
CREATE TABLE IF NOT EXISTS public.referral_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  bonus_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON public.user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_thrift_plans_user_id ON public.thrift_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_thrift_plans_status ON public.thrift_plans(status);
CREATE INDEX IF NOT EXISTS idx_thrift_plans_next_contribution ON public.thrift_plans(next_contribution_date);
CREATE INDEX IF NOT EXISTS idx_contributions_thrift_plan_id ON public.contributions(thrift_plan_id);
CREATE INDEX IF NOT EXISTS idx_contributions_date ON public.contributions(contribution_date);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_date ON public.wallet_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_deduction_logs_date ON public.daily_deduction_logs(deduction_date);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrift_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_bonuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- RLS Policies for thrift_plans
CREATE POLICY "Users can view own thrift plans" ON public.thrift_plans FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
CREATE POLICY "Users can create own thrift plans" ON public.thrift_plans FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
CREATE POLICY "Users can update own thrift plans" ON public.thrift_plans FOR UPDATE USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- RLS Policies for contributions
CREATE POLICY "Users can view own contributions" ON public.contributions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.thrift_plans tp 
    WHERE tp.id = contributions.thrift_plan_id AND tp.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
);

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- RLS Policies for settlement_accounts
CREATE POLICY "Users can manage own settlement accounts" ON public.settlement_accounts FOR ALL USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- RLS Policies for referral_bonuses
CREATE POLICY "Users can view own referral bonuses" ON public.referral_bonuses FOR SELECT USING (
  referrer_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid OR referred_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);
