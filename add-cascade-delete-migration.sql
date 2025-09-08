-- Migration to add CASCADE DELETE constraints to prevent orphaned user data
-- This ensures that when a user is deleted from auth.users, all related data is automatically removed

-- Step 1: Add foreign key constraints with CASCADE DELETE for users_profiles table
-- First, let's check if the constraint already exists and drop it if needed
DO $$ 
BEGIN
    -- Drop existing foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_profiles_user_id_fkey' 
        AND table_name = 'users_profiles'
    ) THEN
        ALTER TABLE public.users_profiles 
        DROP CONSTRAINT users_profiles_user_id_fkey;
        RAISE NOTICE 'Dropped existing foreign key constraint users_profiles_user_id_fkey';
    END IF;
END $$;

-- Add the foreign key constraint with CASCADE DELETE
ALTER TABLE public.users_profiles 
ADD CONSTRAINT users_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Add CASCADE DELETE for wallet_transactions table
DO $$ 
BEGIN
    -- Drop existing foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'wallet_transactions_user_id_fkey' 
        AND table_name = 'wallet_transactions'
    ) THEN
        ALTER TABLE public.wallet_transactions 
        DROP CONSTRAINT wallet_transactions_user_id_fkey;
        RAISE NOTICE 'Dropped existing foreign key constraint wallet_transactions_user_id_fkey';
    END IF;
END $$;

ALTER TABLE public.wallet_transactions 
ADD CONSTRAINT wallet_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Add CASCADE DELETE for thrift_accounts table (if it exists)
DO $$ 
BEGIN
    -- Check if thrift_accounts table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'thrift_accounts' 
        AND table_schema = 'public'
    ) THEN
        -- Drop existing foreign key constraint if it exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'thrift_accounts_user_id_fkey' 
            AND table_name = 'thrift_accounts'
        ) THEN
            ALTER TABLE public.thrift_accounts 
            DROP CONSTRAINT thrift_accounts_user_id_fkey;
            RAISE NOTICE 'Dropped existing foreign key constraint thrift_accounts_user_id_fkey';
        END IF;
        
        -- Add new constraint with CASCADE DELETE
        ALTER TABLE public.thrift_accounts 
        ADD CONSTRAINT thrift_accounts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added CASCADE DELETE constraint for thrift_accounts';
    ELSE
        RAISE NOTICE 'thrift_accounts table does not exist, skipping';
    END IF;
END $$;

-- Step 4: Add CASCADE DELETE for thrift_plans table (if it exists)
DO $$ 
BEGIN
    -- Check if thrift_plans table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'thrift_plans' 
        AND table_schema = 'public'
    ) THEN
        -- Drop existing foreign key constraint if it exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'thrift_plans_user_id_fkey' 
            AND table_name = 'thrift_plans'
        ) THEN
            ALTER TABLE public.thrift_plans 
            DROP CONSTRAINT thrift_plans_user_id_fkey;
            RAISE NOTICE 'Dropped existing foreign key constraint thrift_plans_user_id_fkey';
        END IF;
        
        -- Add new constraint with CASCADE DELETE
        ALTER TABLE public.thrift_plans 
        ADD CONSTRAINT thrift_plans_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added CASCADE DELETE constraint for thrift_plans';
    ELSE
        RAISE NOTICE 'thrift_plans table does not exist, skipping';
    END IF;
END $$;

-- Step 5: Add CASCADE DELETE for virtual_accounts table (if it exists)
DO $$ 
BEGIN
    -- Check if virtual_accounts table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'virtual_accounts' 
        AND table_schema = 'public'
    ) THEN
        -- Drop existing foreign key constraint if it exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'virtual_accounts_user_id_fkey' 
            AND table_name = 'virtual_accounts'
        ) THEN
            ALTER TABLE public.virtual_accounts 
            DROP CONSTRAINT virtual_accounts_user_id_fkey;
            RAISE NOTICE 'Dropped existing foreign key constraint virtual_accounts_user_id_fkey';
        END IF;
        
        -- Add new constraint with CASCADE DELETE
        ALTER TABLE public.virtual_accounts 
        ADD CONSTRAINT virtual_accounts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added CASCADE DELETE constraint for virtual_accounts';
    ELSE
        RAISE NOTICE 'virtual_accounts table does not exist, skipping';
    END IF;
END $$;

-- Step 6: Add CASCADE DELETE for email_verifications table (if it exists)
DO $$ 
BEGIN
    -- Check if email_verifications table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'email_verifications' 
        AND table_schema = 'public'
    ) THEN
        -- This table likely uses email instead of user_id, so we'll handle it differently
        -- We can create a trigger to clean up email_verifications when a user is deleted
        
        -- First, create a function to clean up email verifications
        CREATE OR REPLACE FUNCTION cleanup_user_email_verifications()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Delete email verifications for the deleted user
            DELETE FROM public.email_verifications 
            WHERE user_email = OLD.email;
            
            RETURN OLD;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Drop existing trigger if it exists
        DROP TRIGGER IF EXISTS trigger_cleanup_email_verifications ON auth.users;
        
        -- Create trigger to automatically clean up email verifications
        CREATE TRIGGER trigger_cleanup_email_verifications
            AFTER DELETE ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION cleanup_user_email_verifications();
        
        RAISE NOTICE 'Added trigger for email_verifications cleanup';
    ELSE
        RAISE NOTICE 'email_verifications table does not exist, skipping';
    END IF;
END $$;

-- Step 7: Verify all constraints are in place
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    rc.delete_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%user_id_fkey'
ORDER BY tc.table_name;

-- Show confirmation message
SELECT 'CASCADE DELETE constraints have been successfully added!' as status;
