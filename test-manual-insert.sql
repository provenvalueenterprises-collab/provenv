-- Test manual profile creation
-- Replace 'your-user-id-here' with an actual user ID from auth.users

-- First, get a user ID from auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Then test inserting a profile (replace the user_id with a real one)
-- INSERT INTO public.user_profiles (
--   user_id,
--   phone,
--   referral_code,
--   wallet_balance,
--   bonus_wallet,
--   total_referrals
-- ) VALUES (
--   'your-user-id-here'::uuid,
--   '1234567890',
--   'TEST123',
--   0.00,
--   0.00,
--   0
-- );

-- Check if the insert worked
-- SELECT * FROM public.user_profiles ORDER BY created_at DESC LIMIT 5;
