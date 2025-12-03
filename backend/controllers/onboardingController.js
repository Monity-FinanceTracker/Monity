const { supabaseAdmin } = require('../config/supabase');

/**
 * Onboarding Controller
 * Handles user onboarding flow, progress tracking, and completion
 */

/**
 * Get onboarding status and progress for a user
 * GET /api/onboarding/progress
 */
exports.getOnboardingProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Call the get_or_create_onboarding PostgreSQL function via Supabase RPC
    const { data, error } = await supabaseAdmin.rpc('get_or_create_onboarding', {
      p_user_id: userId
    });

    if (error) {
      throw error;
    }

    // RPC returns an array, get the first result
    const onboarding = (Array.isArray(data) && data.length > 0) ? data[0] : {
      onboarding_completed: false,
      current_step: 1,
      steps_completed: [],
      checklist_progress: {},
      primary_goal: null,
      estimated_income: null
    };

    res.json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding progress',
      error: error.message
    });
  }
};

/**
 * Start onboarding for a user
 * POST /api/onboarding/start
 */
exports.startOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;

    // Create or reset onboarding record using Supabase upsert
    const { error } = await supabaseAdmin
      .from('user_onboarding')
      .upsert({
        user_id: userId,
        current_step: 1,
        onboarding_completed: false,
        steps_completed: [],
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Onboarding started'
    });
  } catch (error) {
    console.error('Error starting onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start onboarding',
      error: error.message
    });
  }
};

/**
 * Complete a step in the onboarding process
 * POST /api/onboarding/complete-step
 * Body: { step: number, data: object }
 */
exports.completeStep = async (req, res) => {
  try {
    const userId = req.user.id;
    const { step, data } = req.body;

    if (!step || typeof step !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Step number is required'
      });
    }

    // Get current progress using Supabase
    const { data: currentProgress, error: fetchError } = await supabaseAdmin
      .from('user_onboarding')
      .select('steps_completed, checklist_progress, primary_goal, estimated_income, preferred_categories')
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentProgress) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not started'
      });
    }

    let stepsCompleted = currentProgress.steps_completed || [];
    let checklistProgress = currentProgress.checklist_progress || {};
    let primaryGoal = currentProgress.primary_goal;
    let estimatedIncome = currentProgress.estimated_income;
    let preferredCategories = currentProgress.preferred_categories || [];

    // Add step to completed steps if not already there
    if (!stepsCompleted.includes(step)) {
      stepsCompleted.push(step);
    }

    // Update specific data based on step
    if (data) {
      // Step 1: Goal setting
      if (step === 1 && data.goal) {
        primaryGoal = data.goal;
      }

      // Step 2: Financial context
      if (step === 2) {
        if (data.estimatedIncome) {
          estimatedIncome = data.estimatedIncome;
        }
        if (data.preferredCategories) {
          preferredCategories = data.preferredCategories;
        }
      }

      // Step 3: First transaction
      if (step === 3 && data.transactionAdded) {
        checklistProgress.add_first_transaction = true;
      }
    }

    // Calculate next step
    const nextStep = Math.min(step + 1, 5);

    // Update onboarding progress using Supabase
    const { error: updateError } = await supabaseAdmin
      .from('user_onboarding')
      .update({
        current_step: nextStep,
        steps_completed: stepsCompleted,
        checklist_progress: checklistProgress,
        primary_goal: primaryGoal,
        estimated_income: estimatedIncome,
        preferred_categories: preferredCategories
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: `Step ${step} completed`,
      data: {
        current_step: nextStep,
        steps_completed: stepsCompleted,
        progress_percentage: (stepsCompleted.length / 5) * 100
      }
    });
  } catch (error) {
    console.error('Error completing onboarding step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete step',
      error: error.message
    });
  }
};

/**
 * Complete the entire onboarding process
 * POST /api/onboarding/complete
 */
exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user_onboarding table
    const { error: onboardingError } = await supabaseAdmin
      .from('user_onboarding')
      .update({
        onboarding_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (onboardingError) {
      throw onboardingError;
    }

    // Also update profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        onboarding_completed: true
      })
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    res.json({
      success: true,
      message: 'Onboarding completed successfully'
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
};

/**
 * Skip onboarding
 * POST /api/onboarding/skip
 */
exports.skipOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user_onboarding table
    const { error: onboardingError } = await supabaseAdmin
      .from('user_onboarding')
      .update({
        onboarding_completed: true,
        skipped_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (onboardingError) {
      throw onboardingError;
    }

    // Also update profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        onboarding_completed: true
      })
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    res.json({
      success: true,
      message: 'Onboarding skipped'
    });
  } catch (error) {
    console.error('Error skipping onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to skip onboarding',
      error: error.message
    });
  }
};

/**
 * Update checklist progress
 * POST /api/onboarding/checklist
 * Body: { item: string, completed: boolean }
 */
exports.updateChecklistProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item, completed } = req.body;

    if (!item) {
      return res.status(400).json({
        success: false,
        message: 'Checklist item is required'
      });
    }

    // Get current checklist progress using Supabase
    const { data: currentData, error: fetchError } = await supabaseAdmin
      .from('user_onboarding')
      .select('checklist_progress')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    let checklistProgress = currentData?.checklist_progress || {};
    checklistProgress[item] = completed;

    // Update checklist using Supabase
    const { error: updateError } = await supabaseAdmin
      .from('user_onboarding')
      .update({
        checklist_progress: checklistProgress
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    // Calculate completion percentage
    const completedItems = Object.values(checklistProgress).filter(v => v === true).length;
    const totalItems = 7; // As per plan
    const percentage = (completedItems / totalItems) * 100;

    res.json({
      success: true,
      message: 'Checklist updated',
      data: {
        checklist_progress: checklistProgress,
        completed_items: completedItems,
        total_items: totalItems,
        percentage
      }
    });
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update checklist',
      error: error.message
    });
  }
};
