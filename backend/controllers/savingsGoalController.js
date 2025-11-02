const SavingsGoal = require('../models/SavingsGoal');
const Transaction = require('../models/Transaction');
const { logger } = require('../utils/logger');

class SavingsGoalController {
    constructor(supabase) {
        this.supabase = supabase;
        this.savingsGoalModel = new SavingsGoal(supabase);
    }

    async getAllSavingsGoals(req, res) {
        const userId = req.user.id;
        try {
            const goals = await this.savingsGoalModel.findByUser(userId);
            res.json(goals);
        } catch (error) {
            logger.error('Failed to get savings goals for user', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch savings goals' });
        }
    }

    async getSavingsGoalById(req, res) {
        const userId = req.user.id;
        const goalId = req.params.id;
        try {
            const goal = await this.savingsGoalModel.findById(goalId, userId);
            if (!goal) {
                return res.status(404).json({ error: 'Savings goal not found' });
            }
            res.json(goal);
        } catch (error) {
            logger.error('Failed to get savings goal by ID', { userId, goalId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch savings goal' });
        }
    }

    async createSavingsGoal(req, res) {
        const userId = req.user.id;
        const { goal_name, target_amount, target_date, current_amount } = req.body;
        if (!goal_name || !target_amount || !target_date) {
            return res.status(400).json({ message: 'Goal name, target amount, and target date are required' });
        }

        try {
            const newGoal = await this.savingsGoalModel.create({
                user_id: userId,
                goal_name,
                target_amount,
                target_date,
                current_amount: current_amount || 0
            });
            res.status(201).json(newGoal);
        } catch (error) {
            logger.error('Failed to create savings goal', { userId, error: error.message, stack: error.stack });
            res.status(500).json({
                error: 'Failed to create savings goal',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async updateSavingsGoal(req, res) {
        const userId = req.user.id;
        const goalId = req.params.id;
        const { goal_name, target_amount, target_date, current_amount } = req.body;

        try {
            const updatedGoal = await this.savingsGoalModel.update(goalId, userId, {
                goal_name,
                target_amount,
                target_date,
                current_amount
            });

            if (!updatedGoal) {
                return res.status(404).json({ error: 'Savings goal not found or you do not have permission to update it.' });
            }

            res.json(updatedGoal);
        } catch (error) {
            logger.error('Failed to update savings goal', { userId, goalId, error: error.message });
            res.status(500).json({ error: 'Failed to update savings goal' });
        }
    }

    async deleteSavingsGoal(req, res) {
        const userId = req.user.id;
        const goalId = req.params.id;

        try {
            const deletedGoal = await this.savingsGoalModel.delete(goalId, userId);
            if (!deletedGoal) {
                return res.status(404).json({ error: 'Savings goal not found or you do not have permission to delete it.' });
            }
            res.json({ message: 'Savings goal deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete savings goal', { userId, goalId, error: error.message });
            res.status(500).json({ error: 'Failed to delete savings goal' });
        }
    }

    async allocateToGoal(req, res) {
        const userId = req.user.id;
        const goalId = req.params.id;
        const { amount } = req.body;

        // Parse and validate amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0.01) {
            return res.status(400).json({ error: 'Amount must be at least 0.01' });
        }

        try {
            // Get the current goal
            const goal = await this.savingsGoalModel.findById(goalId, userId);
            if (!goal) {
                return res.status(404).json({ error: 'Savings goal not found' });
            }

            // Update the current amount (use parsedAmount for consistency)
            const newCurrentAmount = parseFloat(goal.current_amount || 0) + parsedAmount;

            const updatedGoal = await this.savingsGoalModel.update(goalId, userId, {
                current_amount: newCurrentAmount
            });

            if (!updatedGoal) {
                return res.status(500).json({ error: 'Failed to update savings goal' });
            }

            // Create a type 3 transaction for the allocation
            const transactionData = {
                userId,
                description: `Savings: ${goal.goal_name}`,
                amount: parsedAmount,
                category: 'Savings Goal',
                date: new Date().toISOString().split('T')[0],
                typeId: 3,
                metadata: {
                    savings_goal_id: goalId,
                    savings_goal_name: goal.goal_name,
                    operation: 'allocate'
                }
            };

            try {
                await Transaction.create(transactionData);
                logger.info('Created type 3 transaction for savings goal allocation', { userId, goalId, amount });
            } catch (transactionError) {
                logger.error('Failed to create transaction for savings goal allocation', {
                    userId,
                    goalId,
                    amount,
                    error: transactionError.message,
                    stack: transactionError.stack
                });
                // Fail the request if transaction creation fails
                throw new Error(`Failed to create savings transaction: ${transactionError.message}`);
            }

            res.json(updatedGoal);
        } catch (error) {
            logger.error('Failed to allocate money to savings goal', { userId, goalId, amount, error: error.message });
            res.status(500).json({ error: 'Failed to allocate money to savings goal' });
        }
    }

    async withdrawFromGoal(req, res) {
        const userId = req.user.id;
        const goalId = req.params.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        try {
            // Get the current goal
            const goal = await this.savingsGoalModel.findById(goalId, userId);
            if (!goal) {
                return res.status(404).json({ error: 'Savings goal not found' });
            }

            const currentAmount = parseFloat(goal.current_amount || 0);
            const withdrawAmount = parseFloat(amount);

            if (withdrawAmount > currentAmount) {
                return res.status(400).json({ 
                    error: 'Cannot withdraw more than the current saved amount',
                    available: currentAmount
                });
            }

            // Update the current amount
            const newCurrentAmount = currentAmount - withdrawAmount;

            const updatedGoal = await this.savingsGoalModel.update(goalId, userId, {
                current_amount: newCurrentAmount
            });

            if (!updatedGoal) {
                return res.status(500).json({ error: 'Failed to update savings goal' });
            }

            // Create a NEGATIVE type 3 transaction for withdrawal
            const transactionData = {
                userId,
                description: `Withdrawal: ${goal.goal_name}`,
                amount: -parseFloat(amount), // Negative amount for withdrawal
                category: 'Savings Goal',
                date: new Date().toISOString().split('T')[0],
                typeId: 3,
                metadata: {
                    savings_goal_id: goalId,
                    savings_goal_name: goal.goal_name,
                    operation: 'withdraw'
                }
            };

            try {
                await Transaction.create(transactionData);
                logger.info('Created type 3 transaction for savings goal withdrawal', { userId, goalId, amount });
            } catch (transactionError) {
                logger.error('Failed to create transaction for savings goal withdrawal', {
                    userId,
                    goalId,
                    amount,
                    error: transactionError.message,
                    stack: transactionError.stack
                });
                // Fail the request if transaction creation fails
                throw new Error(`Failed to create withdrawal transaction: ${transactionError.message}`);
            }

            res.json({
                ...updatedGoal,
                withdrawnAmount: withdrawAmount
            });
        } catch (error) {
            logger.error('Failed to withdraw money from savings goal', { userId, goalId, amount, error: error.message });
            res.status(500).json({ error: 'Failed to withdraw money from savings goal' });
        }
    }
}

module.exports = SavingsGoalController;
