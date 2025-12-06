-- Onboarding System Database Schema
-- Run this migration to add onboarding tracking tables

-- ===================================
-- 1. User Onboarding Progress Table
-- ===================================
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  current_step INTEGER DEFAULT 1,
  steps_completed JSONB DEFAULT '[]'::jsonb,
  checklist_progress JSONB DEFAULT '{}'::jsonb,
  primary_goal VARCHAR(100),
  estimated_income DECIMAL(10,2),
  preferred_categories TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  skipped_at TIMESTAMP,
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed ON user_onboarding(onboarding_completed);

-- ===================================
-- 2. Feature Discovery Tracking Table
-- ===================================
CREATE TABLE IF NOT EXISTS feature_discovery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  discovered_at TIMESTAMP DEFAULT NOW(),
  interaction_count INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, feature_name)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_feature_discovery_user_id ON feature_discovery(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_discovery_feature_name ON feature_discovery(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_discovery_discovered_at ON feature_discovery(discovered_at);

-- ===================================
-- 3. Premium Prompt History Table
-- ===================================
CREATE TABLE IF NOT EXISTS premium_prompt_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_type VARCHAR(100) NOT NULL,
  shown_at TIMESTAMP DEFAULT NOW(),
  action_taken VARCHAR(50), -- 'dismissed', 'upgraded', 'trial_started', 'clicked'
  context JSONB,
  dismissed_until TIMESTAMP -- For snooze functionality (7 days)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_premium_prompt_user_id ON premium_prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_prompt_type ON premium_prompt_history(prompt_type);
CREATE INDEX IF NOT EXISTS idx_premium_prompt_dismissed_until ON premium_prompt_history(dismissed_until);

-- ===================================
-- 4. Premium Trials Table (Optional)
-- ===================================
CREATE TABLE IF NOT EXISTS premium_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP NOT NULL,
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP,
  cancelled BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_premium_trials_user_id ON premium_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_trials_ends_at ON premium_trials(ends_at);
CREATE INDEX IF NOT EXISTS idx_premium_trials_converted ON premium_trials(converted);

-- ===================================
-- 5. Add columns to profiles table
-- ===================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hero_shown BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS primary_goal VARCHAR(100),
  ADD COLUMN IF NOT EXISTS estimated_income DECIMAL(10,2);

-- ===================================
-- 6. Helper Functions
-- ===================================

-- Function to check if user should see onboarding
CREATE OR REPLACE FUNCTION should_show_onboarding(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_completed BOOLEAN;
  v_exists BOOLEAN;
BEGIN
  -- Check if onboarding record exists
  SELECT EXISTS(SELECT 1 FROM user_onboarding WHERE user_id = p_user_id) INTO v_exists;

  IF NOT v_exists THEN
    RETURN TRUE; -- New user, show onboarding
  END IF;

  -- Check if onboarding is completed
  SELECT onboarding_completed INTO v_completed
  FROM user_onboarding
  WHERE user_id = p_user_id;

  RETURN NOT COALESCE(v_completed, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to get or create onboarding record
CREATE OR REPLACE FUNCTION get_or_create_onboarding(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  onboarding_completed BOOLEAN,
  current_step INTEGER,
  steps_completed JSONB,
  checklist_progress JSONB,
  primary_goal VARCHAR(100),
  estimated_income DECIMAL(10,2),
  created_at TIMESTAMP
) AS $$
BEGIN
  -- Try to get existing record
  RETURN QUERY
  SELECT
    uo.id,
    uo.user_id,
    uo.onboarding_completed,
    uo.current_step,
    uo.steps_completed,
    uo.checklist_progress,
    uo.primary_goal,
    uo.estimated_income,
    uo.created_at
  FROM user_onboarding uo
  WHERE uo.user_id = p_user_id;

  -- If no record found, create one
  IF NOT FOUND THEN
    INSERT INTO user_onboarding (user_id)
    VALUES (p_user_id)
    RETURNING
      user_onboarding.id,
      user_onboarding.user_id,
      user_onboarding.onboarding_completed,
      user_onboarding.current_step,
      user_onboarding.steps_completed,
      user_onboarding.checklist_progress,
      user_onboarding.primary_goal,
      user_onboarding.estimated_income,
      user_onboarding.created_at
    INTO
      id,
      user_id,
      onboarding_completed,
      current_step,
      steps_completed,
      checklist_progress,
      primary_goal,
      estimated_income,
      created_at;

    RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to mark feature as discovered
CREATE OR REPLACE FUNCTION mark_feature_discovered(
  p_user_id UUID,
  p_feature_name VARCHAR(100)
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO feature_discovery (user_id, feature_name, interaction_count)
  VALUES (p_user_id, p_feature_name, 1)
  ON CONFLICT (user_id, feature_name)
  DO UPDATE SET
    interaction_count = feature_discovery.interaction_count + 1,
    last_interaction_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if premium prompt should be shown
CREATE OR REPLACE FUNCTION should_show_premium_prompt(
  p_user_id UUID,
  p_prompt_type VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_dismissed TIMESTAMP;
  v_already_premium BOOLEAN;
BEGIN
  -- Check if user is already premium
  SELECT subscription_tier = 'premium' INTO v_already_premium
  FROM profiles
  WHERE id = p_user_id;

  IF v_already_premium THEN
    RETURN FALSE;
  END IF;

  -- Check if prompt was recently dismissed
  SELECT MAX(dismissed_until) INTO v_last_dismissed
  FROM premium_prompt_history
  WHERE user_id = p_user_id
    AND prompt_type = p_prompt_type
    AND action_taken = 'dismissed';

  -- If dismissed and snooze period not expired, don't show
  IF v_last_dismissed IS NOT NULL AND v_last_dismissed > NOW() THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- 7. Comments for documentation
-- ===================================
COMMENT ON TABLE user_onboarding IS 'Tracks user onboarding progress and preferences';
COMMENT ON TABLE feature_discovery IS 'Tracks which features users have discovered and interacted with';
COMMENT ON TABLE premium_prompt_history IS 'History of premium upgrade prompts shown to users';
COMMENT ON TABLE premium_trials IS 'Tracks premium trial periods for users';

COMMENT ON COLUMN user_onboarding.steps_completed IS 'Array of completed step numbers';
COMMENT ON COLUMN user_onboarding.checklist_progress IS 'Object tracking checklist item completion';
COMMENT ON COLUMN premium_prompt_history.dismissed_until IS 'Timestamp until which the prompt should not be shown again (7-day snooze)';
