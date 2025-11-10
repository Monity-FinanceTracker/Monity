const { supabaseAdmin } = require('../config');

const SIMULATIONS_TABLE = 'investment_simulations';
const USAGE_TABLE = 'investment_calculator_usage';

class InvestmentCalculator {
    /**
     * Get monthly usage for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Usage data for current month
     */
    static async getMonthlyUsage(userId) {
        // Get first day of current month (YYYY-MM-01)
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];

        const { data, error } = await supabaseAdmin
            .from(USAGE_TABLE)
            .select('*')
            .eq('userId', userId)
            .eq('month', currentMonth)
            .single();

        if (error) {
            // If no record exists for current month, return default values
            if (error.code === 'PGRST116') {
                return {
                    userId,
                    month: currentMonth,
                    simulation_count: 0
                };
            }
            throw new Error(`Error fetching usage: ${error.message}`);
        }

        return data;
    }

    /**
     * Increment usage count for current month
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Updated usage data
     */
    static async incrementUsage(userId) {
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];

        // Try to get existing record
        const { data: existing } = await supabaseAdmin
            .from(USAGE_TABLE)
            .select('*')
            .eq('userId', userId)
            .eq('month', currentMonth)
            .single();

        if (existing) {
            // Update existing record
            const { data, error } = await supabaseAdmin
                .from(USAGE_TABLE)
                .update({
                    simulation_count: existing.simulation_count + 1
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
                    month: currentMonth,
                    simulation_count: 1
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
     * Save a simulation
     * @param {string} userId - User ID
     * @param {Object} simulationData - Simulation parameters and results
     * @returns {Promise<Object>} Created simulation record
     */
    static async saveSimulation(userId, simulationData) {
        const {
            initialInvestment,
            contributionAmount,
            contributionFrequency,
            annualInterestRate,
            goalDate,
            finalValue,
            totalContributions,
            totalInterest,
            roiPercentage,
            metadata = {}
        } = simulationData;

        const insertData = {
            userId,
            initial_investment: initialInvestment,
            contribution_amount: contributionAmount,
            contribution_frequency: contributionFrequency,
            annual_interest_rate: annualInterestRate,
            goal_date: goalDate,
            final_value: finalValue,
            total_contributions: totalContributions,
            total_interest: totalInterest,
            roi_percentage: roiPercentage,
            metadata
        };

        const { data, error } = await supabaseAdmin
            .from(SIMULATIONS_TABLE)
            .insert([insertData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error saving simulation: ${error.message}`);
        }

        return data;
    }

    /**
     * Get user's saved simulations
     * @param {string} userId - User ID
     * @param {number} limit - Number of simulations to retrieve
     * @returns {Promise<Array>} Array of simulation records
     */
    static async getUserSimulations(userId, limit = 10) {
        const { data, error } = await supabaseAdmin
            .from(SIMULATIONS_TABLE)
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(`Error fetching simulations: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Delete a simulation
     * @param {string} simulationId - Simulation ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<void>}
     */
    static async deleteSimulation(simulationId, userId) {
        const { error } = await supabaseAdmin
            .from(SIMULATIONS_TABLE)
            .delete()
            .eq('id', simulationId)
            .eq('userId', userId);

        if (error) {
            throw new Error(`Error deleting simulation: ${error.message}`);
        }
    }

    /**
     * Get usage statistics for a user
     * @param {string} userId - User ID
     * @param {number} months - Number of months to look back
     * @returns {Promise<Array>} Usage statistics
     */
    static async getUsageStats(userId, months = 6) {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
        const startMonth = startDate.toISOString().split('T')[0];

        const { data, error } = await supabaseAdmin
            .from(USAGE_TABLE)
            .select('*')
            .eq('userId', userId)
            .gte('month', startMonth)
            .order('month', { ascending: true });

        if (error) {
            throw new Error(`Error fetching usage stats: ${error.message}`);
        }

        return data || [];
    }
}

module.exports = InvestmentCalculator;






