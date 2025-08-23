/*
  # System Settings Configuration

  1. Platform Settings
    - Daily contribution time
    - Fine percentage rates
    - Referral bonus amounts
    - Fast Track requirements

  2. Payment Settings
    - Monnify configuration placeholders
    - Virtual account settings
    - Transaction limits

  3. Business Rules
    - Default fine amounts
    - Settlement processing rules
    - Referral qualification criteria
*/

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('daily_contribution_time', '00:00', 'Time when daily contributions are processed (24-hour format)'),
('fine_percentage', '100', 'Fine percentage applied when wallet balance is insufficient (100% = same as contribution amount)'),
('referral_bonus_amount', '5000', 'Bonus amount in Naira for each successful referral'),
('fast_track_referral_requirement', '10', 'Minimum referrals needed within 60 days for Fast Track qualification'),
('fast_track_duration_months', '9', 'Duration in months for Fast Track settlement'),
('fast_track_bonus_amount', '50000', 'Total bonus amount for Fast Track qualification'),
('fast_track_recharge_reward', '5000', 'Recharge card reward amount for Fast Track users'),
('minimum_wallet_balance', '0', 'Minimum wallet balance required'),
('maximum_daily_contribution', '10000', 'Maximum daily contribution amount per account'),
('settlement_processing_days', '7', 'Number of business days for settlement processing'),
('virtual_account_provider', 'monnify', 'Payment gateway provider for virtual accounts'),
('platform_commission_rate', '0', 'Platform commission rate percentage'),
('auto_settlement_enabled', 'true', 'Enable automatic settlement processing for matured accounts'),
('referral_code_length', '8', 'Length of generated referral codes'),
('max_accounts_per_user', '10', 'Maximum number of thrift accounts per user'),
('account_number_prefix', 'PVE', 'Prefix for generated account numbers'),
('support_email', 'support@provenvalue.com', 'Support email address'),
('support_phone', '08161357294', 'Primary support phone number'),
('company_address', 'No 1 Ibeh Road, Okota, Lagos, Nigeria', 'Company physical address'),
('platform_name', 'Proven Value Enterprise', 'Official platform name'),
('platform_tagline', 'MAKE SAVING YOUR DAILY HABIT', 'Platform tagline'),
('maintenance_mode', 'false', 'Enable maintenance mode'),
('registration_enabled', 'true', 'Enable new user registration'),
('email_notifications_enabled', 'true', 'Enable email notifications'),
('sms_notifications_enabled', 'true', 'Enable SMS notifications');