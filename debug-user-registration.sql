-- Debug user registration issue
-- Run this to see what's happening with user creation

-- Check if user_profiles table exists and has correct structure
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'user_profiles'
AND schemaname = 'public';

-- Check RLS policies on user_profiles
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

-- Check if there are any users in auth.users but not in user_profiles
SELECT
    au.id as auth_user_id,
    au.email,
    au.created_at as auth_created,
    up.id as profile_id,
    up.user_id as profile_user_id,
    up.created_at as profile_created
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC
LIMIT 10;

-- Test the JWT claims function (run this while authenticated)
-- This should return your current user ID if JWT claims work
SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::uuid as current_user_id;

-- Check what the JWT claims actually contain
SELECT current_setting('request.jwt.claims', true) as jwt_claims;
