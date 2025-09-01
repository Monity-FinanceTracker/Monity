/**
 * Migration Runner Script
 * 
 * Safely runs the re-encryption migration with backup
 * 
 * Usage:
 *   node migrations/run-migration.js --dry-run    # Preview changes
 *   node migrations/run-migration.js              # Run migration
 *   node migrations/run-migration.js --backup     # Backup + migration
 */

const DatabaseBackup = require('./backup-database');
const DataMigration = require('./re-encrypt-data');

class MigrationRunner {
    constructor(options = {}) {
        this.options = {
            dryRun: options.dryRun || false,
            createBackup: options.createBackup || false,
            skipConfirmation: options.skipConfirmation || false
        };
    }

    async run() {
        console.log('🚀 Monity Data Re-encryption Migration');
        console.log('=====================================\n');
        
        // Show current settings
        console.log('⚙️  Migration Settings:');
        console.log(`   Dry Run: ${this.options.dryRun ? 'YES' : 'NO'}`);
        console.log(`   Create Backup: ${this.options.createBackup ? 'YES' : 'NO'}`);
        console.log(`   Encryption Key: ${process.env.ENCRYPTION_KEY ? '✅ Set' : '❌ Missing'}`);
        console.log('');

        // Validate environment
        if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
            throw new Error('❌ ENCRYPTION_KEY must be a 64-character hex string');
        }

        // Get user confirmation (unless skipping)
        if (!this.options.skipConfirmation && !this.options.dryRun) {
            const confirmed = await this.getConfirmation();
            if (!confirmed) {
                console.log('Migration cancelled by user.');
                return;
            }
        }

        try {
            // Step 1: Create backup if requested
            if (this.options.createBackup) {
                console.log('📋 Step 1: Creating database backup...');
                const backup = new DatabaseBackup();
                const backupFile = await backup.run();
                console.log(`✅ Backup completed: ${backupFile}\n`);
            }

            // Step 2: Run migration
            console.log(`📋 Step ${this.options.createBackup ? '2' : '1'}: Running re-encryption migration...`);
            const migration = new DataMigration();
            
            if (this.options.dryRun) {
                // Override update method for dry run
                migration.updateRecord = async (tableName, recordId, updates) => {
                    console.log(`[DRY RUN] Would update ${tableName}[${recordId}]`);
                };
            }
            
            await migration.run();

            console.log('\n🎉 Migration completed successfully!');

        } catch (error) {
            console.error('\n💥 Migration failed:', error.message);
            
            if (this.options.createBackup) {
                console.log('\n💡 Your data has been backed up. You can restore it if needed.');
            }
            
            throw error;
        }
    }

    async getConfirmation() {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            const message = `
⚠️  WARNING: This will modify encrypted data in your database!

This migration will:
1. Scan all encrypted fields in your database
2. Attempt to decrypt them with the current encryption key
3. Re-encrypt any successfully decrypted data
4. Update the records in your database

${this.options.createBackup ? '✅ A backup will be created before migration.' : '❌ No backup will be created.'}

Are you sure you want to continue? (yes/no): `;

            readline.question(message, (answer) => {
                readline.close();
                resolve(answer.toLowerCase() === 'yes');
            });
        });
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    const options = {
        dryRun: args.includes('--dry-run'),
        createBackup: args.includes('--backup'),
        skipConfirmation: args.includes('--yes')
    };

    // If dry run, don't create backup
    if (options.dryRun) {
        options.createBackup = false;
    }

    try {
        const runner = new MigrationRunner(options);
        await runner.run();
    } catch (error) {
        console.error('Migration runner failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = MigrationRunner;
