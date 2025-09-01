/**
 * Database Backup Script
 * 
 * Creates a backup of encrypted data before running migration
 * Run this BEFORE running the re-encryption migration!
 * 
 * Usage: node migrations/backup-database.js
 */

const { supabaseAdmin } = require('../config/supabase');
const fs = require('fs').promises;
const path = require('path');

// Tables that contain encrypted data (based on your schema)
const TABLES_TO_BACKUP = [
    'transactions',
    'categories', 
    'savings_goals',
    'groups',
    'group_expenses',
    'recurring_transactions',
    // Add other critical tables as needed
    'profiles', // Contains user data
    'budgets',  // Contains budget names/data
];

class DatabaseBackup {
    constructor() {
        this.backupDir = path.join(__dirname, 'backups');
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    }

    async run() {
        console.log('💾 Starting database backup...');
        
        // Create backup directory
        await this.ensureBackupDir();
        
        const backupData = {
            timestamp: new Date().toISOString(),
            encryption_key_hash: this.hashEncryptionKey(),
            tables: {}
        };

        for (const tableName of TABLES_TO_BACKUP) {
            console.log(`📋 Backing up table: ${tableName}`);
            
            try {
                const { data, error } = await supabaseAdmin
                    .from(tableName)
                    .select('*');

                if (error) {
                    console.log(`❌ Error backing up ${tableName}:`, error.message);
                    continue;
                }

                backupData.tables[tableName] = data || [];
                console.log(`✅ Backed up ${data?.length || 0} records from ${tableName}`);

            } catch (error) {
                console.log(`❌ Unexpected error backing up ${tableName}:`, error.message);
            }
        }

        // Save backup to file
        const backupFile = path.join(this.backupDir, `backup-${this.timestamp}.json`);
        await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
        
        console.log(`\n✅ Backup completed successfully!`);
        console.log(`📁 Backup saved to: ${backupFile}`);
        console.log(`📊 Total tables backed up: ${Object.keys(backupData.tables).length}`);
        
        // Create a human-readable summary
        await this.createSummary(backupData);
        
        return backupFile;
    }

    async ensureBackupDir() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
        } catch (error) {
            // Directory might already exist, that's ok
        }
    }

    hashEncryptionKey() {
        const crypto = require('crypto');
        return crypto.createHash('sha256')
            .update(process.env.ENCRYPTION_KEY || '')
            .digest('hex')
            .substring(0, 16); // First 16 chars for identification
    }

    async createSummary(backupData) {
        const summaryFile = path.join(this.backupDir, `summary-${this.timestamp}.txt`);
        
        let summary = `Database Backup Summary\n`;
        summary += `========================\n`;
        summary += `Timestamp: ${backupData.timestamp}\n`;
        summary += `Encryption Key Hash: ${backupData.encryption_key_hash}\n\n`;
        
        summary += `Tables Backed Up:\n`;
        for (const [tableName, records] of Object.entries(backupData.tables)) {
            summary += `  - ${tableName}: ${records.length} records\n`;
        }
        
        summary += `\nTotal Records: ${Object.values(backupData.tables).reduce((sum, records) => sum + records.length, 0)}\n`;
        
        await fs.writeFile(summaryFile, summary);
        console.log(`📄 Summary saved to: ${summaryFile}`);
    }
}

async function main() {
    try {
        const backup = new DatabaseBackup();
        await backup.run();
    } catch (error) {
        console.error('💥 Backup failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = DatabaseBackup;
