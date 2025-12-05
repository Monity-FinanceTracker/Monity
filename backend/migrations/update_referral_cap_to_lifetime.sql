-- =====================================================
-- Update Referral Cap from Monthly to Lifetime
-- =====================================================
-- Description: Changes referral reward cap from 60 days/month to 60 days/lifetime
-- Date: 2024-12-04
-- Author: Monity Team
-- =====================================================

-- Drop old monthly cap function
DROP FUNCTION IF EXISTS check_monthly_referral_cap(UUID);

-- Create new lifetime cap function
CREATE OR REPLACE FUNCTION check_lifetime_referral_cap(p_referrer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_days_earned_lifetime INTEGER;
BEGIN
    -- Get total days earned from profile (cumulative lifetime total)
    SELECT COALESCE(premium_days_earned, 0) INTO v_days_earned_lifetime
    FROM profiles
    WHERE id = p_referrer_id;

    -- Check if lifetime cap (60 days) is reached
    RETURN v_days_earned_lifetime >= 60;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_lifetime_referral_cap IS 'Returns TRUE if referrer has hit the 60-day LIFETIME cap (not monthly)';

-- Verify the function was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'check_lifetime_referral_cap'
    ) THEN
        RAISE NOTICE 'SUCCESS: check_lifetime_referral_cap function created';
    ELSE
        RAISE WARNING 'FAILED: check_lifetime_referral_cap function not found';
    END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Update backend service to call check_lifetime_referral_cap
-- 2. Update frontend to show "60 dias no total (vitalício)"
-- 3. Test that users cannot earn more than 60 days total
-- =====================================================
