const { supabaseAdmin } = require('../config/supabase');
const { decryptObject, encryptObject } = require('../middleware/encryption');

const TABLE_NAME = 'savings_goals';

class SavingsGoal {
    constructor(supabase) {
        this.supabase = supabase; // Keep for backward compatibility, but use admin client
    }

    async create(goalData) {
        const encryptedData = encryptObject(TABLE_NAME, goalData);

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .insert([encryptedData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating savings goal: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    async findById(id, userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error fetching savings goal: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    async findByUser(userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .order('target_date', { ascending: true });

        if (error) {
            throw new Error(`Error fetching savings goals for user: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    async update(id, userId, updates) {
        const encryptedUpdates = encryptObject(TABLE_NAME, updates);

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .update(encryptedUpdates)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating savings goal: ${error.message}`);
        }
        
        return decryptObject(TABLE_NAME, data);
    }

    async delete(id, userId) {
        const { error } = await supabaseAdmin
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Error deleting savings goal: ${error.message}`);
        }

        return { success: true };
    }

    async allocate(id, userId, amount) {
        const { data, error } = await supabaseAdmin.rpc('allocate_to_goal', {
            goal_id: id,
            user_id_input: userId,
            amount_to_allocate: amount
        });

        if (error) {
            throw new Error(`Error allocating to savings goal: ${error.message}`);
        }

        return data;
    }
}

module.exports = SavingsGoal;
