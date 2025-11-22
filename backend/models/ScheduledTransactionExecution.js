const { decryptObject, encryptObject } = require('../middleware/encryption');
const { supabaseAdmin } = require('../config');

const TABLE_NAME = 'scheduled_transaction_executions';

class ScheduledTransactionExecution {
    /**
     * Record a new execution of a scheduled transaction
     * @param {Object} executionData - Execution record data
     * @param {string} executionData.scheduled_transaction_id - ID of the scheduled transaction
     * @param {string} executionData.execution_date - Date of execution (YYYY-MM-DD)
     * @param {string} executionData.transaction_id - ID of the created transaction
     * @returns {Promise<Object>} The created execution record
     */
    static async create(executionData) {
        const encryptedData = encryptObject(TABLE_NAME, {
            ...executionData,
            createdAt: new Date().toISOString()
        });

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .insert([encryptedData])
            .select()
            .single();

        if (error) {
            // If it's a unique constraint violation, it means this execution already exists
            if (error.code === '23505') {
                throw new Error('DUPLICATE_EXECUTION');
            }
            throw new Error(`Error creating scheduled transaction execution: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    /**
     * Check if an execution already exists for a scheduled transaction on a specific date
     * @param {string} scheduledTransactionId - ID of the scheduled transaction
     * @param {string} executionDate - Date to check (YYYY-MM-DD)
     * @returns {Promise<Object|null>} The execution record if it exists, null otherwise
     */
    static async getByScheduledTransactionAndDate(scheduledTransactionId, executionDate) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('scheduled_transaction_id', scheduledTransactionId)
            .eq('execution_date', executionDate)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Error fetching scheduled transaction execution: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    /**
     * Get all executions for a scheduled transaction
     * @param {string} scheduledTransactionId - ID of the scheduled transaction
     * @returns {Promise<Array>} Array of execution records
     */
    static async getByScheduledTransaction(scheduledTransactionId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('scheduled_transaction_id', scheduledTransactionId)
            .order('execution_date', { ascending: false });

        if (error) {
            throw new Error(`Error fetching scheduled transaction executions: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    /**
     * Get executions within a date range
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Promise<Array>} Array of execution records
     */
    static async getByDateRange(startDate, endDate) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .gte('execution_date', startDate)
            .lte('execution_date', endDate)
            .order('execution_date', { ascending: false });

        if (error) {
            throw new Error(`Error fetching scheduled transaction executions by date range: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    /**
     * Delete an execution record
     * @param {string} id - ID of the execution record
     * @returns {Promise<Object>} The deleted execution record
     */
    static async delete(id) {
        const { data, error} = await supabaseAdmin
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error deleting scheduled transaction execution: ${error.message}`);
        }

        return data;
    }
}

module.exports = ScheduledTransactionExecution;
