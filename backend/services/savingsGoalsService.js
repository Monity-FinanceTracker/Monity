const { SavingsGoal } = require('../models');
const { logger } = require('../utils');

class SavingsGoalsService {

    async createGoal(goalData) {
        try {
            return await SavingsGoal.create(goalData);
        } catch (error) {
            logger.error('Error in createGoal service', { error: error.message, goalData });
            throw new Error('Failed to create savings goal.');
        }
    }

    async getGoalsForUser(userId) {
        try {
            return await SavingsGoal.findByUser(userId);
        } catch (error) {
            logger.error('Error in getGoalsForUser service', { error: error.message, userId });
            throw new Error('Failed to retrieve savings goals.');
        }
    }

    async updateGoal(id, userId, updates) {
        try {
            return await SavingsGoal.update(id, userId, updates);
        } catch (error) {
            logger.error('Error in updateGoal service', { error: error.message, id, updates });
            throw new Error('Failed to update savings goal.');
        }
    }

    async deleteGoal(id, userId) {
        try {
            return await SavingsGoal.delete(id, userId);
        } catch (error) {
            logger.error('Error in deleteGoal service', { error: error.message, id });
            throw new Error('Failed to delete savings goal.');
        }
    }

    async allocateToGoal(id, userId, amount) {
        try {
            // This is a business logic operation that calls a specific RPC
            return await SavingsGoal.allocate(id, userId, amount);
        } catch (error) {
            logger.error('Error in allocateToGoal service', { error: error.message, id, amount });
            throw new Error('Failed to allocate to savings goal.');
        }
    }
}

module.exports = new SavingsGoalsService();
