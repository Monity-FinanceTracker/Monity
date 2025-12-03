const { supabaseAdmin } = require('../config/supabase');

/**
 * Subscription Controller
 * Handles subscription-related operations and usage statistics
 */
class SubscriptionController {
  constructor(supabase) {
    this.supabase = supabase;
  }

  /**
   * Get usage statistics for current user
   * GET /api/subscription/usage-stats
   */
  async getUsageStats(req, res) {
    try {
      const userId = req.user.id;

      // Get current period dates (current month)
      const now = new Date();
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get budgets count
      const { count: budgetsCount, error: budgetsError } = await supabaseAdmin
        .from('budgets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (budgetsError) {
        console.error('Error fetching budgets count:', budgetsError);
      }

      // Get savings goals count
      const { count: goalsCount, error: goalsError } = await supabaseAdmin
        .from('savings_goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (goalsError) {
        console.error('Error fetching savings goals count:', goalsError);
      }

      // Get AI messages count for current month
      const { count: aiMessagesCount, error: aiError } = await supabaseAdmin
        .from('ai_chat_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', currentPeriodStart.toISOString())
        .lte('created_at', currentPeriodEnd.toISOString());

      if (aiError) {
        console.error('Error fetching AI messages count:', aiError);
      }

      // Get total transactions count
      const { count: transactionsCount, error: transactionsError } = await supabaseAdmin
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (transactionsError) {
        console.error('Error fetching transactions count:', transactionsError);
      }

      // Get user profile for subscription details
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier, subscription_status, current_period_end')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      res.json({
        success: true,
        data: {
          budgets_count: budgetsCount || 0,
          savings_goals_count: goalsCount || 0,
          ai_messages_count: aiMessagesCount || 0,
          transactions_count: transactionsCount || 0,
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          subscription_tier: profile?.subscription_tier || 'free',
          subscription_status: profile?.subscription_status || 'inactive',
          next_billing_date: profile?.current_period_end || null
        }
      });
    } catch (error) {
      console.error('Error getting usage stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get usage statistics',
        error: error.message
      });
    }
  }

  /**
   * Get subscription details for current user
   * GET /api/subscription/details
   */
  async getSubscriptionDetails(req, res) {
    try {
      const userId = req.user.id;

      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier, subscription_status, current_period_end, stripe_customer_id, stripe_subscription_id')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription details:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to get subscription details',
          error: error.message
        });
      }

    res.json({
      success: true,
      data: {
        subscription_tier: profile.subscription_tier || 'free',
        tier: profile.subscription_tier || 'free',
        status: profile.subscription_status || 'inactive',
        next_billing_date: profile.current_period_end || null,
        has_stripe_subscription: !!profile.stripe_subscription_id
      }
    });
    } catch (error) {
      console.error('Error getting subscription details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription details',
        error: error.message
      });
    }
  }

  /**
   * Get subscription tier for current user (for backward compatibility)
   * GET /api/subscription-tier
   */
  async getSubscriptionTier(req, res) {
    try {
      const userId = req.user.id;

      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription tier:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to get subscription tier',
          error: error.message
        });
      }

      res.json({
        success: true,
        subscription_tier: profile.subscription_tier || 'free',
        tier: profile.subscription_tier || 'free'
      });
    } catch (error) {
      console.error('Error getting subscription tier:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription tier',
        error: error.message
      });
    }
  }
}

module.exports = SubscriptionController;
