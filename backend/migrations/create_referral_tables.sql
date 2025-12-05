-- =====================================================
-- Monity Referral System - Database Migration
-- =====================================================
-- Description: Creates tables and extensions for referral/invite reward system
-- Date: 2024-12-04
-- =====================================================

-- =====================================================
-- 1. CREATE REFERRAL_CODES TABLE
-- =====================================================
-- Stores unique referral codes for each user
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referral_code VARCHAR(12) NOT NULL UNIQUE,
    short_link VARCHAR(50) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,

    -- Tracking fields
    total_uses INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Ensure one code per user
    UNIQUE(user_id)
);

-- Indexes for referral_codes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_short_link ON referral_codes(short_link) WHERE short_link IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON TABLE referral_codes IS 'Unique referral codes for each user';
COMMENT ON COLUMN referral_codes.referral_code IS 'Human-readable code like "JOAO2847" or "MARIA123"';
COMMENT ON COLUMN referral_codes.short_link IS 'Short URL code like "x7pK2a" for monity.app/r/x7pK2a';

-- =====================================================
-- 2. CREATE REFERRALS TABLE
-- =====================================================
-- Tracks who referred whom and reward status
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    referral_code VARCHAR(12) NOT NULL,

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
        -- 'pending': Signup completed, waiting for first transaction
        -- 'qualified': First transaction added, reward granted
        -- 'expired': 30 days passed without first transaction
        -- 'cancelled': Referred user deleted account

    -- Timestamps
    signup_completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_transaction_at TIMESTAMPTZ,
    reward_granted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

    -- Reward details
    reward_days INTEGER,
    reward_tier VARCHAR(20),

    -- Fraud prevention
    signup_ip_hash VARCHAR(64),
    signup_device_fingerprint VARCHAR(255),
    referred_user_email_hash VARCHAR(64),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate referrals (each user can only be referred once)
    UNIQUE(referred_user_id),

    -- Constraint: Status must be valid
    CONSTRAINT valid_status CHECK (status IN ('pending', 'qualified', 'expired', 'cancelled'))
);

-- Indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_signup_completed_at ON referrals(signup_completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_expires_at ON referrals(expires_at);
CREATE INDEX IF NOT EXISTS idx_referrals_signup_ip_hash ON referrals(signup_ip_hash);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- Comments
COMMENT ON TABLE referrals IS 'Tracks referral relationships and reward status';
COMMENT ON COLUMN referrals.status IS 'pending | qualified | expired | cancelled';
COMMENT ON COLUMN referrals.signup_ip_hash IS 'SHA-256 hash of signup IP for fraud detection';

-- =====================================================
-- 3. CREATE REFERRAL_REWARDS TABLE
-- =====================================================
-- Audit log of all rewards granted
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Reward details
    reward_type VARCHAR(20) NOT NULL DEFAULT 'premium_days',
    reward_amount INTEGER NOT NULL,
    reward_tier VARCHAR(20),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
        -- 'pending': Reward calculated but not applied
        -- 'applied': Reward successfully applied to user account
        -- 'reversed': Reward reversed (fraud, refund, etc.)

    applied_at TIMESTAMPTZ,
    reversed_at TIMESTAMPTZ,
    reversal_reason TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One reward per referral
    UNIQUE(referral_id),

    -- Constraint: Status must be valid
    CONSTRAINT valid_reward_status CHECK (status IN ('pending', 'applied', 'reversed')),

    -- Constraint: Reward amount must be positive
    CONSTRAINT positive_reward_amount CHECK (reward_amount > 0)
);

-- Indexes for referral_rewards
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer_id ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_created_at ON referral_rewards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_reward_type ON referral_rewards(reward_type);

-- Comments
COMMENT ON TABLE referral_rewards IS 'Audit log of all rewards granted through referrals';
COMMENT ON COLUMN referral_rewards.status IS 'pending | applied | reversed';

-- =====================================================
-- 4. EXTEND PROFILES TABLE
-- =====================================================
-- Add referral-related fields to existing profiles table

-- Referral tracking fields
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(12),
    ADD COLUMN IF NOT EXISTS referral_signup_date TIMESTAMPTZ;

-- Premium time earned from referrals
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS premium_days_earned INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS premium_earned_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS billing_paused_until TIMESTAMPTZ;

-- Referral statistics (denormalized for performance)
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS successful_referrals INTEGER DEFAULT 0;

-- Fraud prevention
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS signup_ip_hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS signup_device_fingerprint VARCHAR(255);

-- Indexes for profiles extensions
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_code ON profiles(referred_by_code) WHERE referred_by_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referral_signup_date ON profiles(referral_signup_date) WHERE referral_signup_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_premium_earned_expires_at ON profiles(premium_earned_expires_at) WHERE premium_earned_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_billing_paused_until ON profiles(billing_paused_until) WHERE billing_paused_until IS NOT NULL;

-- Comments
COMMENT ON COLUMN profiles.referred_by_code IS 'The referral code used during signup (e.g., "JOAO2847")';
COMMENT ON COLUMN profiles.premium_days_earned IS 'Total days of premium earned from referrals (cumulative)';
COMMENT ON COLUMN profiles.premium_earned_expires_at IS 'When earned premium expires (FREE users only)';
COMMENT ON COLUMN profiles.billing_paused_until IS 'When Stripe billing pause ends (PREMIUM users only)';

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate reward tier based on referral count
CREATE OR REPLACE FUNCTION calculate_referral_reward_tier(p_referrer_id UUID)
RETURNS TABLE(tier VARCHAR(20), days INTEGER) AS $$
DECLARE
    v_successful_count INTEGER;
BEGIN
    -- Get count of successful referrals for this user
    SELECT COALESCE(successful_referrals, 0) INTO v_successful_count
    FROM profiles
    WHERE id = p_referrer_id;

    -- Determine tier and reward days
    IF v_successful_count = 0 THEN
        -- First referral: 14 days
        RETURN QUERY SELECT 'tier_1'::VARCHAR(20), 14;
    ELSIF v_successful_count BETWEEN 1 AND 3 THEN
        -- 2-4 referrals: 7 days
        RETURN QUERY SELECT 'tier_2'::VARCHAR(20), 7;
    ELSIF v_successful_count BETWEEN 4 AND 8 THEN
        -- 5-9 referrals: 5 days
        RETURN QUERY SELECT 'tier_3'::VARCHAR(20), 5;
    ELSE
        -- 10+ referrals: 3 days
        RETURN QUERY SELECT 'tier_4'::VARCHAR(20), 3;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_referral_reward_tier IS 'Calculates reward tier and days based on referrer successful referral count';

-- Function to check if user has hit monthly referral cap
CREATE OR REPLACE FUNCTION check_monthly_referral_cap(p_referrer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_days_earned_this_month INTEGER;
BEGIN
    -- Calculate total days earned this month
    SELECT COALESCE(SUM(reward_amount), 0) INTO v_days_earned_this_month
    FROM referral_rewards
    WHERE referrer_id = p_referrer_id
        AND status = 'applied'
        AND created_at >= date_trunc('month', NOW());

    -- Check if cap (60 days) is reached
    RETURN v_days_earned_this_month >= 60;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_monthly_referral_cap IS 'Returns TRUE if referrer has hit the 60-day monthly cap';

-- Function to expire pending referrals (to be called by cron job)
CREATE OR REPLACE FUNCTION expire_pending_referrals()
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Update expired pending referrals
    UPDATE referrals
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending'
        AND expires_at < NOW();

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_pending_referrals IS 'Expires pending referrals after 30 days. Run via cron job.';

-- Function to get users with expiring earned premium (for notifications)
CREATE OR REPLACE FUNCTION get_users_with_expiring_premium(p_days_threshold INTEGER DEFAULT 3)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    name TEXT,
    premium_expires_at TIMESTAMPTZ,
    days_remaining NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.email,
        p.name,
        p.premium_earned_expires_at,
        EXTRACT(EPOCH FROM (p.premium_earned_expires_at - NOW())) / 86400 AS days_remaining
    FROM profiles p
    WHERE p.subscription_tier = 'free'
        AND p.premium_earned_expires_at IS NOT NULL
        AND p.premium_earned_expires_at > NOW()
        AND p.premium_earned_expires_at <= NOW() + (p_days_threshold || ' days')::INTERVAL
    ORDER BY p.premium_earned_expires_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_users_with_expiring_premium IS 'Returns users whose earned premium expires within N days (default 3)';

-- =====================================================
-- 6. TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Trigger to auto-update updated_at timestamp on referrals
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referrals_timestamp
    BEFORE UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_referrals_updated_at();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Policies for referral_codes
CREATE POLICY "Users can view their own referral code"
    ON referral_codes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral code"
    ON referral_codes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral code"
    ON referral_codes FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for referrals
CREATE POLICY "Users can view referrals where they are referrer"
    ON referrals FOR SELECT
    USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals where they are referred"
    ON referrals FOR SELECT
    USING (auth.uid() = referred_user_id);

-- Policies for referral_rewards
CREATE POLICY "Users can view their own rewards"
    ON referral_rewards FOR SELECT
    USING (auth.uid() = referrer_id);

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON referral_codes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON referrals TO authenticated;
GRANT SELECT ON referral_rewards TO authenticated;

-- Grant full access to service role (for backend operations)
GRANT ALL ON referral_codes TO service_role;
GRANT ALL ON referrals TO service_role;
GRANT ALL ON referral_rewards TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables were created
DO $$
DECLARE
    v_table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_name IN ('referral_codes', 'referrals', 'referral_rewards');

    IF v_table_count = 3 THEN
        RAISE NOTICE 'SUCCESS: All 3 referral tables created successfully';
    ELSE
        RAISE WARNING 'INCOMPLETE: Only % of 3 tables were created', v_table_count;
    END IF;
END $$;
