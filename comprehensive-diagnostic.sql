-- Comprehensive diagnostic for user registration issue

-- 1. Check if user_profiles table exists
SELECT
    'Table exists check' as test,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN '✅ user_profiles table exists' ELSE '❌ user_profiles table missing' END as result;

-- 2. Check table structure
SELECT
    'Table structure' as test,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT
    'RLS status' as test,
    CASE WHEN relrowsecurity THEN '✅ RLS enabled' ELSE '❌ RLS disabled' END as result
FROM pg_class
WHERE relname = 'user_profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. Check existing policies
SELECT
    'RLS policies' as test,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 5. Check recent auth.users entries
SELECT
    'Recent auth users' as test,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 6. Check if profiles exist for recent users
SELECT
    'Profile check' as test,
    au.id as auth_user_id,
    au.email,
    au.created_at as auth_created,
    up.id as profile_id,
    up.created_at as profile_created,
    CASE WHEN up.id IS NOT NULL THEN '✅ Has profile' ELSE '❌ Missing profile' END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC
LIMIT 5;

-- 7. Test JWT claims (run this while authenticated)
SELECT
    'JWT claims test' as test,
    CASE WHEN current_setting('request.jwt.claims', true) IS NOT NULL
         THEN '✅ JWT claims available'
         ELSE '❌ JWT claims missing' END as jwt_status,
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid as user_id_from_jwt;

-- 8. Show JWT claims content
SELECT
    'JWT claims content' as test,
    current_setting('request.jwt.claims', true) as full_jwt_claims;
