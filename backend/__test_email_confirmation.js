#!/usr/bin/env node
/**
 * Teste dos Endpoints de Email Confirmation
 * Testa: resend-confirmation e check-verification
 * 
 * Execute: node backend/__test_email_confirmation.js
 */

const http = require('http');

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

const SERVER_URL = 'localhost';
const SERVER_PORT = 5000;

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

/**
 * Faz requisição HTTP POST
 */
function makePostRequest(path, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: SERVER_URL,
            port: SERVER_PORT,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        body: jsonResponse
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        body: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Faz requisição HTTP GET
 */
function makeGetRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SERVER_URL,
            port: SERVER_PORT,
            path: path,
            method: 'GET',
            timeout: 10000
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        body: jsonResponse
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        body: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

/**
 * Verifica se o servidor está rodando
 */
async function checkServer() {
    return new Promise((resolve) => {
        const options = {
            hostname: SERVER_URL,
            port: SERVER_PORT,
            path: '/health',
            method: 'GET',
            timeout: 3000
        };

        const req = http.request(options, (res) => {
            resolve(true);
        });

        req.on('error', () => {
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

async function runTests() {
    console.clear();
    printHeader('🧪 TESTE - EMAIL CONFIRMATION ENDPOINTS');
    
    printInfo(`Servidor: http://${SERVER_URL}:${SERVER_PORT}`);
    printInfo('Verificando se o servidor está rodando...\n');

    // Verificar servidor
    const isServerRunning = await checkServer();
    
    if (!isServerRunning) {
        printWarning('⚠️  SERVIDOR NÃO ESTÁ RESPONDENDO');
        printWarning('Certifique-se de que o servidor está rodando:');
        console.log('\n  ' + colors.yellow + 'cd backend && npm start' + colors.reset + '\n');
        printInfo('Tentando conectar mesmo assim...\n');
    } else {
        printSuccess('Servidor está rodando!\n');
    }

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    // ========================================
    // TESTE 1: Reenviar Email - Email não encontrado
    // ========================================
    printHeader('TESTE 1: Reenviar Email - Email Não Cadastrado');
    totalTests++;

    const nonExistentEmail = {
        email: 'nao-existe-12345@example.com'
    };

    console.log(`\n📧 Email: ${nonExistentEmail.email}`);
    printInfo('Esperado: 404 (Email não encontrado)');

    try {
        const response = await makePostRequest('/api/auth/resend-confirmation', nonExistentEmail);
        
        console.log(`\n📊 Status: ${response.statusCode}`);
        console.log('📋 Resposta:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 404 && response.body.success === false) {
            printSuccess('COMPORTAMENTO CORRETO! ✅');
            printInfo('Email não encontrado, como esperado');
            passedTests++;
        } else if (response.statusCode === 400) {
            printSuccess('Email não encontrado (400) ✅');
            passedTests++;
        } else {
            printWarning(`Status inesperado: ${response.statusCode}`);
            failedTests++;
        }
    } catch (error) {
        printError(`Erro na requisição: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            printError('⚠️  Servidor não está rodando! Inicie com: cd backend && npm start');
        }
        failedTests++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // ========================================
    // TESTE 2: Reenviar Email - Sem email no body
    // ========================================
    printHeader('TESTE 2: Reenviar Email - Sem Email no Body');
    totalTests++;

    console.log('\n📧 Body vazio');
    printInfo('Esperado: 400 (Bad Request)');

    try {
        const response = await makePostRequest('/api/auth/resend-confirmation', {});
        
        console.log(`\n📊 Status: ${response.statusCode}`);
        console.log('📋 Resposta:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 400 && response.body.success === false) {
            printSuccess('VALIDAÇÃO FUNCIONANDO! ✅');
            printInfo('Rejeitou requisição sem email');
            passedTests++;
        } else {
            printWarning(`Status inesperado: ${response.statusCode}`);
            failedTests++;
        }
    } catch (error) {
        printError(`Erro: ${error.message}`);
        failedTests++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // ========================================
    // TESTE 3: Verificar Status - Email não encontrado
    // ========================================
    printHeader('TESTE 3: Verificar Status - Email Não Cadastrado');
    totalTests++;

    console.log(`\n📧 Email: ${nonExistentEmail.email}`);
    printInfo('Esperado: 404 (Email não encontrado)');

    try {
        const response = await makeGetRequest(
            `/api/auth/check-verification?email=${encodeURIComponent(nonExistentEmail.email)}`
        );
        
        console.log(`\n📊 Status: ${response.statusCode}`);
        console.log('📋 Resposta:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 404 && response.body.verified === false) {
            printSuccess('COMPORTAMENTO CORRETO! ✅');
            printInfo('Email não encontrado, retornou verified: false');
            passedTests++;
        } else {
            printWarning(`Status inesperado: ${response.statusCode}`);
            failedTests++;
        }
    } catch (error) {
        printError(`Erro: ${error.message}`);
        failedTests++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // ========================================
    // TESTE 4: Verificar Status - Sem email no query
    // ========================================
    printHeader('TESTE 4: Verificar Status - Sem Email na Query');
    totalTests++;

    console.log('\n📧 Query vazia');
    printInfo('Esperado: 400 (Bad Request)');

    try {
        const response = await makeGetRequest('/api/auth/check-verification');
        
        console.log(`\n📊 Status: ${response.statusCode}`);
        console.log('📋 Resposta:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 400 && response.body.success === false) {
            printSuccess('VALIDAÇÃO FUNCIONANDO! ✅');
            printInfo('Rejeitou requisição sem email');
            passedTests++;
        } else {
            printWarning(`Status inesperado: ${response.statusCode}`);
            failedTests++;
        }
    } catch (error) {
        printError(`Erro: ${error.message}`);
        failedTests++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // ========================================
    // TESTE 5: Estrutura da Resposta
    // ========================================
    printHeader('TESTE 5: Estrutura das Respostas');
    totalTests++;

    console.log('\n📋 Verificando estrutura das respostas...');

    try {
        // Testar estrutura do resend-confirmation
        const resendResponse = await makePostRequest('/api/auth/resend-confirmation', {
            email: 'test@example.com'
        });

        const hasSuccessField = 'success' in resendResponse.body;
        const hasErrorField = 'error' in resendResponse.body || 'message' in resendResponse.body;

        if (hasSuccessField && hasErrorField) {
            printSuccess('Estrutura de resposta correta! ✅');
            printInfo('Campos "success" e "error/message" presentes');
            passedTests++;
        } else {
            printWarning('Estrutura de resposta pode estar incorreta');
            console.log('Body:', resendResponse.body);
            failedTests++;
        }
    } catch (error) {
        printError(`Erro: ${error.message}`);
        failedTests++;
    }

    // ========================================
    // RESULTADOS FINAIS
    // ========================================
    printHeader('📊 RESULTADOS FINAIS - EMAIL CONFIRMATION');
    
    console.log('\n' + colors.cyan + `Total de testes: ${totalTests}` + colors.reset);
    console.log(colors.green + `✅ Passou: ${passedTests}` + colors.reset);
    console.log(colors.red + `❌ Falhou: ${failedTests}` + colors.reset);
    
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    console.log('\n' + colors.magenta + `Taxa de sucesso: ${successRate}%` + colors.reset);
    
    if (failedTests === 0 && passedTests > 0) {
        console.log('\n' + colors.green + '🎉 TODOS OS TESTES PASSARAM! 🎉' + colors.reset);
        console.log(colors.green + '✅ Endpoints de Email Confirmation funcionando!' + colors.reset);
        console.log(colors.green + '✅ Validações estão corretas!' + colors.reset);
        console.log('\n' + colors.cyan + '📝 Próximo passo: Configurar Supabase Dashboard' + colors.reset);
        console.log(colors.cyan + '   Ver: docs/EMAIL_CONFIRMATION_SETUP.md' + colors.reset);
    } else if (passedTests === 0) {
        console.log('\n' + colors.red + '❌ Nenhum teste passou. Verifique se o servidor está rodando.' + colors.reset);
        console.log(colors.yellow + '\n💡 Para iniciar o servidor:' + colors.reset);
        console.log('   cd backend && npm start\n');
    } else {
        console.log('\n' + colors.yellow + '⚠️  Alguns testes falharam. Revise os erros acima.' + colors.reset);
    }
    
    console.log('\n' + colors.cyan + '='.repeat(70) + colors.reset);
    
    // Instruções finais
    if (passedTests > 0) {
        console.log('\n' + colors.blue + '📚 DOCUMENTAÇÃO:' + colors.reset);
        console.log('   • docs/EMAIL_CONFIRMATION_SETUP.md     - Guia completo');
        console.log('   • backend/TESTE_EMAIL_CONFIRMATION.md  - Comandos de teste');
        
        console.log('\n' + colors.blue + '🔧 PARA USAR COM EMAIL REAL:' + colors.reset);
        console.log('   1. Configure Supabase (5 min)');
        console.log('   2. Habilite "Email Confirmation"');
        console.log('   3. Teste com seu email');
        
        console.log('\n' + colors.blue + '📋 ENDPOINTS DISPONÍVEIS:' + colors.reset);
        console.log('   POST /api/auth/resend-confirmation    - Reenviar email');
        console.log('   GET  /api/auth/check-verification     - Verificar status');
    }
    
    console.log('\n');
}

// Executar testes
runTests().catch(error => {
    console.error(colors.red + '\n❌ Erro fatal:' + colors.reset);
    console.error(error);
    process.exit(1);
});

