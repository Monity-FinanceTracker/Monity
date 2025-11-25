/**
 * Migration Script: Add Invitation Link Fields
 * 
 * This script adds invitation_token and expires_at columns to group_invitations table
 * 
 * Usage:
 *   node migrations/run-invitation-link-migration.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runMigration() {
    console.log('🚀 Executando migration: Add Invitation Link Fields');
    console.log('==================================================\n');

    try {
        // Read SQL file
        const sqlPath = path.join(__dirname, 'add-invitation-link-fields.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📋 SQL a ser executado:');
        console.log('---');
        console.log(sql);
        console.log('---\n');

        // Execute SQL using Supabase RPC or direct query
        // Since Supabase doesn't support direct SQL execution via JS client easily,
        // we'll execute each statement separately
        
        console.log('📝 Executando ALTER TABLE statements...');

        // Add invitation_token column
        const { error: tokenError } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE group_invitations ADD COLUMN IF NOT EXISTS invitation_token UUID UNIQUE;`
        });

        if (tokenError) {
            // Try alternative method - direct query
            console.log('⚠️  Tentando método alternativo...');
            const { error: altError } = await supabase
                .from('group_invitations')
                .select('invitation_token')
                .limit(0);
            
            if (altError && altError.message.includes('column') && altError.message.includes('invitation_token')) {
                // Column doesn't exist, we need to add it
                console.log('⚠️  Coluna não existe. Execute a migration manualmente no Supabase SQL Editor.');
                console.log('\n📋 Instruções:');
                console.log('1. Acesse o Supabase Dashboard');
                console.log('2. Vá para SQL Editor');
                console.log('3. Execute o seguinte SQL:');
                console.log('\n' + sql);
                return;
            }
        }

        // Since Supabase JS client doesn't support ALTER TABLE directly,
        // we'll provide instructions for manual execution
        console.log('\n⚠️  O cliente Supabase JS não suporta ALTER TABLE diretamente.');
        console.log('📋 Por favor, execute a migration manualmente:\n');
        console.log('1. Acesse o Supabase Dashboard: https://app.supabase.com');
        console.log('2. Selecione seu projeto');
        console.log('3. Vá para "SQL Editor" no menu lateral');
        console.log('4. Cole e execute o seguinte SQL:\n');
        console.log('---');
        console.log(sql);
        console.log('---\n');
        console.log('✅ Após executar, os campos serão adicionados à tabela group_invitations');

    } catch (error) {
        console.error('💥 Erro ao executar migration:', error.message);
        console.error('\n📋 Execute a migration manualmente no Supabase SQL Editor:');
        console.error('SQL:', sql);
        process.exit(1);
    }
}

// Check if migration has been executed
async function checkMigrationStatus() {
    try {
        // Try to query the invitation_token column
        const { error } = await supabase
            .from('group_invitations')
            .select('invitation_token, expires_at')
            .limit(0);
        
        if (!error) {
            return { executed: true, message: 'Migration já foi executada. Os campos invitation_token e expires_at existem.' };
        }
        
        // Check error message
        if (error.message && (
            error.message.includes('column') && (
                error.message.includes('invitation_token') || 
                error.message.includes('expires_at')
            )
        )) {
            return { executed: false, message: 'Migration ainda não foi executada. Os campos não existem.' };
        }
        
        return { executed: null, message: 'Não foi possível verificar o status da migration.' };
    } catch (err) {
        return { executed: null, message: `Erro ao verificar migration: ${err.message}` };
    }
}

// Alternative: Use Supabase Management API or provide SQL for manual execution
async function checkAndProvideInstructions() {
    console.log('🚀 Migration: Add Invitation Link Fields');
    console.log('==========================================\n');

    const sqlPath = path.join(__dirname, 'add-invitation-link-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Check migration status
    console.log('🔍 Verificando status da migration...\n');
    const status = await checkMigrationStatus();
    console.log(`📊 Status: ${status.message}\n`);

    if (status.executed === true) {
        console.log('✅ Migration já foi executada! Nenhuma ação necessária.\n');
        return;
    }

    console.log('📋 Como executar esta migration:\n');
    console.log('1. Acesse o Supabase Dashboard: https://app.supabase.com');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para "SQL Editor" no menu lateral');
    console.log('4. Cole e execute o seguinte SQL:\n');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log('\n✅ Após executar, os campos invitation_token e expires_at serão adicionados à tabela group_invitations\n');
}

if (require.main === module) {
    checkAndProvideInstructions();
}

module.exports = { runMigration, checkAndProvideInstructions };

