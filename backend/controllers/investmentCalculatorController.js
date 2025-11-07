const InvestmentCalculator = require('../models/InvestmentCalculator');
const User = require('../models/User');
const investmentCalculatorService = require('../services/investmentCalculatorService');
const { logger } = require('../utils/logger');

const FREE_TIER_MONTHLY_LIMIT = 2;

class InvestmentCalculatorController {
    constructor(supabase) {
        this.supabase = supabase;
    }

    /**
     * Calculate investment with compound interest
     * POST /api/investment-calculator/calculate
     */
    async calculateInvestment(req, res) {
        const userId = req.user?.id;

        // Validate authentication
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        const {
            initialInvestment,
            contributionAmount,
            contributionFrequency,
            annualInterestRate,
            goalDate,
            viewType = 'monthly'
        } = req.body;

        try {
            // Validate input parameters
            const validation = investmentCalculatorService.validateParameters({
                initialInvestment,
                contributionAmount,
                contributionFrequency,
                annualInterestRate,
                goalDate
            });

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // Get user profile to check subscription tier
            const user = await User.getById(userId);
            const subscriptionTier = user?.subscription_tier || 'free';

            // Check usage limit for free users
            if (subscriptionTier === 'free') {
                const usage = await InvestmentCalculator.getMonthlyUsage(userId);

                if (usage.simulation_count >= FREE_TIER_MONTHLY_LIMIT) {
                    return res.status(429).json({
                        success: false,
                        error: 'Monthly simulation limit reached',
                        message: `You've reached your monthly limit of ${FREE_TIER_MONTHLY_LIMIT} simulations. Upgrade to premium for unlimited simulations.`,
                        limit: FREE_TIER_MONTHLY_LIMIT,
                        used: usage.simulation_count,
                        upgradeRequired: true
                    });
                }
            }

            // Perform calculation
            const calculation = investmentCalculatorService.calculateCompoundInterest({
                initialInvestment,
                contributionAmount,
                contributionFrequency,
                annualInterestRate,
                goalDate
            });

            // Generate growth data for charting
            const growthData = investmentCalculatorService.generateGrowthData({
                initialInvestment,
                contributionAmount,
                contributionFrequency,
                annualInterestRate,
                goalDate
            }, viewType);

            // Increment usage count for free users
            if (subscriptionTier === 'free') {
                await InvestmentCalculator.incrementUsage(userId);
            }

            // Save simulation for premium users
            if (subscriptionTier === 'premium') {
                await InvestmentCalculator.saveSimulation(userId, {
                    initialInvestment,
                    contributionAmount,
                    contributionFrequency,
                    annualInterestRate,
                    goalDate,
                    finalValue: calculation.finalValue,
                    totalContributions: calculation.totalContributions,
                    totalInterest: calculation.totalInterest,
                    roiPercentage: calculation.roiPercentage,
                    metadata: { viewType }
                });
            }

            // Get updated usage
            const updatedUsage = await InvestmentCalculator.getMonthlyUsage(userId);

            res.json({
                success: true,
                data: {
                    summary: {
                        finalValue: calculation.finalValue,
                        totalContributions: calculation.totalContributions,
                        totalInterest: calculation.totalInterest,
                        roiPercentage: calculation.roiPercentage,
                        years: calculation.years
                    },
                    growthData,
                    usage: {
                        simulationsUsed: updatedUsage.simulation_count,
                        simulationsLimit: subscriptionTier === 'free' ? FREE_TIER_MONTHLY_LIMIT : null,
                        isPremium: subscriptionTier === 'premium'
                    }
                }
            });
        } catch (error) {
            logger.error('Error in investment calculator calculateInvestment', {
                userId,
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                error: error.message || 'Failed to calculate investment'
            });
        }
    }

    /**
     * Get current month usage statistics
     * GET /api/investment-calculator/usage
     */
    async getUsage(req, res) {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        try {
            // Get user profile to check subscription tier
            const user = await User.getById(userId);
            const subscriptionTier = user?.subscription_tier || 'free';

            // Get current month usage
            const usage = await InvestmentCalculator.getMonthlyUsage(userId);

            res.json({
                success: true,
                data: {
                    simulationsUsed: usage.simulation_count,
                    simulationsLimit: subscriptionTier === 'free' ? FREE_TIER_MONTHLY_LIMIT : null,
                    isPremium: subscriptionTier === 'premium',
                    month: usage.month
                }
            });
        } catch (error) {
            logger.error('Error in investment calculator getUsage', {
                userId,
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch usage statistics'
            });
        }
    }

    /**
     * Get saved simulations (premium only)
     * GET /api/investment-calculator/simulations
     */
    async getSavedSimulations(req, res) {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        try {
            // Get user profile to check subscription tier
            const user = await User.getById(userId);
            const subscriptionTier = user?.subscription_tier || 'free';

            // Check if user is premium
            if (subscriptionTier !== 'premium') {
                return res.status(403).json({
                    success: false,
                    message: 'This feature is only available for premium users',
                    upgradeRequired: true
                });
            }

            const limit = parseInt(req.query.limit) || 10;
            const simulations = await InvestmentCalculator.getUserSimulations(userId, limit);

            res.json({
                success: true,
                data: simulations
            });
        } catch (error) {
            logger.error('Error in investment calculator getSavedSimulations', {
                userId,
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch saved simulations'
            });
        }
    }

    /**
     * Get usage statistics over time (for analytics)
     * GET /api/investment-calculator/usage-stats
     */
    async getUsageStats(req, res) {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        try {
            const months = parseInt(req.query.months) || 6;
            const stats = await InvestmentCalculator.getUsageStats(userId, months);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error('Error in investment calculator getUsageStats', {
                userId,
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch usage statistics'
            });
        }
    }
}

module.exports = InvestmentCalculatorController;





