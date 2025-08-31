-- Fix existing RLS policies that use auth.uid()
-- Run this if you already ran the migration and got auth.uid() errors

-- Drop existing policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own thrift plans" ON public.thrift_plans;
DROP POLICY IF EXISTS "Users can create own thrift plans" ON public.thrift_plans;
DROP POLICY IF EXISTS "Users can update own thrift plans" ON public.thrift_plans;
DROP POLICY IF EXISTS "Users can view own contributions" ON public.contributions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can manage own settlement accounts" ON public.settlement_accounts;
DROP POLICY IF EXISTS "Users can view own referral bonuses" ON public.referral_bonuses;

-- Recreate policies with JWT claims
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Users can view own thrift plans" ON public.thrift_plans FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
CREATE POLICY "Users can create own thrift plans" ON public.thrift_plans FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
CREATE POLICY "Users can update own thrift plans" ON public.thrift_plans FOR UPDATE USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Users can view own contributions" ON public.contributions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.thrift_plans tp
    WHERE tp.id = contributions.thrift_plan_id AND tp.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
);

CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);
CREATE POLICY "Users can manage own settlement accounts" ON public.settlement_accounts FOR ALL USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Users can view own referral bonuses" ON public.referral_bonuses FOR SELECT USING (
  referrer_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid OR referred_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
);

-- Verify policies were created
SELECT
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
