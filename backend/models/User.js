const { decryptObject, encryptObject } = require('../middleware/encryption');

const { supabaseAdmin } = require('../config');

const TABLE_NAME = 'profiles';

class User {
    static async getById(id) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('id, name, email, subscription_tier')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error fetching user: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    static async update(id, updates) {
        const encryptedUpdates = encryptObject(TABLE_NAME, updates);

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .update(encryptedUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }
    
    static async createDefaultCategories(userId) {
        const defaultCategories = [
            { 
                name: 'Make Investments', 
                typeId: 3, 
                userId: userId,
                metadata: { 
                    savings_behavior: 'investment',
                    description: 'Moving money from savings to investments',
                    is_system_category: true
                }
            },
            { 
                name: 'Withdraw Investments', 
                typeId: 3, 
                userId: userId,
                metadata: { 
                    savings_behavior: 'divestment',
                    description: 'Moving money from investments back to savings',
                    is_system_category: true
                }
            }
        ];

        const { error } = await supabaseAdmin
            .from('categories')
            .insert(defaultCategories);

        if (error) {
            // Log the error but don't re-throw, as this is not a critical failure
            console.error('Failed to create default categories for user:', userId, error.message);
        }
    }
}

module.exports = User;
