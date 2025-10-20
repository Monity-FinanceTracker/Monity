const AIChat = require('../models/AIChat');
const User = require('../models/User');
const { AIChatService } = require('../services');
const { logger } = require('../utils/logger');

const FREE_TIER_DAILY_LIMIT = 3;

class AIChatController {
    constructor(supabase) {
        this.supabase = supabase;
        this.aiChatService = new AIChatService(supabase);
    }

    /**
     * Send a chat message and get AI response
     */
    async sendMessage(req, res) {
        const userId = req.user.id;
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        try {
            // Get user profile to check subscription tier
            const user = await User.getById(userId);
            const subscriptionTier = user?.subscription_tier || 'free';

            // Check message limit for free users
            if (subscriptionTier === 'free') {
                const usage = await AIChat.getTodayUsage(userId);

                if (usage.message_count >= FREE_TIER_DAILY_LIMIT) {
                    return res.status(429).json({
                        success: false,
                        error: 'Daily message limit reached',
                        message: `You've reached your daily limit of ${FREE_TIER_DAILY_LIMIT} messages. Upgrade to premium for unlimited messages.`,
                        limit: FREE_TIER_DAILY_LIMIT,
                        used: usage.message_count,
                        upgradeRequired: true
                    });
                }
            }

            // Get conversation history (last 10 messages for context)
            const history = await AIChat.getMessages(userId, 10);

            // Save user message
            await AIChat.createMessage(userId, 'user', message);

            // Get AI response
            const aiResponse = await this.aiChatService.chat(
                userId,
                message,
                history
            );

            // Save assistant message
            await AIChat.createMessage(userId, 'assistant', aiResponse.message, {
                tokensUsed: aiResponse.tokensUsed,
                metadata: { model: aiResponse.model }
            });

            // Increment usage count
            await AIChat.incrementUsage(userId, aiResponse.tokensUsed);

            // Get updated usage for response
            const updatedUsage = await AIChat.getTodayUsage(userId);

            res.json({
                success: true,
                message: aiResponse.message,
                usage: {
                    messagesUsed: updatedUsage.message_count,
                    messagesLimit: subscriptionTier === 'free' ? FREE_TIER_DAILY_LIMIT : null,
                    tokensUsed: aiResponse.tokensUsed
                }
            });
        } catch (error) {
            logger.error('Error in AI chat sendMessage', {
                userId,
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                error: error.message || 'Failed to send message'
            });
        }
    }

    /**
     * Get chat history
     */
    async getHistory(req, res) {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;

        try {
            const messages = await AIChat.getMessages(userId, limit);

            res.json({
                success: true,
                messages
            });
        } catch (error) {
            logger.error('Error fetching chat history', {
                userId,
                error: error.message
            });

            res.status(500).json({
                success: false,
                error: 'Failed to fetch chat history'
            });
        }
    }

    /**
     * Get usage statistics
     */
    async getUsage(req, res) {
        const userId = req.user.id;

        try {
            const user = await User.getById(userId);
            const subscriptionTier = user?.subscription_tier || 'free';
            const todayUsage = await AIChat.getTodayUsage(userId);

            res.json({
                success: true,
                usage: {
                    today: {
                        messagesUsed: todayUsage.message_count,
                        messagesLimit: subscriptionTier === 'free' ? FREE_TIER_DAILY_LIMIT : null,
                        tokensUsed: todayUsage.tokens_used
                    },
                    subscriptionTier,
                    hasUnlimited: subscriptionTier === 'premium'
                }
            });
        } catch (error) {
            logger.error('Error fetching chat usage', {
                userId,
                error: error.message
            });

            res.status(500).json({
                success: false,
                error: 'Failed to fetch usage statistics'
            });
        }
    }

    /**
     * Clear chat history
     */
    async clearHistory(req, res) {
        const userId = req.user.id;

        try {
            await AIChat.clearMessages(userId);

            res.json({
                success: true,
                message: 'Chat history cleared successfully'
            });
        } catch (error) {
            logger.error('Error clearing chat history', {
                userId,
                error: error.message
            });

            res.status(500).json({
                success: false,
                error: 'Failed to clear chat history'
            });
        }
    }

    /**
     * Get suggested prompts
     */
    async getSuggestedPrompts(req, res) {
        const userId = req.user.id;

        try {
            const suggestedMessage = await this.aiChatService.getSuggestedFirstMessage(userId);

            const prompts = [
                suggestedMessage,
                "What are my biggest spending categories?",
                "How can I improve my savings rate?",
                "Am I on track with my budgets?",
                "Give me tips to reduce my expenses"
            ];

            res.json({
                success: true,
                prompts
            });
        } catch (error) {
            logger.error('Error getting suggested prompts', {
                userId,
                error: error.message
            });

            // Return default prompts on error
            res.json({
                success: true,
                prompts: [
                    "Can you give me an overview of my financial situation?",
                    "What are my biggest spending categories?",
                    "How can I improve my savings rate?",
                    "Am I on track with my budgets?",
                    "Give me tips to reduce my expenses"
                ]
            });
        }
    }
}

module.exports = AIChatController;
