-- Create the user_profiles table (singular) that the code expects
-- Run this in your Nhost SQL Editor

-- First, check if the table exists with different names
DO $$
BEGIN
    -- Check for users_profiles (plural)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users_profiles') THEN
        RAISE NOTICE 'Found table: users_profiles (plural)';
    END IF;

    -- Check for user_profiles (singular)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        RAISE NOTICE 'Found table: user_profiles (singular)';
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist - will create it';
    END IF;
END $$;

-- Create the user_profiles table (singular) that matches the GraphQL schema
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON public.user_profiles(referral_code);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- SELECT policy
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- INSERT policy
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- UPDATE policy
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'user_profiles'
AND schemaname = 'public';

-- Verify policies were created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
