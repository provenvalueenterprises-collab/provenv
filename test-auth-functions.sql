-- Test different auth functions and apply the correct RLS policy for user_profiles table

-- First, let's test which auth function works in your Nhost setup
-- Uncomment and run one of these queries to see which one returns your user ID:

-- Test 1: Standard auth.uid()
-- SELECT auth.uid() as user_id;

-- Test 2: JWT claims approach
-- SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::uuid as user_id;

-- Test 3: Alternative JWT approach
-- SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid as user_id;

-- Test 4: Auth role check
-- SELECT auth.role() as user_role;

-- Once you know which function works, use it in the RLS policy below
-- Replace the auth function in the policy with the one that works for your setup

-- Apply the correct INSERT policy for user_profiles table
-- (Uncomment and modify the one that works for your auth setup)

-- Option 1: If auth.uid() works
-- CREATE POLICY "Users can insert own profile"
-- ON public.user_profiles
-- FOR INSERT
-- WITH CHECK (user_id = auth.uid());

-- Option 2: If JWT claims work
-- CREATE POLICY "Users can insert own profile"
-- ON public.user_profiles
-- FOR INSERT
-- WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Option 3: If alternative JWT works
-- CREATE POLICY "Users can insert own profile"
-- ON public.user_profiles
-- FOR INSERT
-- WITH CHECK (user_id = nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);

-- Option 4: Simplified approach (allow any authenticated user to insert)
-- CREATE POLICY "Users can insert own profile"
-- ON public.user_profiles
-- FOR INSERT
-- WITH CHECK (auth.role() = 'authenticated');

-- Verify the policy was created
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
