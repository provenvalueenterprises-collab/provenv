-- Migration to fix RLS policies for user_profiles table
-- Run this in your Nhost SQL Editor

-- First, let's check what auth functions are available
DO $$
BEGIN
    RAISE NOTICE 'Testing auth functions...';

    -- Test auth.uid() (standard PostgreSQL auth function)
    BEGIN
        PERFORM auth.uid();
        RAISE NOTICE '✅ auth.uid() is available';
    EXCEPTION
        WHEN undefined_function THEN
            RAISE NOTICE '❌ auth.uid() is not available';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ auth.uid() error: %', SQLERRM;
    END;

    -- Test JWT claims approach
    BEGIN
        PERFORM (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
        RAISE NOTICE '✅ JWT claims approach is available';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ JWT claims approach error: %', SQLERRM;
    END;

    -- Test alternative JWT approach
    BEGIN
        PERFORM nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
        RAISE NOTICE '✅ Alternative JWT approach is available';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Alternative JWT approach error: %', SQLERRM;
    END;

    -- Test auth.role()
    BEGIN
        PERFORM auth.role();
        RAISE NOTICE '✅ auth.role() is available';
    EXCEPTION
        WHEN undefined_function THEN
            RAISE NOTICE '❌ auth.role() is not available';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ auth.role() error: %', SQLERRM;
    END;
END $$;

-- Now let's try to create the INSERT policy using the most likely working approach
-- Uncomment the one that works based on the test results above

-- Option 1: Standard auth.uid() (if available)
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
-- CREATE POLICY "Users can insert own profile"
-- ON public.user_profiles
-- FOR INSERT
-- WITH CHECK (user_id = auth.uid());

-- Option 2: JWT claims approach (most common alternative)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Option 3: Alternative JWT approach
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
-- CREATE POLICY "Users can insert own profile"
-- ON public.user_profiles
-- FOR INSERT
-- WITH CHECK (user_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);

-- Option 4: Simplified authenticated user approach
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
-- CREATE POLICY "Users can insert own profile"
-- ON public.user_profiles
-- FOR INSERT
-- WITH CHECK (auth.role() = 'authenticated');

-- Verify the policy was created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
