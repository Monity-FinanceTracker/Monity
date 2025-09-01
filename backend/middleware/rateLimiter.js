const rateLimit = require('express-rate-limit');

// More generous rate limiting for development and normal usage
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: process.env.NODE_ENV === 'development' ? 1000 : 200, // More requests for development
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again in a minute.'
    },
    // Skip rate limiting for localhost in development
    skip: (req) => {
        return process.env.NODE_ENV === 'development' && 
               (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 50 : 10, // More lenient for development
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter
};
