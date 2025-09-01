const { logger } = require('../utils/logger');
const SavingsGoal = require('../models/SavingsGoal');

class FinancialProjectionsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.savingsGoalModel = new SavingsGoal(supabase);
    }

    /**
     * Projects future financial scenarios based on savings goals.
     * @param {string} goalId - The ID of the savings goal.
     * @param {number} extraMonthlySavings - Additional monthly savings amount.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Object>} - The projection results.
     */
    async projectSavingsGoal(goalId, extraMonthlySavings, userId) {
        try {
            const goal = await this.savingsGoalModel.getById(goalId, userId);
            if (!goal) {
                throw new Error('Savings goal not found');
            }

            const remainingAmount = goal.target_amount - goal.current_amount;
            if (remainingAmount <= 0) {
                return {
                    projectedDate: new Date(),
                    monthsToReachGoal: 0,
                    daysSooner: 0,
                    goalMet: true,
                };
            }

            if (extraMonthlySavings <= 0) {
                return {
                    projectedDate: null,
                    monthsToReachGoal: Infinity,
                    daysSooner: 0,
                    goalMet: false,
                };
            }

            const monthsToReachGoal = remainingAmount / extraMonthlySavings;
            
            const originalTargetDate = new Date(goal.target_date);
            const projectedDate = new Date();
            projectedDate.setMonth(projectedDate.getMonth() + monthsToReachGoal);

            const timeDifference = originalTargetDate.getTime() - projectedDate.getTime();
            const daysSooner = Math.max(0, Math.ceil(timeDifference / (1000 * 3600 * 24)));

            const result = {
                projectedDate,
                monthsToReachGoal: Math.ceil(monthsToReachGoal),
                daysSooner,
                goalMet: false,
            };

            logger.info(`Financial projection calculated for goal ${goalId} for user ${userId}`);

            return result;

        } catch (error) {
            logger.error(`Failed to calculate financial projection for goal ${goalId}`, { 
                error: error.message,
                userId,
            });
            throw error;
        }
    }
}

module.exports = FinancialProjectionsService;
