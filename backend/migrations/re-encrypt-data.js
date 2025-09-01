/**
 * Data Migration Script: Re-encrypt existing data with current encryption key
 * 
 * This script will:
 * 1. Find all encrypted data in the database
 * 2. Attempt to decrypt it (some may fail with old keys)
 * 3. Re-encrypt successfully decrypted data with the current key
 * 4. Update records in the database
 * 
 * Run this script with: node migrations/re-encrypt-data.js
 */

const { supabaseAdmin } = require('../config/supabase');
const { encrypt, decrypt, encryptObject, decryptObject } = require('../middleware/encryption');

// Define which tables and fields contain encrypted data
// Based on your actual schema and the SENSITIVE_FIELDS defined in encryption middleware
const ENCRYPTED_DATA_MAP = {
    transactions: ['description'],
    categories: ['name'], 
    savings_goals: ['goal_name'],
    groups: ['name'],
    // Additional tables that might have encrypted data
    group_expenses: ['description'],
    recurring_transactions: ['description'],
    // Add other tables/fields as needed
};

class DataMigration {
    constructor() {
        this.stats = {
            total: 0,
            success: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
    }

    async run() {
        console.log('🚀 Starting data re-encryption migration...');
        console.log('Current encryption key length:', process.env.ENCRYPTION_KEY?.length || 0);
        
        if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
            throw new Error('❌ ENCRYPTION_KEY must be a 64-character hex string');
        }

        for (const [tableName, fields] of Object.entries(ENCRYPTED_DATA_MAP)) {
            console.log(`\n📋 Processing table: ${tableName}`);
            await this.processTable(tableName, fields);
        }

        this.printSummary();
    }

    async processTable(tableName, encryptedFields) {
        try {
            // Fetch all records from the table
            const { data: records, error } = await supabaseAdmin
                .from(tableName)
                .select('*');

            if (error) {
                console.log(`❌ Error fetching ${tableName}:`, error.message);
                this.stats.errors.push(`${tableName}: ${error.message}`);
                return;
            }

            if (!records || records.length === 0) {
                console.log(`ℹ️  No records found in ${tableName}`);
                return;
            }

            console.log(`📊 Found ${records.length} records in ${tableName}`);

            for (const record of records) {
                await this.processRecord(tableName, record, encryptedFields);
            }

        } catch (error) {
            console.log(`❌ Unexpected error processing ${tableName}:`, error.message);
            this.stats.errors.push(`${tableName}: ${error.message}`);
        }
    }

    async processRecord(tableName, record, encryptedFields) {
        this.stats.total++;
        
        try {
            let needsUpdate = false;
            const updates = { ...record };

            // Process each encrypted field
            for (const field of encryptedFields) {
                if (record[field]) {
                    const result = await this.reEncryptField(record[field], field);
                    
                    if (result.success && result.wasReEncrypted) {
                        updates[field] = result.newValue;
                        needsUpdate = true;
                    } else if (!result.success) {
                        console.log(`⚠️  Failed to decrypt ${tableName}.${field} for ID ${record.id}: ${result.error}`);
                    }
                }
            }

            // Update the record if any fields were re-encrypted
            if (needsUpdate) {
                await this.updateRecord(tableName, record.id, updates);
                this.stats.success++;
                console.log(`✅ Updated ${tableName} ID: ${record.id}`);
            } else {
                this.stats.skipped++;
            }

        } catch (error) {
            this.stats.failed++;
            console.log(`❌ Error processing ${tableName} ID ${record.id}:`, error.message);
            this.stats.errors.push(`${tableName}[${record.id}]: ${error.message}`);
        }
    }

    async reEncryptField(encryptedValue, fieldName) {
        try {
            // First, try to decrypt the value
            const decryptedValue = decrypt(encryptedValue);
            
            // If decrypt returned the same value, it means it wasn't encrypted or failed to decrypt
            if (decryptedValue === encryptedValue) {
                // Check if it looks like encrypted data (format: iv:authTag:encrypted)
                if (this.looksLikeEncryptedData(encryptedValue)) {
                    return {
                        success: false,
                        error: 'Failed to decrypt (possibly old key)',
                        wasReEncrypted: false
                    };
                } else {
                    // It's plain text, encrypt it
                    const newEncryptedValue = encrypt(encryptedValue);
                    return {
                        success: true,
                        newValue: newEncryptedValue,
                        wasReEncrypted: true
                    };
                }
            }

            // Successfully decrypted, now re-encrypt with current key
            const reEncryptedValue = encrypt(decryptedValue);
            
            // Only update if the encrypted value changed
            if (reEncryptedValue !== encryptedValue) {
                return {
                    success: true,
                    newValue: reEncryptedValue,
                    wasReEncrypted: true
                };
            } else {
                return {
                    success: true,
                    wasReEncrypted: false
                };
            }

        } catch (error) {
            return {
                success: false,
                error: error.message,
                wasReEncrypted: false
            };
        }
    }

    looksLikeEncryptedData(value) {
        if (typeof value !== 'string') return false;
        const parts = value.split(':');
        // Encrypted format: iv:authTag:encrypted (3 parts, each should be hex)
        return parts.length === 3 && parts.every(part => /^[0-9a-fA-F]+$/.test(part));
    }

    async updateRecord(tableName, recordId, updates) {
        const { error } = await supabaseAdmin
            .from(tableName)
            .update(updates)
            .eq('id', recordId);

        if (error) {
            throw new Error(`Failed to update ${tableName}[${recordId}]: ${error.message}`);
        }
    }

    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total records processed: ${this.stats.total}`);
        console.log(`✅ Successfully updated: ${this.stats.success}`);
        console.log(`⏭️  Skipped (no changes): ${this.stats.skipped}`);
        console.log(`❌ Failed: ${this.stats.failed}`);
        
        if (this.stats.errors.length > 0) {
            console.log(`\n🚨 ERRORS (${this.stats.errors.length}):`);
            this.stats.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        console.log('\n' + '='.repeat(50));
        
        if (this.stats.failed > 0) {
            console.log('⚠️  Some records failed to migrate. Check the errors above.');
            console.log('💡 Failed records likely contain data encrypted with a different key.');
            console.log('   You may need to handle these manually or accept data loss.');
        } else {
            console.log('🎉 Migration completed successfully!');
        }
    }
}

// Dry run mode - set to true to see what would be changed without making changes
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    try {
        if (DRY_RUN) {
            console.log('🔍 Running in DRY RUN mode - no changes will be made');
        }
        
        const migration = new DataMigration();
        
        if (DRY_RUN) {
            // Override the update method to not actually update
            migration.updateRecord = async (tableName, recordId, updates) => {
                console.log(`[DRY RUN] Would update ${tableName}[${recordId}]`);
            };
        }
        
        await migration.run();
        
    } catch (error) {
        console.error('💥 Migration failed:', error.message);
        process.exit(1);
    }
}

// Only run if this file is executed directly (not required as module)
if (require.main === module) {
    main();
}

module.exports = DataMigration;
