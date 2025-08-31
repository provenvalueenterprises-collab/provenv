-- Quick fix for user_profiles RLS INSERT policy
-- Run this in your Nhost SQL Editor

-- Remove any existing INSERT policy first
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create the INSERT policy using JWT claims (most common working approach)
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Verify the policy was created
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'user_profiles';
