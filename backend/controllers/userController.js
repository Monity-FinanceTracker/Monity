const { logger } = require('../utils/logger');
const { supabase } = require('../config/supabase');

class UserController {
    constructor(supabase) {
        this.supabase = supabase;
    }

    async searchUsers(req, res) {
        const { q: query } = req.query;
        const userId = req.user.id;

        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters long' });
        }

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('id, name, email')
                .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
                .neq('id', userId) // Don't include the current user
                .limit(10);

            if (error) {
                throw new Error(`Error searching users: ${error.message}`);
            }

            res.json(data || []);
        } catch (error) {
            logger.error('Failed to search users', { userId, query, error: error.message });
            res.status(500).json({ error: 'Failed to search users' });
        }
    }
}

module.exports = UserController;
