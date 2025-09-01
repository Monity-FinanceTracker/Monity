/**
 * Cleanup Old Encrypted Data Script
 * 
 * Identifies and optionally deletes records with old encryption that can't be decrypted
 * 
 * Usage:
 *   node migrations/cleanup-old-encrypted.js --dry-run    # Preview what would be deleted
 *   node migrations/cleanup-old-encrypted.js --delete     # Actually delete the records
 */

const { supabaseAdmin } = require('../config/supabase');
const { decrypt } = require('../middleware/encryption');

// Same encrypted fields as the migration
const ENCRYPTED_DATA_MAP = {
    transactions: ['description'],
    categories: ['name'], 
    savings_goals: ['goal_name'],
    groups: ['name'],
    group_expenses: ['description'],
    recurring_transactions: ['description'],
};

class OldEncryptedDataCleanup {
    constructor(options = {}) {
        this.options = {
            dryRun: options.dryRun || false,
            deleteRecords: options.deleteRecords || false
        };
        this.stats = {
            totalFound: 0,
            totalDeleted: 0,
            errors: [],
            records: []
        };
    }

    async run() {
        console.log('🔍 Scanning for old encrypted data that cannot be decrypted...\n');
        
        if (this.options.dryRun) {
            console.log('🔍 DRY RUN MODE - No records will be deleted\n');
        } else if (this.options.deleteRecords) {
            console.log('⚠️  DELETE MODE - Records will be permanently removed!\n');
        } else {
            console.log('📋 ANALYSIS MODE - Only identifying problematic records\n');
        }

        for (const [tableName, fields] of Object.entries(ENCRYPTED_DATA_MAP)) {
            await this.processTable(tableName, fields);
        }

        this.printSummary();
        
        if (this.stats.totalFound > 0 && !this.options.deleteRecords && !this.options.dryRun) {
            console.log('\n💡 To delete these records, run:');
            console.log('   node migrations/cleanup-old-encrypted.js --delete');
            console.log('\n💡 To preview deletions first, run:');
            console.log('   node migrations/cleanup-old-encrypted.js --dry-run');
        }
    }

    async processTable(tableName, encryptedFields) {
        try {
            console.log(`📋 Checking table: ${tableName}`);
            
            const { data: records, error } = await supabaseAdmin
                .from(tableName)
                .select('*');

            if (error) {
                console.log(`❌ Error fetching ${tableName}: ${error.message}`);
                return;
            }

            if (!records || records.length === 0) {
                console.log(`   ℹ️  No records in ${tableName}`);
                return;
            }

            const problematicRecords = [];

            for (const record of records) {
                for (const field of encryptedFields) {
                    if (record[field]) {
                        const isProblematic = this.isOldEncryptedData(record[field]);
                        if (isProblematic) {
                            problematicRecords.push({
                                id: record.id,
                                field: field,
                                value: record[field],
                                preview: this.getPreview(record)
                            });
                        }
                    }
                }
            }

            if (problematicRecords.length > 0) {
                console.log(`   🚨 Found ${problematicRecords.length} problematic records:`);
                
                for (const rec of problematicRecords) {
                    console.log(`      - ID: ${rec.id}`);
                    console.log(`        Field: ${rec.field}`);
                    console.log(`        Preview: ${rec.preview}`);
                    console.log(`        Encrypted data: ${rec.value.substring(0, 50)}...`);
                    
                    this.stats.records.push({
                        table: tableName,
                        ...rec
                    });
                    
                    if (this.options.deleteRecords && !this.options.dryRun) {
                        await this.deleteRecord(tableName, rec.id);
                    } else if (this.options.dryRun) {
                        console.log(`        [DRY RUN] Would delete this record`);
                    }
                    console.log('');
                }
                
                this.stats.totalFound += problematicRecords.length;
            } else {
                console.log(`   ✅ No problematic records found`);
            }

        } catch (error) {
            console.log(`❌ Error processing ${tableName}: ${error.message}`);
            this.stats.errors.push(`${tableName}: ${error.message}`);
        }
        
        console.log('');
    }

    isOldEncryptedData(value) {
        if (!value || typeof value !== 'string') return false;
        
        // Check if it looks like encrypted data
        const parts = value.split(':');
        if (parts.length !== 3) return false;
        if (!parts.every(part => /^[0-9a-fA-F]+$/.test(part))) return false;
        
        // Try to decrypt it
        try {
            const decrypted = decrypt(value);
            // If decrypt returns the same value, it failed to decrypt
            return decrypted === value;
        } catch (error) {
            return true; // Failed to decrypt, so it's problematic
        }
    }

    getPreview(record) {
        // Generate a helpful preview of the record
        if (record.description) return `Description: "${record.description.substring(0, 30)}..."`;
        if (record.name) return `Name: "${record.name.substring(0, 30)}..."`;
        if (record.goal_name) return `Goal: "${record.goal_name.substring(0, 30)}..."`;
        if (record.amount) return `Amount: $${record.amount}`;
        if (record.date) return `Date: ${record.date}`;
        return `ID: ${record.id}`;
    }

    async deleteRecord(tableName, recordId) {
        try {
            const { error } = await supabaseAdmin
                .from(tableName)
                .delete()
                .eq('id', recordId);

            if (error) {
                console.log(`        ❌ Failed to delete: ${error.message}`);
                this.stats.errors.push(`${tableName}[${recordId}]: ${error.message}`);
            } else {
                console.log(`        ✅ Deleted successfully`);
                this.stats.totalDeleted++;
            }
        } catch (error) {
            console.log(`        ❌ Error deleting: ${error.message}`);
            this.stats.errors.push(`${tableName}[${recordId}]: ${error.message}`);
        }
    }

    printSummary() {
        console.log('='.repeat(60));
        console.log('📊 CLEANUP SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total problematic records found: ${this.stats.totalFound}`);
        
        if (this.options.deleteRecords && !this.options.dryRun) {
            console.log(`✅ Successfully deleted: ${this.stats.totalDeleted}`);
            console.log(`❌ Failed to delete: ${this.stats.errors.length}`);
        }
        
        if (this.stats.totalFound > 0) {
            console.log('\n📋 Breakdown by table:');
            const tableStats = {};
            this.stats.records.forEach(rec => {
                tableStats[rec.table] = (tableStats[rec.table] || 0) + 1;
            });
            
            for (const [table, count] of Object.entries(tableStats)) {
                console.log(`   ${table}: ${count} records`);
            }
        }
        
        if (this.stats.errors.length > 0) {
            console.log(`\n🚨 ERRORS (${this.stats.errors.length}):`);
            this.stats.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        console.log('='.repeat(60));
        
        if (this.stats.totalFound === 0) {
            console.log('🎉 No problematic encrypted records found!');
        } else if (this.options.deleteRecords && !this.options.dryRun) {
            console.log('🎉 Cleanup completed!');
            console.log('💡 Run the migration again to see the improvement.');
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    const options = {
        dryRun: args.includes('--dry-run'),
        deleteRecords: args.includes('--delete')
    };

    // Safety check
    if (options.deleteRecords && !options.dryRun) {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const confirmed = await new Promise((resolve) => {
            readline.question('⚠️  WARNING: This will permanently delete records with old encryption!\nAre you sure? (yes/no): ', (answer) => {
                readline.close();
                resolve(answer.toLowerCase() === 'yes');
            });
        });

        if (!confirmed) {
            console.log('Operation cancelled.');
            return;
        }
    }

    try {
        const cleanup = new OldEncryptedDataCleanup(options);
        await cleanup.run();
    } catch (error) {
        console.error('Cleanup failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = OldEncryptedDataCleanup;
