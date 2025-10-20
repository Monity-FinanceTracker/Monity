const { supabaseAdmin } = require('../config');

const MESSAGES_TABLE = 'ai_chat_messages';
const USAGE_TABLE = 'ai_chat_usage';

class AIChat {
    /**
     * Get chat messages for a user
     * @param {string} userId - User ID
     * @param {number} limit - Number of messages to retrieve
     * @returns {Promise<Array>} Array of chat messages
     */
    static async getMessages(userId, limit = 50) {
        const { data, error } = await supabaseAdmin
            .from(MESSAGES_TABLE)
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(`Error fetching chat messages: ${error.message}`);
        }

        // Return in chronological order (oldest first)
        return data.reverse();
    }

    /**
     * Create a new chat message
     * @param {string} userId - User ID
     * @param {string} role - Message role ('user' or 'assistant')
     * @param {string} content - Message content
     * @param {Object} options - Optional metadata and token count
     * @returns {Promise<Object>} Created message
     */
    static async createMessage(userId, role, content, options = {}) {
        const messageData = {
            userId,
            role,
            content,
            tokens_used: options.tokensUsed || 0,
            metadata: options.metadata || {}
        };

        const { data, error } = await supabaseAdmin
            .from(MESSAGES_TABLE)
            .insert(messageData)
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating chat message: ${error.message}`);
        }

        return data;
    }

    /**
     * Get today's usage for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Usage data for today
     */
    static async getTodayUsage(userId) {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabaseAdmin
            .from(USAGE_TABLE)
            .select('*')
            .eq('userId', userId)
            .eq('date', today)
            .single();

        if (error) {
            // If no record exists for today, return default values
            if (error.code === 'PGRST116') {
                return {
                    userId,
                    date: today,
                    message_count: 0,
                    tokens_used: 0
                };
            }
            throw new Error(`Error fetching usage: ${error.message}`);
        }

        return data;
    }

    /**
     * Increment usage count for today
     * @param {string} userId - User ID
     * @param {number} tokensUsed - Number of tokens used
     * @returns {Promise<Object>} Updated usage data
     */
    static async incrementUsage(userId, tokensUsed = 0) {
        const today = new Date().toISOString().split('T')[0];

        // Try to get existing record
        const { data: existing } = await supabaseAdmin
            .from(USAGE_TABLE)
            .select('*')
            .eq('userId', userId)
            .eq('date', today)
            .single();

        if (existing) {
            // Update existing record
            const { data, error } = await supabaseAdmin
                .from(USAGE_TABLE)
                .update({
                    message_count: existing.message_count + 1,
                    tokens_used: existing.tokens_used + tokensUsed
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating usage: ${error.message}`);
            }
            return data;
        } else {
            // Create new record
            const { data, error } = await supabaseAdmin
                .from(USAGE_TABLE)
                .insert({
                    userId,
                    date: today,
                    message_count: 1,
                    tokens_used: tokensUsed
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating usage record: ${error.message}`);
            }
            return data;
        }
    }

    /**
     * Clear all chat messages for a user
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    static async clearMessages(userId) {
        const { error } = await supabaseAdmin
            .from(MESSAGES_TABLE)
            .delete()
            .eq('userId', userId);

        if (error) {
            throw new Error(`Error clearing messages: ${error.message}`);
        }
    }

    /**
     * Get usage statistics for a user
     * @param {string} userId - User ID
     * @param {number} days - Number of days to look back
     * @returns {Promise<Array>} Usage statistics
     */
    static async getUsageStats(userId, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        const { data, error } = await supabaseAdmin
            .from(USAGE_TABLE)
            .select('*')
            .eq('userId', userId)
            .gte('date', startDateStr)
            .order('date', { ascending: true });

        if (error) {
            throw new Error(`Error fetching usage stats: ${error.message}`);
        }

        return data || [];
    }
}

module.exports = AIChat;
