const { encrypt, decrypt, encryptObject, decryptObject } = require('../middleware/encryption');

describe('Encryption Security Tests', () => {
    describe('Basic Encryption Service', () => {
        test('should encrypt and decrypt strings correctly', () => {
            const originalText = 'This is sensitive financial data';
            const encrypted = encrypt(originalText);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(originalText);
            expect(encrypted).not.toBe(originalText);
        });

        test('should handle special characters in encryption', () => {
            const specialText = 'Payment for café & restaurant - €50.00 💰';
            const encrypted = encrypt(specialText);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(specialText);
        });
    });

    describe('Object Encryption', () => {
        test('should encrypt sensitive fields in a transaction object', () => {
            const transaction = {
                description: 'Coffee at Starbucks',
                amount: 4.50,
            };
            const encrypted = encryptObject('transactions', transaction);
            expect(encrypted.description).not.toBe(transaction.description);
            expect(encrypted.amount).toBe(transaction.amount);
        });

        test('should decrypt sensitive fields in a transaction object', () => {
            const encryptedTransaction = {
                description: encrypt('Coffee at Starbucks'),
                amount: 4.50,
            };
            const decrypted = decryptObject('transactions', encryptedTransaction);
            expect(decrypted.description).toBe('Coffee at Starbucks');
        });

        test('should handle an array of objects', () => {
            const transactions = [
                { description: 'Coffee' },
                { description: 'Lunch' }
            ];
            const encrypted = decryptObject('transactions', transactions.map(t => encryptObject('transactions', t)));
            expect(encrypted[0].description).toBe('Coffee');
            expect(encrypted[1].description).toBe('Lunch');
        });
    });
}); 