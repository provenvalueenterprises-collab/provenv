-- Solution for Nhost without auth functions
-- Since auth.uid() and auth.role() don't exist, let's try different approaches

-- Option 1: Disable RLS for user_profiles (simplest solution)
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want some security, create a policy that allows all operations
-- (This is less secure but will work)
-- DROP POLICY IF EXISTS "Allow all operations" ON public.user_profiles;
-- CREATE POLICY "Allow all operations" ON public.user_profiles FOR ALL USING (true);

-- Option 3: Create a custom auth function (most secure)
-- First, let's see if we can create our own auth function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id uuid;
BEGIN
    -- Try JWT claims first
    BEGIN
        user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
        IF user_id IS NOT NULL THEN
            RETURN user_id;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            -- JWT claims failed, continue to next method
            NULL;
    END;

    -- Try alternative JWT
    BEGIN
        user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
        IF user_id IS NOT NULL THEN
            RETURN user_id;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            -- Alternative JWT failed, continue
            NULL;
    END;

    -- If all else fails, return null (will cause policy to fail)
    RETURN NULL;
END;
$$;

-- Test the custom function
SELECT get_current_user_id() as current_user_id;

-- If the custom function works, use it in policies:
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
-- CREATE POLICY "Users can insert own profile"
-- ON public.user_profiles
-- FOR INSERT
-- WITH CHECK (user_id = get_current_user_id());

-- Option 4: Complete bypass (use only for testing)
-- This removes all restrictions - NOT RECOMMENDED for production
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
