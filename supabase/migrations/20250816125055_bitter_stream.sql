/*
  # Seed Contribution Plans Data

  1. Standard Plans
    - 1 Account Standard through 5 Account Standard
    - Each with specific registration fees and daily amounts
    - Settlement calculations based on 12-month cycles

  2. Other Plans
    - Medium Plan (₦500 daily)
    - Least Plan (₦250 daily)

  3. Mega Plan
    - Placeholder for custom pricing (6+ accounts)
    - Requires manual configuration per user

  4. Plan Categories
    - Proper categorization for easy filtering
    - Duration settings and active status
*/

-- Insert Standard Plans (1-5 Accounts)
INSERT INTO contribution_plans (name, category, accounts_count, registration_fee, daily_amount, total_contribution, settlement_amount, duration_months, is_active) VALUES
('1 Account Standard', 'standard', 1, 5000.00, 1000.00, 365000.00, 500000.00, 12, true),
('2 Accounts Standard', 'standard', 2, 10000.00, 2000.00, 730000.00, 1000000.00, 12, true),
('3 Accounts Standard', 'standard', 3, 15000.00, 3000.00, 1095000.00, 1500000.00, 12, true),
('4 Accounts Standard', 'standard', 4, 20000.00, 4000.00, 1460000.00, 2000000.00, 12, true),
('5 Accounts Standard', 'standard', 5, 25000.00, 5000.00, 1825000.00, 2500000.00, 12, true);

-- Insert Other Plans
INSERT INTO contribution_plans (name, category, accounts_count, registration_fee, daily_amount, total_contribution, settlement_amount, duration_months, is_active) VALUES
('Medium Plan', 'medium', 1, 5000.00, 500.00, 182500.00, 250000.00, 12, true),
('Least Plan', 'least', 1, 5000.00, 250.00, 91250.00, 125000.00, 12, true);

-- Insert Mega Plan placeholder (custom pricing)
INSERT INTO contribution_plans (name, category, accounts_count, registration_fee, daily_amount, total_contribution, settlement_amount, duration_months, is_active) VALUES
('Mega Plan', 'mega', 6, 0.00, 0.00, 0.00, 0.00, 12, true);