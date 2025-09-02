const morgan = require('morgan');
const config = require('../config/env');

// Simple console logger
const logger = {
    info: (message, meta = {}) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] INFO: ${message}`, meta);
    },
    error: (message, meta = {}) => {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR: ${message}`, meta);
    },
    warn: (message, meta = {}) => {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] WARN: ${message}`, meta);
    },
    debug: (message, meta = {}) => {
        if (config.NODE_ENV !== 'production') {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] DEBUG: ${message}`, meta);
        }
    }
};

const stream = {
    write: (message) => logger.info(message.trim()),
};

const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream }
);

module.exports = { logger, morganMiddleware };
