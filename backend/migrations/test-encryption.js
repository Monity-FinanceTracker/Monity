/**
 * Encryption Test Script
 * 
 * Tests your current encryption/decryption setup to ensure it's working properly
 * before running the migration
 * 
 * Usage: node migrations/test-encryption.js
 */

const { encrypt, decrypt } = require('../middleware/encryption');

class EncryptionTester {
    async run() {
        console.log('🔧 Testing encryption/decryption functionality...\n');
        
        // Test basic encryption/decryption
        await this.testBasicEncryption();
        
        // Test with various data types
        await this.testDataVariations();
        
        // Test decryption of potentially corrupted data
        await this.testCorruptedData();
        
        console.log('\n✅ Encryption testing completed!');
    }

    async testBasicEncryption() {
        console.log('📋 Basic Encryption Test');
        console.log('-'.repeat(25));
        
        const testCases = [
            'Simple transaction description',
            'Transaction with special chars: $100.50 @Store #123',
            'Unicode test: café, résumé, 北京',
            'Empty string test',
            '   Whitespace test   ',
        ];

        for (let i = 0; i < testCases.length; i++) {
            const original = testCases[i];
            
            try {
                // Encrypt
                const encrypted = encrypt(original);
                console.log(`${i + 1}. Original: "${original}"`);
                console.log(`   Encrypted: ${encrypted.substring(0, 50)}...`);
                
                // Decrypt
                const decrypted = decrypt(encrypted);
                const success = decrypted === original;
                
                console.log(`   Decrypted: "${decrypted}"`);
                console.log(`   Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
                
                if (!success) {
                    console.log(`   Expected: "${original}"`);
                    console.log(`   Got: "${decrypted}"`);
                }
                
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
            }
            
            console.log('');
        }
    }

    async testDataVariations() {
        console.log('📋 Data Variation Tests');
        console.log('-'.repeat(25));
        
        const variations = {
            'null': null,
            'undefined': undefined,
            'number': 12345,
            'boolean': true,
            'object': { test: 'data' },
            'array': ['test', 'data'],
        };

        for (const [type, value] of Object.entries(variations)) {
            try {
                console.log(`Testing ${type}: ${JSON.stringify(value)}`);
                
                const encrypted = encrypt(value);
                const decrypted = decrypt(encrypted);
                
                console.log(`   Result: ${encrypted === value ? 'No change (expected)' : 'Changed'}`);
                
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
            }
        }
        
        console.log('');
    }

    async testCorruptedData() {
        console.log('📋 Corrupted Data Tests');
        console.log('-'.repeat(25));
        
        const corruptedCases = [
            'invalid:encrypted:format',
            'notencrypted',
            'abc123:def456', // Only 2 parts instead of 3
            'invalid:auth:tag:extra:parts', // Too many parts
            'nonhex:nonhex:nonhex', // Invalid hex
        ];

        for (let i = 0; i < corruptedCases.length; i++) {
            const corrupted = corruptedCases[i];
            
            try {
                console.log(`${i + 1}. Testing: "${corrupted}"`);
                const result = decrypt(corrupted);
                console.log(`   Result: "${result}"`);
                console.log(`   Status: ${result === corrupted ? '✅ Gracefully handled' : '⚠️ Modified'}`);
                
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
            }
        }
        
        console.log('');
    }
}

async function main() {
    try {
        console.log('Encryption Functionality Test');
        console.log('=============================');
        console.log(`Encryption key: ${process.env.ENCRYPTION_KEY ? '✅ Configured' : '❌ Missing'}`);
        console.log(`Key length: ${process.env.ENCRYPTION_KEY?.length || 0} characters\n`);
        
        if (!process.env.ENCRYPTION_KEY) {
            console.log('❌ No encryption key found. Please set ENCRYPTION_KEY in your .env file.');
            process.exit(1);
        }
        
        const tester = new EncryptionTester();
        await tester.run();
        
    } catch (error) {
        console.error('Testing failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = EncryptionTester;
