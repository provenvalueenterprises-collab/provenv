-- Temporary fix: Disable RLS for testing
-- Run this to temporarily disable RLS and test profile creation

-- Disable RLS temporarily for testing
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Now try creating a user profile through your app
-- If it works, then the issue is with the RLS policy

-- After testing, re-enable RLS:
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- And recreate the policy:
-- CREATE POLICY "Users can insert own profile"
-- ON public.user_profiles
-- FOR INSERT
-- WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
