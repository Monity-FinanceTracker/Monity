const { supabaseAdmin } = require('../config/supabase');

/**
 * Feature Discovery Controller
 * Handles tracking of feature discovery and interaction
 */

/**
 * Get all discovered features for a user
 * GET /api/features/discovered
 */
exports.getDiscoveredFeatures = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all discovered features
    const { data: features, error: featuresError } = await supabaseAdmin
      .from('feature_discovery')
      .select('feature_name, discovered_at, interaction_count, last_interaction_at')
      .eq('user_id', userId)
      .order('discovered_at', { ascending: true });

    if (featuresError) {
      console.error('Error fetching discovered features:', featuresError);
      return res.status(500).json({
        success: false,
        message: 'Failed to get discovered features',
        error: featuresError.message
      });
    }

    // Get user signup date for calculating feature schedule
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    res.json({
      success: true,
      features: features || [],
      signup_date: userData?.created_at || null
    });
  } catch (error) {
    console.error('Error getting discovered features:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get discovered features',
      error: error.message
    });
  }
};

/**
 * Mark a feature as discovered
 * POST /api/features/discover
 * Body: { feature_name: string }
 */
exports.discoverFeature = async (req, res) => {
  try {
    const userId = req.user.id;
    const { feature_name } = req.body;

    if (!feature_name) {
      return res.status(400).json({
        success: false,
        message: 'Feature name is required'
      });
    }

    // Use the database function to mark feature as discovered
    const { error } = await supabaseAdmin.rpc('mark_feature_discovered', {
      p_user_id: userId,
      p_feature_name: feature_name
    });

    if (error) {
      console.error('Error marking feature as discovered:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark feature as discovered',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Feature marked as discovered',
      feature_name
    });
  } catch (error) {
    console.error('Error marking feature as discovered:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark feature as discovered',
      error: error.message
    });
  }
};

/**
 * Get feature discovery statistics
 * GET /api/features/stats
 */
exports.getFeatureStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all discovered features for the user
    const { data, error } = await supabaseAdmin
      .from('feature_discovery')
      .select('discovered_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching feature stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get feature stats',
        error: error.message
      });
    }

    // Calculate stats
    const totalDiscovered = data?.length || 0;
    const uniqueDates = new Set(
      (data || []).map(record => new Date(record.discovered_at).toDateString())
    );
    const lastDiscovery = data?.length > 0
      ? data.reduce((latest, record) => {
          const date = new Date(record.discovered_at);
          return date > latest ? date : latest;
        }, new Date(0))
      : null;

    res.json({
      success: true,
      stats: {
        total_discovered: totalDiscovered,
        discovery_days: uniqueDates.size,
        last_discovery: lastDiscovery
      }
    });
  } catch (error) {
    console.error('Error getting feature stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feature stats',
      error: error.message
    });
  }
};

/**
 * Reset feature discovery (for testing)
 * DELETE /api/features/reset
 */
exports.resetFeatureDiscovery = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('feature_discovery')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error resetting feature discovery:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reset feature discovery',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Feature discovery reset successfully'
    });
  } catch (error) {
    console.error('Error resetting feature discovery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset feature discovery',
      error: error.message
    });
  }
};
