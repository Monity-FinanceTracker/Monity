const { decryptObject, encryptObject } = require('../middleware/encryption');
const { supabaseAdmin } = require('../config');

const TABLE_NAME = 'transactions';

class Transaction {
    static async create(transactionData) {
        const encryptedData = encryptObject(TABLE_NAME, {
            ...transactionData,
            createdAt: new Date().toISOString()
        });

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .insert([encryptedData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating transaction: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    static async getById(id, userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('userId', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error fetching transaction: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    static async getAll(userId, options = {}) {
        const { limit = null, offset = 0 } = options;

        let query = supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('userId', userId)
            .order('date', { ascending: false });

        // Apply limit and offset if provided
        if (limit !== null) {
            query = query.range(offset, offset + limit - 1);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Error fetching transactions for user: ${error.message}`);
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

        if (error) {
            throw new Error(`Error updating transaction: ${error.message}`);
        }
        
        return decryptObject(TABLE_NAME, data);
    }

    static async delete(id, userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .eq('userId', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Error deleting transaction: ${error.message}`);
        }

        return data;
    }
}

module.exports = Transaction;
