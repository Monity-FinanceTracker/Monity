// This file will export all middleware
const auth = require('./auth');
const validation = require('./validation');
const encryption = require('./encryption');
const errorHandler = require('./errorHandler');
const rateLimiter = require('./rateLimiter');

module.exports = (supabase) => ({
    auth: auth,
    validation: validation,
    encryption: encryption,
    errorHandler: errorHandler,
    rateLimiter: rateLimiter
});
