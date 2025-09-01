const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_KEY } = require('./env');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);


module.exports = { supabase, supabaseAdmin };
