const crypto = require('crypto');
const { ENCRYPTION_KEY } = require('../config');
const { logger } = require('../utils');

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string.');
}

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const SENSITIVE_FIELDS = {
    transactions: ['description'],
    categories: ['name'],
    savings_goals: ['goal_name'],
    groups: ['name'],
};

function encrypt(text) {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
        logger.error('Encryption failed', { error });
        throw new Error('Failed to encrypt data.');
    }
}

function decrypt(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    const parts = text.split(':');
    if (parts.length !== 3) {
        return text;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;

    const isHex = (str) => /^[0-9a-fA-F]+$/.test(str);
    if (
        ivHex.length !== IV_LENGTH * 2 ||
        authTagHex.length !== AUTH_TAG_LENGTH * 2 ||
        !isHex(ivHex) ||
        !isHex(authTagHex) ||
        !isHex(encryptedHex)
    ) {
        return text;
    }

    try {
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (error) {
        logger.error('Decryption failed for text', { text, error });
        return text;
    }
}

function encryptObject(tableName, data) {
    const fields = SENSITIVE_FIELDS[tableName];
    if (!fields) return data;

    const encryptedData = { ...data };
    for (const field of fields) {
        if (encryptedData[field]) {
            encryptedData[field] = encrypt(encryptedData[field]);
        }
    }
    return encryptedData;
}

function decryptObject(tableName, data) {
    const fields = SENSITIVE_FIELDS[tableName];
    if (!fields || !data) return data;

    if (Array.isArray(data)) {
        return data.map(item => decryptObject(tableName, item));
    }

    const decryptedData = { ...data };
    for (const field of fields) {
        if (decryptedData[field]) {
            decryptedData[field] = decrypt(decryptedData[field]);
        }
    }
    return decryptedData;
}

module.exports = {
    encrypt,
    decrypt,
    encryptObject,
    decryptObject
};
