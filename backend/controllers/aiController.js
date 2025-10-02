const SmartCategorizationService = require('../services/smartCategorizationService');
const AISchedulerService = require('../services/aiSchedulerService');
const { logger } = require('../utils/logger');

class AIController {
    constructor(supabase) {
        this.supabase = supabase;
        this.smartCategorizationService = new SmartCategorizationService(supabase);
        this.aiSchedulerService = new AISchedulerService(supabase);
    }

    async categorizeTransaction(req, res) {
        const { description, amount, transactionType } = req.body;
        const userId = req.user.id;

        if (!description) {
            return res.status(400).json({ error: 'Transaction description is required' });
        }

        try {
            const suggestions = await this.smartCategorizationService.suggestCategory(
                description,
                amount || 0,
                transactionType || 1,
                userId
            );

            res.json({
                success: true,
                suggestions: suggestions,
                description: description
            });
        } catch (error) {
            logger.error('Failed to get category suggestions', { userId, description, error: error.message });
            res.status(500).json({
                error: 'Failed to get category suggestions',
                suggestions: [{
                    category: 'Uncategorized',
                    confidence: 0.3,
                    source: 'fallback'
                }]
            });
        }
    }

    async recordFeedback(req, res) {
        const {
            transactionDescription,
            suggestedCategory,
            actualCategory,
            wasAccepted,
            confidence,
            amount
        } = req.body;
        const userId = req.user.id;

        if (!transactionDescription || !actualCategory) {
            return res.status(400).json({ error: 'Transaction description and actual category are required' });
        }

        try {
            await this.smartCategorizationService.recordFeedback(
                userId,
                transactionDescription,
                suggestedCategory || 'None',
                actualCategory,
                wasAccepted || false,
                confidence || 0.5,
                amount
            );

            res.json({
                success: true,
                message: 'Feedback recorded successfully'
            });
        } catch (error) {
            logger.error('Failed to record AI feedback', { userId, transactionDescription, error: error.message });
            res.status(500).json({ error: 'Failed to record feedback' });
        }
    }

    async getProjectedExpenses(req, res) {
        const userId = req.user.id;
        try {
            const predictions = await this.aiSchedulerService.predictUpcomingBills(userId);
            res.json(predictions);
        } catch (error) {
            logger.error('Failed to get projected expenses', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to get projected expenses' });
        }
    }

    async getAIStats(req, res) {
        const userId = req.user.id;
        try {
            // Check if AI columns exist in the transactions table
            const { data: sampleTransaction, error: sampleError } = await this.supabase
                .from('transactions')
                .select('*')
                .eq('userId', userId)
                .limit(1)
                .single();

            if (sampleError && sampleError.code !== 'PGRST116') {
                throw sampleError;
            }

            // If no transactions exist or AI columns don't exist, return default stats
            if (!sampleTransaction || !sampleTransaction.hasOwnProperty('ai_suggested_category')) {
                return res.json({
                    totalSuggestions: 0,
                    acceptedSuggestions: 0,
                    accuracy: 0,
                    averageConfidence: 0,
                    message: 'AI categorization not yet implemented'
                });
            }

            // Get actual AI categorization statistics
            const { data: categorizedTransactions, error: categorizationError } = await this.supabase
                .from('transactions')
                .select('id, ai_suggested_category, category, ai_confidence')
                .eq('userId', userId)
                .not('ai_suggested_category', 'is', null);

            if (categorizationError) {
                throw categorizationError;
            }

            const totalSuggestions = categorizedTransactions?.length || 0;
            const acceptedSuggestions = categorizedTransactions?.filter(t => 
                t.category === t.ai_suggested_category
            ).length || 0;
            
            const averageConfidence = categorizedTransactions?.length > 0
                ? categorizedTransactions.reduce((sum, t) => sum + (t.ai_confidence || 0), 0) / categorizedTransactions.length
                : 0;

            res.json({
                totalSuggestions,
                acceptedSuggestions,
                accuracy: totalSuggestions > 0 ? (acceptedSuggestions / totalSuggestions) : 0,
                averageConfidence: Math.round(averageConfidence * 100) / 100
            });
        } catch (error) {
            logger.error('Failed to get AI stats', { userId, error: error.message });
            res.status(500).json({ error: 'Failed to fetch AI statistics' });
        }
    }
}

module.exports = AIController;
