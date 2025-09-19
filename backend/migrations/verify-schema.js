/**
 * Schema Verification Script
 * 
 * Verifies that the migration targets the correct tables and fields
 * based on your current database schema and encryption middleware settings
 * 
 * Usage: node migrations/verify-schema.js
 */

const { supabaseAdmin } = require('../config/supabase');

// Import the encryption middleware to check which fields are encrypted
const SENSITIVE_FIELDS = {
    transactions: ['description'],
    categories: ['name'],
    savings_goals: ['goal_name'],
    groups: ['name'],
    // Add based on actual encryption middleware configuration
};

class SchemaVerifier {
    async run() {
        console.log('🔍 Verifying database schema for migration...\n');
        
        // Check each table and its encrypted fields
        for (const [tableName, fields] of Object.entries(SENSITIVE_FIELDS)) {
            await this.verifyTable(tableName, fields);
        }
        
        // Sample some data to see encryption patterns
        await this.sampleEncryptedData();
        
        console.log('\n[SUCCESS] Schema verification completed!');
    }

    async verifyTable(tableName, encryptedFields) {
        console.log(`[INFO] Checking table: ${tableName}`);
        
        try {
            // Check if table exists and get sample data
            const { data, error, count } = await supabaseAdmin
                .from(tableName)
                .select('*', { count: 'exact' })
                .limit(3);

            if (error) {
                console.log(`   [ERROR] Error accessing ${tableName}: ${error.message}`);
                return;
            }

            console.log(`   [SUCCESS] Table exists with ${count} records`);
            
            // Check if encrypted fields exist in the schema
            if (data && data.length > 0) {
                const sampleRecord = data[0];
                
                for (const field of encryptedFields) {
                    if (field in sampleRecord) {
                        const value = sampleRecord[field];
                        const encryptionStatus = this.analyzeEncryption(value);
                        console.log(`   [FIELD] Field '${field}': ${encryptionStatus}`);
                    } else {
                        console.log(`   [WARNING] Field '${field}' not found in ${tableName}`);
                    }
                }
            } else {
                console.log(`   [INFO] No data in ${tableName} to analyze`);
            }

        } catch (error) {
            console.log(`   [ERROR] Unexpected error with ${tableName}: ${error.message}`);
        }
        
        console.log('');
    }

    analyzeEncryption(value) {
        if (!value || typeof value !== 'string') {
            return 'Empty or non-string';
        }

        // Check if it looks like encrypted data (format: iv:authTag:encrypted)
        const parts = value.split(':');
        if (parts.length === 3 && parts.every(part => /^[0-9a-fA-F]+$/.test(part))) {
            return `[ENCRYPTED] Likely encrypted (${value.length} chars)`;
        }
        
        return `[PLAIN] Plain text: "${value.substring(0, 30)}${value.length > 30 ? '...' : ''}"`;
    }

    async sampleEncryptedData() {
        console.log('🔍 Sampling data to understand encryption patterns...\n');
        
        // Look for patterns in transaction descriptions (most likely to have varied data)
        try {
            const { data: transactions } = await supabaseAdmin
                .from('transactions')
                .select('id, description, amount, date')
                .limit(5);

            if (transactions && transactions.length > 0) {
                console.log('📊 Sample transaction descriptions:');
                transactions.forEach((t, i) => {
                    const analysis = this.analyzeEncryption(t.description);
                    console.log(`   ${i + 1}. ${analysis}`);
                });
            }

            // Check categories too
            const { data: categories } = await supabaseAdmin
                .from('categories')
                .select('id, name')
                .limit(5);

            if (categories && categories.length > 0) {
                console.log('\n📊 Sample category names:');
                categories.forEach((c, i) => {
                    const analysis = this.analyzeEncryption(c.name);
                    console.log(`   ${i + 1}. ${analysis}`);
                });
            }

        } catch (error) {
            console.log('[ERROR] Error sampling data:', error.message);
        }
    }
}

async function main() {
    try {
        console.log('Database Schema Verification');
        console.log('============================');
        console.log(`Encryption key configured: ${process.env.ENCRYPTION_KEY ? '[YES]' : '[NO]'}`);
        console.log(`Key length: ${process.env.ENCRYPTION_KEY?.length || 0} characters\n`);
        
        const verifier = new SchemaVerifier();
        await verifier.run();
        
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = SchemaVerifier;
