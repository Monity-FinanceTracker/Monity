const config = require('./env');
const db = require('./database');
const supabase = require('./supabase');

module.exports = {
    ...config,
    ...db,
    ...supabase
};
