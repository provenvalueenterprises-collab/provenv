-- Test JWT claims function
-- Run this to verify the auth approach works

-- Test the JWT claims function
SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::uuid as user_id_from_jwt;

-- If this returns a UUID, then JWT claims approach works
-- If this returns null or errors, we need a different approach
