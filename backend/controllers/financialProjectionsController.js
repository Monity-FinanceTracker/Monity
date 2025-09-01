const { logger } = require('../utils/logger');
const SavingsGoal = require('../models/SavingsGoal');

class FinancialProjectionsController {
    constructor(supabase) {
        this.supabase = supabase;
        this.savingsGoalModel = new SavingsGoal(supabase);
    }

    async createProjection(req, res) {
        const userId = req.user.id;
        const { goalId, extraMonthlySavings } = req.body;

        if (!goalId || !extraMonthlySavings || extraMonthlySavings <= 0) {
            return res.status(400).json({ error: 'Goal ID and extra monthly savings amount are required' });
        }

        try {
            // Get the savings goal
            const goal = await this.savingsGoalModel.findById(goalId, userId);
            if (!goal) {
                return res.status(404).json({ error: 'Savings goal not found' });
            }

            const currentAmount = parseFloat(goal.current_amount || 0);
            const targetAmount = parseFloat(goal.target_amount);
            const extraMonthly = parseFloat(extraMonthlySavings);
            
            // Calculate remaining amount needed
            const remainingAmount = targetAmount - currentAmount;
            
            if (remainingAmount <= 0) {
                return res.json({
                    goalId,
                    goalName: goal.goal_name,
                    currentAmount,
                    targetAmount,
                    extraMonthlySavings: extraMonthly,
                    monthsToGoal: 0,
                    projectedDate: new Date().toISOString(),
                    message: 'Goal already achieved!'
                });
            }

            // Calculate months needed with extra savings
            const monthsToGoal = Math.ceil(remainingAmount / extraMonthly);
            
            // Calculate projected completion date
            const projectedDate = new Date();
            projectedDate.setMonth(projectedDate.getMonth() + monthsToGoal);

            const projection = {
                goalId,
                goalName: goal.goal_name,
                currentAmount,
                targetAmount,
                remainingAmount,
                extraMonthlySavings: extraMonthly,
                monthsToGoal,
                projectedDate: projectedDate.toISOString(),
                message: `With $${extraMonthly} extra per month, you'll reach your goal in ${monthsToGoal} months!`
            };

            res.json(projection);
        } catch (error) {
            logger.error('Failed to create financial projection', { userId, goalId, error: error.message });
            res.status(500).json({ error: 'Failed to create projection' });
        }
    }

    async getProjection(req, res) {
        const userId = req.user.id;
        const goalId = req.params.goalId;

        try {
            // Get the savings goal
            const goal = await this.savingsGoalModel.findById(goalId, userId);
            if (!goal) {
                return res.status(404).json({ error: 'Savings goal not found' });
            }

            const currentAmount = parseFloat(goal.current_amount || 0);
            const targetAmount = parseFloat(goal.target_amount);
            const targetDate = new Date(goal.target_date);
            const currentDate = new Date();
            
            // Calculate time remaining
            const timeRemaining = targetDate - currentDate;
            const monthsRemaining = Math.max(1, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24 * 30)));
            
            // Calculate remaining amount needed
            const remainingAmount = targetAmount - currentAmount;
            
            // Calculate required monthly savings
            const requiredMonthlySavings = remainingAmount > 0 ? Math.ceil(remainingAmount / monthsRemaining) : 0;

            const projection = {
                goalId,
                goalName: goal.goal_name,
                currentAmount,
                targetAmount,
                remainingAmount,
                targetDate: goal.target_date,
                monthsRemaining,
                requiredMonthlySavings,
                onTrack: requiredMonthlySavings <= 0 || currentAmount >= targetAmount
            };

            res.json(projection);
        } catch (error) {
            logger.error('Failed to get financial projection', { userId, goalId, error: error.message });
            res.status(500).json({ error: 'Failed to get projection' });
        }
    }
}

module.exports = FinancialProjectionsController;
