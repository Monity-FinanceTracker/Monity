const { decryptObject, encryptObject } = require('../middleware/encryption');
const { supabaseAdmin } = require('../config');

const TABLE_NAME = 'scheduled_transactions';

class ScheduledTransaction {
    static async create(scheduledTransactionData) {
        const encryptedData = encryptObject(TABLE_NAME, {
            ...scheduledTransactionData,
            createdAt: new Date().toISOString()
        });

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .insert([encryptedData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating scheduled transaction: ${error.message}`);
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
            throw new Error(`Error fetching scheduled transaction: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    static async getAll(userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('userId', userId)
            .eq('is_active', true)
            .order('next_execution_date', { ascending: true });

        if (error) {
            throw new Error(`Error fetching scheduled transactions for user: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    static async getAllDueTransactions(currentDate = new Date()) {
        const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('is_active', true)
            .lte('next_execution_date', dateStr);

        if (error) {
            throw new Error(`Error fetching due scheduled transactions: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    static async getByDateRange(userId, startDate, endDate) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('userId', userId)
            .eq('is_active', true)
            .gte('next_execution_date', startDate)
            .lte('next_execution_date', endDate)
            .order('next_execution_date', { ascending: true });

        if (error) {
            throw new Error(`Error fetching scheduled transactions by date range: ${error.message}`);
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
            throw new Error(`Error updating scheduled transaction: ${error.message}`);
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
            throw new Error(`Error deleting scheduled transaction: ${error.message}`);
        }

        return data;
    }

    static async deactivate(id, userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .update({ is_active: false })
            .eq('id', id)
            .eq('userId', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Error deactivating scheduled transaction: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }
}

module.exports = ScheduledTransaction;
