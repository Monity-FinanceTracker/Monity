const { supabaseAdmin } = require('../config');
const { decryptObject, encryptObject } = require('../middleware/encryption');

const TABLE_NAME = 'budgets';

class Budget {
    static async create(budgetData) {
        const encryptedData = encryptObject(TABLE_NAME, budgetData);
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .insert([encryptedData])
            .select()
            .single();
        if (error) throw new Error(`Error creating budget: ${error.message}`);
        return decryptObject(TABLE_NAME, data);
    }

    static async findByUserId(userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('userId', userId);
        if (error) throw new Error(`Error fetching budgets: ${error.message}`);
        return decryptObject(TABLE_NAME, data);
    }

    static async findById(id, userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('userId', userId)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error fetching budget: ${error.message}`);
        }
        return decryptObject(TABLE_NAME, data);
    }

    static async update(id, userId, updates) {
        const encryptedUpdates = encryptObject(TABLE_NAME, updates);
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .update(encryptedUpdates)
            .eq('id', id)
            .eq('userId', userId)
            .select()
            .single();
        if (error) throw new Error(`Error updating budget: ${error.message}`);
        return decryptObject(TABLE_NAME, data);
    }

    static async delete(id, userId) {
        const { error } = await supabaseAdmin
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .eq('userId', userId);
        if (error) throw new Error(`Error deleting budget: ${error.message}`);
        return { success: true };
    }
}

module.exports = Budget;
