-- Quick fix: Disable RLS to test user registration
-- This is a temporary solution to test if registration works

-- Disable RLS for user_profiles table
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Now test user registration in your app
-- If it works, then RLS was the issue

-- After testing, you can either:
-- 1. Keep RLS disabled (less secure)
-- 2. Re-enable RLS with a working policy
-- 3. Use one of the other solutions in auth-function-solutions.sql

-- To re-enable RLS later:
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
