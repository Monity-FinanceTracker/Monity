require('dotenv').config();

// Validação de variáveis de ambiente críticas
const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não encontradas:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('\n⚠️  Configure as variáveis de ambiente antes de iniciar o servidor.');
    process.exit(1);
} else if (missingVars.length > 0) {
    console.warn('⚠️  AVISO: Variáveis de ambiente não encontradas (modo desenvolvimento):');
    missingVars.forEach(varName => {
        console.warn(`   - ${varName}`);
    });
}

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || 3001,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
};
