const { supabaseAdmin } = require('../config/supabase');

/**
 * Premium Prompt Controller
 * Handles smart upgrade prompts and conversion tracking
 */

/**
 * Check if a premium prompt should be shown to the user
 * GET /api/premium/should-show-prompt?type=prompt_type
 */
exports.shouldShowPrompt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Prompt type is required'
      });
    }

    // Check if user is already premium
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user subscription:', userError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check user subscription',
        error: userError.message
      });
    }

    if (userData?.subscription_tier === 'premium') {
      return res.json({
        success: true,
        should_show: false,
        reason: 'user_already_premium'
      });
    }

    // Use the database helper function
    const { data, error } = await supabaseAdmin.rpc('should_show_premium_prompt', {
      p_user_id: userId,
      p_prompt_type: type
    });

    if (error) {
      console.error('Error calling should_show_premium_prompt:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check prompt eligibility',
        error: error.message
      });
    }

    res.json({
      success: true,
      should_show: data
    });
  } catch (error) {
    console.error('Error checking prompt eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check prompt eligibility',
      error: error.message
    });
  }
};

/**
 * Record prompt action (shown, dismissed, clicked, upgraded)
 * POST /api/premium/prompt-action
 * Body: { prompt_type, action_taken, action_type, context }
 */
exports.recordPromptAction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt_type, action_taken, action_type, context } = req.body;

    if (!prompt_type || !action_taken) {
      return res.status(400).json({
        success: false,
        message: 'Prompt type and action are required'
      });
    }

    // Calculate dismissed_until if user dismissed (7-day snooze)
    let dismissedUntil = null;
    if (action_taken === 'dismissed') {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      dismissedUntil = futureDate.toISOString();
    }

    // Record in premium_prompt_history table
    const { error } = await supabaseAdmin
      .from('premium_prompt_history')
      .insert({
        user_id: userId,
        prompt_type,
        action_taken,
        context: context || null,
        dismissed_until: dismissedUntil
      });

    if (error) {
      console.error('Error inserting prompt action:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to record prompt action',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Prompt action recorded',
      dismissed_until: dismissedUntil
    });
  } catch (error) {
    console.error('Error recording prompt action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record prompt action',
      error: error.message
    });
  }
};

/**
 * Get prompt history for a user
 * GET /api/premium/prompt-history
 */
exports.getPromptHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const { data, error } = await supabaseAdmin
      .from('premium_prompt_history')
      .select('prompt_type, shown_at, action_taken, context, dismissed_until')
      .eq('user_id', userId)
      .order('shown_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Error fetching prompt history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get prompt history',
        error: error.message
      });
    }

    res.json({
      success: true,
      history: data || []
    });
  } catch (error) {
    console.error('Error getting prompt history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prompt history',
      error: error.message
    });
  }
};

/**
 * Get prompt statistics
 * GET /api/premium/prompt-stats
 */
exports.getPromptStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all prompt history for the user
    const { data, error } = await supabaseAdmin
      .from('premium_prompt_history')
      .select('prompt_type, action_taken, shown_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching prompt stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get prompt stats',
        error: error.message
      });
    }

    // Aggregate stats in JavaScript
    const statsMap = {};
    (data || []).forEach(record => {
      if (!statsMap[record.prompt_type]) {
        statsMap[record.prompt_type] = {
          prompt_type: record.prompt_type,
          shown_count: 0,
          conversion_count: 0,
          dismissed_count: 0,
          clicked_count: 0,
          last_shown: record.shown_at
        };
      }
      
      const stats = statsMap[record.prompt_type];
      stats.shown_count++;
      
      if (record.action_taken === 'upgraded') stats.conversion_count++;
      if (record.action_taken === 'dismissed') stats.dismissed_count++;
      if (record.action_taken === 'clicked') stats.clicked_count++;
      
      if (new Date(record.shown_at) > new Date(stats.last_shown)) {
        stats.last_shown = record.shown_at;
      }
    });

    const stats = Object.values(statsMap).sort((a, b) => b.shown_count - a.shown_count);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting prompt stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prompt stats',
      error: error.message
    });
  }
};

/**
 * Admin: Get conversion metrics for all prompts
 * GET /api/premium/admin/conversion-metrics
 */
exports.getConversionMetrics = async (req, res) => {
  try {
    // Fetch all prompt history
    const { data, error } = await supabaseAdmin
      .from('premium_prompt_history')
      .select('prompt_type, user_id, action_taken');

    if (error) {
      console.error('Error fetching conversion metrics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get conversion metrics',
        error: error.message
      });
    }

    // Aggregate metrics in JavaScript
    const metricsMap = {};
    (data || []).forEach(record => {
      if (!metricsMap[record.prompt_type]) {
        metricsMap[record.prompt_type] = {
          prompt_type: record.prompt_type,
          unique_users: new Set(),
          total_shown: 0,
          conversions: 0,
          dismissals: 0,
          clicks: 0
        };
      }
      
      const metrics = metricsMap[record.prompt_type];
      metrics.unique_users.add(record.user_id);
      metrics.total_shown++;
      
      if (record.action_taken === 'upgraded') metrics.conversions++;
      if (record.action_taken === 'dismissed') metrics.dismissals++;
      if (record.action_taken === 'clicked') metrics.clicks++;
    });

    // Convert to final format
    const metrics = Object.values(metricsMap).map(m => ({
      prompt_type: m.prompt_type,
      unique_users: m.unique_users.size,
      total_shown: m.total_shown,
      conversions: m.conversions,
      conversion_rate: m.total_shown > 0 
        ? parseFloat(((m.conversions / m.total_shown) * 100).toFixed(2))
        : 0,
      dismissals: m.dismissals,
      clicks: m.clicks
    })).sort((a, b) => b.total_shown - a.total_shown);

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error getting conversion metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversion metrics',
      error: error.message
    });
  }
};

/**
 * Reset prompt snooze (allow prompt to show again immediately)
 * POST /api/premium/reset-snooze
 * Body: { prompt_type }
 */
exports.resetSnooze = async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt_type } = req.body;

    if (!prompt_type) {
      return res.status(400).json({
        success: false,
        message: 'Prompt type is required'
      });
    }

    const { error } = await supabaseAdmin
      .from('premium_prompt_history')
      .update({ dismissed_until: null })
      .eq('user_id', userId)
      .eq('prompt_type', prompt_type)
      .eq('action_taken', 'dismissed');

    if (error) {
      console.error('Error resetting snooze:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reset snooze',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Snooze reset successfully'
    });
  } catch (error) {
    console.error('Error resetting snooze:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset snooze',
      error: error.message
    });
  }
};
