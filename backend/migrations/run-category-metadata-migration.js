// Load environment variables from parent directory
require('dotenv').config({ path: '../.env' });

const { supabaseAdmin } = require('../config/supabase');
const { logger } = require('../utils/logger');

/**
 * Migration script to add metadata support to categories
 * This script is safe to run multiple times
 */
async function runCategoryMetadataMigration() {
    try {
        logger.info('Starting category metadata migration...');

        // 1. Check if metadata column exists and add if needed
        logger.info('Checking if metadata column exists...');
        
        // Test if metadata column exists by trying to select it
        const { error: testError } = await supabaseAdmin
            .from('categories')
            .select('metadata')
            .limit(1);

        if (testError && testError.message.includes('column "metadata" does not exist')) {
            logger.info('Metadata column does not exist. Please run the SQL migration manually:');
            logger.info('ALTER TABLE categories ADD COLUMN metadata JSONB DEFAULT \'{}\';');
            logger.info('CREATE INDEX idx_categories_metadata ON categories USING GIN (metadata);');
            throw new Error('Metadata column needs to be added. Please run the SQL commands above in your Supabase SQL editor.');
        } else if (testError) {
            throw new Error(`Database error: ${testError.message}`);
        } else {
            logger.info('Metadata column already exists, continuing...');
        }

        // 2. Update existing default categories with metadata
        logger.info('Updating existing investment categories with metadata...');
        
        // Update "Make Investments" categories
        const { error: updateMakeError } = await supabaseAdmin
            .from('categories')
            .update({
                metadata: {
                    savings_behavior: 'investment',
                    description: 'Moving money from savings to investments',
                    is_system_category: true,
                    migrated: true
                }
            })
            .eq('name', 'Make Investments')
            .eq('typeId', 3);

        if (updateMakeError) {
            logger.warn('Failed to update Make Investments categories:', updateMakeError.message);
        }

        // Update "Withdraw Investments" categories
        const { error: updateWithdrawError } = await supabaseAdmin
            .from('categories')
            .update({
                metadata: {
                    savings_behavior: 'divestment',
                    description: 'Moving money from investments back to savings',
                    is_system_category: true,
                    migrated: true
                }
            })
            .eq('name', 'Withdraw Investments')
            .eq('typeId', 3);

        if (updateWithdrawError) {
            logger.warn('Failed to update Withdraw Investments categories:', updateWithdrawError.message);
        }

        // 3. Set default metadata for other categories
        logger.info('Setting default metadata for existing categories...');
        
        const { error: defaultMetadataError } = await supabaseAdmin
            .from('categories')
            .update({
                metadata: {}
            })
            .is('metadata', null);

        if (defaultMetadataError) {
            logger.warn('Failed to set default metadata:', defaultMetadataError.message);
        }

        logger.info('Category metadata migration completed successfully!');
        
        // 4. Verify migration
        const { data: sampleCategories, error: verifyError } = await supabaseAdmin
            .from('categories')
            .select('id, name, metadata')
            .limit(5);

        if (verifyError) {
            logger.warn('Failed to verify migration:', verifyError.message);
        } else {
            logger.info('Sample categories after migration:', sampleCategories);
        }

        return {
            success: true,
            message: 'Migration completed successfully'
        };

    } catch (error) {
        logger.error('Category metadata migration failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    runCategoryMetadataMigration()
        .then((result) => {
            if (result.success) {
                console.log('✅ Migration successful:', result.message);
                process.exit(0);
            } else {
                console.error('❌ Migration failed:', result.error);
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('❌ Migration crashed:', error.message);
            process.exit(1);
        });
}

module.exports = { runCategoryMetadataMigration };
