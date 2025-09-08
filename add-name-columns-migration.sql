-- Migration to add first_name, last_name, and email columns to users_profiles table
-- This improves the profile structure and provides better name handling

-- Add the new columns
ALTER TABLE public.users_profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS full_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_users_profiles_names 
ON public.users_profiles (first_name, last_name);

CREATE INDEX IF NOT EXISTS idx_users_profiles_email 
ON public.users_profiles (email);

-- Update existing records to populate name and email fields from auth.users
UPDATE public.users_profiles 
SET 
  email = (
    SELECT email 
    FROM auth.users 
    WHERE auth.users.id = users_profiles.user_id
  ),
  full_name = (
    SELECT display_name 
    FROM auth.users 
    WHERE auth.users.id = users_profiles.user_id
  ),
  first_name = (
    CASE 
      WHEN (SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id) IS NOT NULL 
      THEN SPLIT_PART((SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id), ' ', 1)
      ELSE NULL
    END
  ),
  last_name = (
    CASE 
      WHEN (SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id) IS NOT NULL 
      AND ARRAY_LENGTH(STRING_TO_ARRAY((SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id), ' '), 1) > 1
      THEN ARRAY_TO_STRING(
        (STRING_TO_ARRAY((SELECT display_name FROM auth.users WHERE auth.users.id = users_profiles.user_id), ' '))[2:], 
        ' '
      )
      ELSE NULL
    END
  )
WHERE 
  (email IS NULL OR first_name IS NULL OR last_name IS NULL OR full_name IS NULL);

-- Verify the update
SELECT 
  COUNT(*) as total_profiles,
  COUNT(first_name) as profiles_with_first_name,
  COUNT(last_name) as profiles_with_last_name,
  COUNT(full_name) as profiles_with_full_name
FROM public.users_profiles;
