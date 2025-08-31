-- Fix table name: Create users_profile table (singular) with correct RLS policies
-- This migration addresses the table name discrepancy

-- Drop the old table if it exists (be careful with this in production!)
-- DROP TABLE IF EXISTS public.users_profiles CASCADE;
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Create the correct users_profile table
CREATE TABLE IF NOT EXISTS public.users_profile (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_user_id ON public.users_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_users_profile_referral_code ON public.users_profile(referral_code);

-- Enable Row Level Security
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_profile
CREATE POLICY "Users can view own profile" ON public.users_profile FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.users_profile FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.users_profile FOR UPDATE USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON public.users_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
