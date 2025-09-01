require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3001,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
};
