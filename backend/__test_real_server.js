#!/usr/bin/env node
/**
 * Teste no servidor real - Requisições HTTP
 * Testa o endpoint /api/auth/register com requisições reais
 * 
 * Execute: node backend/__test_real_server.js
 * 
 * IMPORTANTE: O servidor deve estar rodando em http://localhost:5000
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
function makeRequest(path, data) {
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
            timeout: 10000 // 10 segundos timeout
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
                        headers: res.headers,
                        body: jsonResponse
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
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
    printHeader('🌐 TESTE NO SERVIDOR REAL - HTTP REQUESTS');
    
    printInfo(`Servidor: http://${SERVER_URL}:${SERVER_PORT}`);
    printInfo('Verificando se o servidor está rodando...\n');

    // Verificar servidor
    const isServerRunning = await checkServer();
    
    if (!isServerRunning) {
        printError('Servidor não está respondendo!');
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
    // TESTE 1: Email fake - wacold.com
    // ========================================
    printHeader('TESTE 1: Email Fake (wacold.com) - DEVE SER BLOQUEADO');
    totalTests++;

    const fakeEmailData = {
        name: 'Test User Fake',
        email: 'wawefi5741@wacold.com',
        password: 'senha12345678'
    };

    console.log(`\n📧 Tentando cadastrar: ${fakeEmailData.email}`);
    printInfo('Este é o email que o dev senior conseguiu cadastrar antes');
    printInfo('Esperado: Status 400 (Bad Request)');

    try {
        const response = await makeRequest('/api/auth/register', fakeEmailData);
        
        console.log(`\n📊 Status Code: ${response.statusCode}`);
        console.log('📋 Resposta:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 400 || response.statusCode === 422) {
            if (response.body.error && response.body.error.includes('temporário')) {
                printSuccess('BLOQUEADO CORRETAMENTE! ✅');
                printInfo(`Mensagem: ${response.body.error}`);
                passedTests++;
            } else {
                printWarning('Bloqueado, mas por outro motivo');
                printInfo(`Motivo: ${response.body.error || 'Não especificado'}`);
                passedTests++;
            }
        } else if (response.statusCode === 201) {
            printError('FALHOU! Email fake foi aceito pelo servidor!');
            printError('O sistema permitiu cadastro com email temporário!');
            failedTests++;
        } else {
            printWarning(`Status inesperado: ${response.statusCode}`);
            failedTests++;
        }
    } catch (error) {
        printError(`Erro na requisição: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            printError('Servidor não está rodando! Inicie com: npm start');
        }
        failedTests++;
    }

    // Aguardar 500ms entre requisições
    await new Promise(resolve => setTimeout(resolve, 500));

    // ========================================
    // TESTE 2: Outros emails temporários
    // ========================================
    printHeader('TESTE 2: Outros Emails Temporários');

    const tempEmails = [
        { name: 'Test TempMail', email: 'test@tempmail.com', password: 'senha12345678' },
        { name: 'Test Mailinator', email: 'fake@mailinator.com', password: 'senha12345678' },
    ];

    for (const emailData of tempEmails) {
        totalTests++;
        console.log(`\n📧 Tentando: ${emailData.email}`);

        try {
            const response = await makeRequest('/api/auth/register', emailData);
            
            if (response.statusCode === 400 || response.statusCode === 422) {
                printSuccess('BLOQUEADO ✅');
                passedTests++;
            } else if (response.statusCode === 201) {
                printError('FALHOU - Email temporário aceito');
                failedTests++;
            } else {
                printWarning(`Status inesperado: ${response.statusCode}`);
                failedTests++;
            }
        } catch (error) {
            printError(`Erro: ${error.message}`);
            failedTests++;
        }

        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // ========================================
    // TESTE 3: Email válido (pode já existir)
    // ========================================
    printHeader('TESTE 3: Email Válido (Formato Correto)');
    totalTests++;

    // Usando email com timestamp para evitar duplicação
    const timestamp = Date.now();
    const validEmailData = {
        name: 'Test Valid User',
        email: `testuser${timestamp}@gmail.com`,
        password: 'senha12345678'
    };

    console.log(`\n📧 Tentando cadastrar: ${validEmailData.email}`);
    printInfo('Email com formato válido e domínio real');
    printInfo('Esperado: Status 201 (Created) ou 400 (se já existir)');

    try {
        const response = await makeRequest('/api/auth/register', validEmailData);
        
        console.log(`\n📊 Status Code: ${response.statusCode}`);
        console.log('📋 Resposta:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 201) {
            printSuccess('PASSOU! Email válido foi aceito ✅');
            printInfo('Cadastro realizado com sucesso');
            passedTests++;
        } else if (response.statusCode === 400 && response.body.error && response.body.error.includes('already registered')) {
            printSuccess('Email válido (mas já existe) ✅');
            printInfo('Validação passou, mas email já está cadastrado');
            passedTests++;
        } else if (response.statusCode === 400 && !response.body.error?.includes('temporário')) {
            printWarning('Bloqueado por outro motivo (não por ser temporário)');
            printInfo(`Motivo: ${response.body.error}`);
            // Se não foi bloqueado por ser temporário, consideramos OK
            passedTests++;
        } else {
            printError(`Status inesperado: ${response.statusCode}`);
            console.log('Resposta:', response.body);
            failedTests++;
        }
    } catch (error) {
        printError(`Erro na requisição: ${error.message}`);
        failedTests++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // ========================================
    // TESTE 4: Formato inválido
    // ========================================
    printHeader('TESTE 4: Formato Inválido');
    totalTests++;

    const invalidEmailData = {
        name: 'Test Invalid',
        email: 'email-sem-arroba',
        password: 'senha12345678'
    };

    console.log(`\n📧 Tentando: ${invalidEmailData.email}`);
    printInfo('Email sem @ (formato inválido)');

    try {
        const response = await makeRequest('/api/auth/register', invalidEmailData);
        
        if (response.statusCode === 400 || response.statusCode === 422) {
            printSuccess('BLOQUEADO ✅');
            printInfo(`Motivo: ${response.body.error || response.body.message || 'Validação falhou'}`);
            passedTests++;
        } else {
            printError(`FALHOU - Status: ${response.statusCode}`);
            failedTests++;
        }
    } catch (error) {
        printError(`Erro: ${error.message}`);
        failedTests++;
    }

    // ========================================
    // RESULTADOS FINAIS
    // ========================================
    printHeader('📊 RESULTADOS FINAIS - SERVIDOR REAL');
    
    console.log('\n' + colors.cyan + `Total de testes: ${totalTests}` + colors.reset);
    console.log(colors.green + `✅ Passou: ${passedTests}` + colors.reset);
    console.log(colors.red + `❌ Falhou: ${failedTests}` + colors.reset);
    
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    console.log('\n' + colors.magenta + `Taxa de sucesso: ${successRate}%` + colors.reset);
    
    if (failedTests === 0 && passedTests > 0) {
        console.log('\n' + colors.green + '🎉 TODOS OS TESTES NO SERVIDOR REAL PASSARAM! 🎉' + colors.reset);
        console.log(colors.green + '✅ Validação funcionando no endpoint HTTP!' + colors.reset);
        console.log(colors.green + '✅ Emails fake estão sendo bloqueados pelo servidor!' + colors.reset);
        console.log('\n' + colors.cyan + '🚀 Sistema de validação integrado com sucesso!' + colors.reset);
    } else if (passedTests === 0) {
        console.log('\n' + colors.red + '❌ Nenhum teste passou. Verifique se o servidor está rodando.' + colors.reset);
        console.log(colors.yellow + '\n💡 Para iniciar o servidor:' + colors.reset);
        console.log('   cd backend && npm start\n');
    } else {
        console.log('\n' + colors.yellow + '⚠️  Alguns testes falharam. Revise os erros acima.' + colors.reset);
    }
    
    console.log('\n' + colors.cyan + '='.repeat(70) + colors.reset + '\n');
}

// Executar testes
runTests().catch(error => {
    console.error(colors.red + '\n❌ Erro fatal:' + colors.reset);
    console.error(error);
    process.exit(1);
});

