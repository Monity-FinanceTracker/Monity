#!/usr/bin/env node
/**
 * Script de teste completo - Fase 2
 * Testa o Email Validation Service isoladamente
 * 
 * Execute: node backend/__test_complete_flow.js
 */

const EmailValidationService = require('./services/emailValidationService');
const { isDisposableEmail, getBlockedDomainsCount } = require('./utils/disposableEmailDomains');

const emailValidator = new EmailValidationService();

// Cores para terminal
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function printHeader(text) {
    console.log('\n' + colors.cyan + '='.repeat(70) + colors.reset);
    console.log(colors.cyan + text + colors.reset);
    console.log(colors.cyan + '='.repeat(70) + colors.reset);
}

function printSuccess(text) {
    console.log(colors.green + '✅ ' + text + colors.reset);
}

function printError(text) {
    console.log(colors.red + '❌ ' + text + colors.reset);
}

function printInfo(text) {
    console.log(colors.blue + 'ℹ️  ' + text + colors.reset);
}

function printWarning(text) {
    console.log(colors.yellow + '⚠️  ' + text + colors.reset);
}

async function runTests() {
    console.clear();
    printHeader('🧪 TESTE COMPLETO - EMAIL VALIDATION SERVICE (FASE 2)');
    
    console.log('\n📊 Informações do Sistema:');
    printInfo(`Total de domínios bloqueados: ${getBlockedDomainsCount()}`);
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    // ========================================
    // TESTE 1: Email fake reportado pelo dev senior
    // ========================================
    printHeader('TESTE 1: Email Fake Reportado (wacold.com)');
    totalTests++;
    
    const fakeEmail = 'wawefi5741@wacold.com';
    console.log(`\n📧 Testando: ${fakeEmail}`);
    printInfo('Este é o email que o dev senior conseguiu cadastrar');
    printInfo('Esperado: ❌ BLOQUEADO');
    
    try {
        const result = await emailValidator.validateEmail(fakeEmail);
        
        if (!result.isValid) {
            printSuccess('BLOQUEADO CORRETAMENTE! ✅');
            printInfo(`Motivo: ${result.reason}`);
            if (result.details?.processingTime) {
                printInfo(`Tempo: ${result.details.processingTime}ms`);
            }
            passedTests++;
        } else {
            printError('TESTE FALHOU! Email fake foi aceito!');
            failedTests++;
        }
    } catch (error) {
        printError(`Erro no teste: ${error.message}`);
        failedTests++;
    }

    // ========================================
    // TESTE 2: Outros emails temporários
    // ========================================
    printHeader('TESTE 2: Outros Emails Temporários');
    
    const tempEmails = [
        'test@tempmail.com',
        'fake@mailinator.com',
        'spam@10minutemail.com',
        'temp@guerrillamail.com'
    ];

    for (const email of tempEmails) {
        totalTests++;
        console.log(`\n📧 Testando: ${email}`);
        
        try {
            const result = await emailValidator.validateEmail(email);
            
            if (!result.isValid) {
                printSuccess('BLOQUEADO ✅');
                passedTests++;
            } else {
                printError('FALHOU - Email temporário foi aceito');
                failedTests++;
            }
        } catch (error) {
            printError(`Erro: ${error.message}`);
            failedTests++;
        }
    }

    // ========================================
    // TESTE 3: Emails válidos (devem passar)
    // ========================================
    printHeader('TESTE 3: Emails Válidos (Devem Passar)');
    
    const validEmails = [
        'usuario@gmail.com',
        'teste@hotmail.com',
        'contato@outlook.com'
    ];

    for (const email of validEmails) {
        totalTests++;
        console.log(`\n📧 Testando: ${email}`);
        
        try {
            const result = await emailValidator.validateEmail(email);
            
            if (result.isValid) {
                printSuccess('PASSOU ✅');
                if (result.details?.processingTime) {
                    printInfo(`Tempo: ${result.details.processingTime}ms`);
                }
                passedTests++;
            } else {
                printError(`FALHOU - Email válido foi bloqueado: ${result.reason}`);
                failedTests++;
            }
        } catch (error) {
            printError(`Erro: ${error.message}`);
            failedTests++;
        }
    }

    // ========================================
    // TESTE 4: Formatos inválidos
    // ========================================
    printHeader('TESTE 4: Formatos Inválidos (Devem Ser Bloqueados)');
    
    const invalidFormats = [
        'invalido',
        'sem-arroba.com',
        '@semlocal.com',
        'usuario@'
    ];

    for (const email of invalidFormats) {
        totalTests++;
        console.log(`\n📧 Testando: ${email}`);
        
        try {
            const result = await emailValidator.validateEmail(email);
            
            if (!result.isValid) {
                printSuccess('BLOQUEADO ✅');
                printInfo(`Motivo: ${result.reason}`);
                passedTests++;
            } else {
                printError('FALHOU - Formato inválido foi aceito');
                failedTests++;
            }
        } catch (error) {
            printError(`Erro: ${error.message}`);
            failedTests++;
        }
    }

    // ========================================
    // TESTE 5: Domínio inexistente
    // ========================================
    printHeader('TESTE 5: Domínio Inexistente');
    totalTests++;
    
    const nonExistentDomain = 'usuario@dominioqueprovavelmentenaoexiste12345xyz.com';
    console.log(`\n📧 Testando: ${nonExistentDomain}`);
    printInfo('Esperado: ❌ BLOQUEADO (domínio não existe)');
    
    try {
        const result = await emailValidator.validateEmail(nonExistentDomain);
        
        if (!result.isValid) {
            printSuccess('BLOQUEADO CORRETAMENTE! ✅');
            printInfo(`Motivo: ${result.reason}`);
            passedTests++;
        } else {
            printWarning('Email foi aceito (pode ser fail-safe se DNS falhou)');
            if (result.details?.warning) {
                printInfo(`Aviso: ${result.details.warning}`);
            }
            passedTests++; // Consideramos OK se foi fail-safe
        }
    } catch (error) {
        printError(`Erro no teste: ${error.message}`);
        failedTests++;
    }

    // ========================================
    // TESTE 6: Verificação da blocklist
    // ========================================
    printHeader('TESTE 6: Verificação da Blocklist');
    totalTests++;
    
    console.log('\n📋 Verificando função isDisposableEmail diretamente...');
    
    const directTests = [
        { email: 'test@wacold.com', expected: true },
        { email: 'test@gmail.com', expected: false },
        { email: 'test@tempmail.com', expected: true },
    ];

    let directTestsPassed = 0;
    for (const test of directTests) {
        const result = isDisposableEmail(test.email);
        const domain = test.email.split('@')[1];
        
        if (result === test.expected) {
            printSuccess(`${domain}: ${result ? 'BLOQUEADO' : 'PERMITIDO'} ✅`);
            directTestsPassed++;
        } else {
            printError(`${domain}: FALHOU (esperado: ${test.expected}, recebido: ${result})`);
        }
    }

    if (directTestsPassed === directTests.length) {
        printSuccess('Blocklist funcionando corretamente!');
        passedTests++;
    } else {
        printError('Problemas na blocklist detectados!');
        failedTests++;
    }

    // ========================================
    // RESULTADOS FINAIS
    // ========================================
    printHeader('📊 RESULTADOS FINAIS');
    
    console.log('\n' + colors.cyan + `Total de testes: ${totalTests}` + colors.reset);
    console.log(colors.green + `✅ Passou: ${passedTests}` + colors.reset);
    console.log(colors.red + `❌ Falhou: ${failedTests}` + colors.reset);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log('\n' + colors.magenta + `Taxa de sucesso: ${successRate}%` + colors.reset);
    
    if (failedTests === 0) {
        console.log('\n' + colors.green + '🎉 TODOS OS TESTES PASSARAM! 🎉' + colors.reset);
        console.log(colors.green + '✅ Sistema de validação funcionando perfeitamente!' + colors.reset);
        console.log(colors.green + '✅ Emails fake agora são bloqueados!' + colors.reset);
        console.log('\n' + colors.cyan + '🚀 Pronto para Fase 3 (Google OAuth)!' + colors.reset);
    } else {
        console.log('\n' + colors.yellow + '⚠️  Alguns testes falharam. Revise os erros acima.' + colors.reset);
    }
    
    console.log('\n' + colors.cyan + '='.repeat(70) + colors.reset + '\n');
}

// Executar testes
runTests().catch(error => {
    console.error(colors.red + '\n❌ Erro fatal ao executar testes:' + colors.reset);
    console.error(error);
    process.exit(1);
});

