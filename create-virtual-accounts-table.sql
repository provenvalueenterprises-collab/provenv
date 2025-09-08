-- Create virtual_accounts table for storing user virtual account details
-- This table stores Flutterwave virtual account information for each user

BEGIN;

-- Drop the table if it exists to recreate with correct structure
DROP TABLE IF EXISTS public.virtual_accounts CASCADE;

-- Create virtual_accounts table
CREATE TABLE public.virtual_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    monnify_reference VARCHAR(100),
    flutterwave_reference VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add foreign key constraint with CASCADE DELETE
    CONSTRAINT virtual_accounts_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE,
    
    -- Ensure unique active virtual account per user
    CONSTRAINT unique_active_virtual_account_per_user 
        UNIQUE (user_id, is_active) 
        DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for better performance
CREATE INDEX idx_virtual_accounts_user_id ON public.virtual_accounts(user_id);
CREATE INDEX idx_virtual_accounts_account_number ON public.virtual_accounts(account_number);
CREATE INDEX idx_virtual_accounts_active ON public.virtual_accounts(is_active) WHERE is_active = true;

-- Add RLS policies
ALTER TABLE public.virtual_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own virtual accounts
CREATE POLICY "Users can access their own virtual accounts" 
ON public.virtual_accounts 
FOR ALL 
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.virtual_accounts TO authenticated;
GRANT ALL ON public.virtual_accounts TO service_role;

COMMIT;

-- Display table info
\d public.virtual_accounts;

SELECT 'Virtual accounts table created successfully!' as message;
