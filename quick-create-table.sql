-- Quick create user_profiles table
-- Run this in your Nhost SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  phone text NOT NULL,
  wallet_balance numeric(12,2) DEFAULT 0.00,
  bonus_wallet numeric(12,2) DEFAULT 0.00,
  total_referrals integer DEFAULT 0,
  referral_code text UNIQUE NOT NULL,
  referred_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Verify
SELECT 'Table created successfully' as status;
