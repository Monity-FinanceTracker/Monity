// Script de teste para o Email Validation Service
// Execute: node backend/services/__test_email_validation.js

const EmailValidationService = require('./emailValidationService');

const emailValidator = new EmailValidationService();

async function testEmailValidation() {
    console.log('🧪 TESTANDO EMAIL VALIDATION SERVICE\n');
    console.log('='.repeat(60));

    const testCases = [
        // Emails válidos
        { email: 'usuario@gmail.com', shouldPass: true },
        { email: 'teste@hotmail.com', shouldPass: true },
        { email: 'contato@empresa.com.br', shouldPass: true },
        
        // Email fake reportado pelo dev senior
        { email: 'wawefi5741@wacold.com', shouldPass: false },
        
        // Outros emails temporários
        { email: 'teste@tempmail.com', shouldPass: false },
        { email: 'fake@mailinator.com', shouldPass: false },
        { email: 'spam@10minutemail.com', shouldPass: false },
        { email: 'temp@guerrillamail.com', shouldPass: false },
        
        // Emails com formato inválido
        { email: 'invalido', shouldPass: false },
        { email: 'sem-arroba.com', shouldPass: false },
        { email: '@semlocal.com', shouldPass: false },
        { email: 'usuario@', shouldPass: false },
        
        // Domínios que não existem
        { email: 'usuario@dominioqueprovavelmentenaoexiste12345.com', shouldPass: false },
    ];

    for (const testCase of testCases) {
        console.log(`\n📧 Testando: ${testCase.email}`);
        console.log(`   Esperado: ${testCase.shouldPass ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
        
        const result = await emailValidator.validateEmail(testCase.email);
        
        const passed = result.isValid === testCase.shouldPass;
        console.log(`   Resultado: ${result.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
        
        if (!result.isValid) {
            console.log(`   Motivo: ${result.reason}`);
        }
        
        if (result.details?.processingTime) {
            console.log(`   Tempo: ${result.details.processingTime}ms`);
        }
        
        console.log(`   ${passed ? '✅ TESTE PASSOU' : '❌ TESTE FALHOU'}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TESTES CONCLUÍDOS!\n');
}

// Executar testes
testEmailValidation().catch(console.error);

