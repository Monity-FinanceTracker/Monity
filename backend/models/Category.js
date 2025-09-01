const { supabaseAdmin } = require('../config');
const { decryptObject, encryptObject } = require('../middleware/encryption');

const TABLE_NAME = 'categories';

class Category {

    static async create(categoryData) {
        // Ensure metadata is included and properly formatted
        const categoryWithMetadata = {
            ...categoryData,
            metadata: categoryData.metadata || {}
        };
        
        const encryptedData = encryptObject(TABLE_NAME, categoryWithMetadata);

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .insert([encryptedData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating category: ${error.message}`);
        }

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
            throw new Error(`Error fetching category: ${error.message}`);
        }

        return decryptObject(TABLE_NAME, data);
    }

    static async findByUser(userId) {
        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('*')
            .eq('userId', userId)
            .order('name', { ascending: true });

        if (error) {
            throw new Error(`Error fetching categories for user: ${error.message}`);
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
            throw new Error(`Error updating category: ${error.message}`);
        }
        
        return decryptObject(TABLE_NAME, data);
    }

    static async delete(id, userId) {
        const { error } = await supabaseAdmin
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .eq('userId', userId);

        if (error) {
            throw new Error(`Error deleting category: ${error.message}`);
        }

        return { success: true };
    }
}

module.exports = Category;
