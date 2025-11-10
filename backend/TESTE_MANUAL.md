# 🧪 GUIA DE TESTE MANUAL - Fase 2

## 📋 PRÉ-REQUISITOS:

1. ✅ Servidor backend rodando
2. ✅ Supabase configurado
3. ✅ Variáveis de ambiente (.env)

---

## 🚀 PASSO 1: Iniciar o Servidor

Abra um terminal e execute:

```bash
cd C:\Users\LucaL\dev\Monity\backend
npm start
```

Aguarde até ver:
```
✅ Server is running on port 5000
✅ Connected to Supabase
```

---

## 🧪 PASSO 2: Testar com curl (Windows PowerShell)

Abra **OUTRO terminal** (deixe o servidor rodando) e execute os testes:

### ✅ TESTE 1: Email Fake (DEVE SER BLOQUEADO) ⭐

```powershell
$body = @{
    name = "Test User Fake"
    email = "wawefi5741@wacold.com"
    password = "senha12345678"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**✅ Resultado Esperado:**
```json
{
  "success": false,
  "error": "Emails temporários não são permitidos. Use um email real.",
  "details": "disposable-check"
}
```

---

### ✅ TESTE 2: Outros Emails Temporários

```powershell
# TempMail
$body = @{
    name = "Test TempMail"
    email = "test@tempmail.com"
    password = "senha12345678"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**✅ Resultado Esperado:** Bloqueado (erro de email temporário)

```powershell
# Mailinator
$body = @{
    name = "Test Mailinator"
    email = "fake@mailinator.com"
    password = "senha12345678"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**✅ Resultado Esperado:** Bloqueado (erro de email temporário)

---

### ✅ TESTE 3: Email Válido (DEVE PASSAR)

**IMPORTANTE:** Use um email REAL que você tenha acesso!

```powershell
$body = @{
    name = "Seu Nome"
    email = "seu.email@gmail.com"  # <- TROQUE AQUI
    password = "senha12345678"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**✅ Resultado Esperado:**
```json
{
  "user": { ... },
  "session": { ... },
  "message": "Conta criada com sucesso!"
}
```

---

### ✅ TESTE 4: Formato Inválido (DEVE SER BLOQUEADO)

```powershell
$body = @{
    name = "Test Invalid"
    email = "email-sem-arroba"
    password = "senha12345678"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**✅ Resultado Esperado:** Erro de validação (formato inválido)

---

## 🧪 PASSO 3: Testar com Postman/Insomnia

### Configuração:

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/auth/register`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body (JSON):**
   ```json
   {
     "name": "Test User",
     "email": "wawefi5741@wacold.com",
     "password": "senha12345678"
   }
   ```

### Testes:

| Email | Resultado Esperado |
|-------|-------------------|
| `wawefi5741@wacold.com` | ❌ BLOQUEADO |
| `test@tempmail.com` | ❌ BLOQUEADO |
| `fake@mailinator.com` | ❌ BLOQUEADO |
| `seu.email@gmail.com` | ✅ PASSOU |
| `email-sem-arroba` | ❌ BLOQUEADO |

---

## 📊 VERIFICANDO LOGS DO SERVIDOR

No terminal onde o servidor está rodando, você verá logs como:

### Quando email fake é bloqueado:
```
WARN: Email validation blocked registration {
  email: 'wawefi5741@wacold.com',
  reason: 'Emails temporários não são permitidos. Use um email real.',
  details: {
    step: 'disposable-check',
    domain: 'wacold.com',
    blocked: true,
    totalBlockedDomains: 293
  }
}
```

### Quando email válido passa:
```
INFO: Email validado com sucesso {
  email: 'usuario@gmail.com',
  domain: 'gmail.com',
  processingTime: '127ms'
}

INFO: Attempting user registration { email: 'usuario@gmail.com' }

INFO: User registered successfully {
  userId: 'uuid-aqui',
  email: 'usuario@gmail.com'
}
```

---

## 🎯 CHECKLIST DE VALIDAÇÃO:

- [ ] Email fake `wawefi5741@wacold.com` é bloqueado
- [ ] `test@tempmail.com` é bloqueado
- [ ] `fake@mailinator.com` é bloqueado
- [ ] Email válido (gmail, hotmail) passa
- [ ] Formato inválido é bloqueado
- [ ] Logs aparecem corretamente no servidor
- [ ] Performance: validação adiciona ~100-150ms

---

## ❓ TROUBLESHOOTING:

### Problema: Servidor não inicia
**Solução:**
1. Verifique se o arquivo `.env` existe em `backend/.env`
2. Verifique se tem as variáveis SUPABASE_URL e SUPABASE_ANON_KEY
3. Verifique se a porta 5000 não está em uso

### Problema: Erro "Cannot find module"
**Solução:**
```bash
cd backend
npm install
npm start
```

### Problema: Todos os emails passam (não bloqueia fakes)
**Solução:**
1. Verifique se as alterações foram salvas
2. Reinicie o servidor (Ctrl+C e npm start novamente)
3. Verifique os logs para ver se há erros

### Problema: Email válido é bloqueado
**Solução:**
- Verifique os logs do servidor para ver qual etapa falhou
- Se for erro de DNS MX, pode ser problema temporário de rede
- O sistema tem fail-safe: em caso de erro de rede, permite mas loga

---

## 🎉 RESULTADO ESPERADO:

✅ Email fake `wawefi5741@wacold.com` → **BLOQUEADO**
✅ Outros emails temporários → **BLOQUEADOS**
✅ Emails válidos → **PASSAM**
✅ Formatos inválidos → **BLOQUEADOS**
✅ Performance mantida (~100-150ms adicional)

---

## 🚀 PRÓXIMO PASSO:

Após confirmar que está funcionando, podemos partir para:
- **Fase 3:** Google OAuth (login com Google)
- **Fase 4:** Email Confirmation (confirmação obrigatória)

---

**Need help?** Os testes automatizados também estão disponíveis:
```bash
# Teste do serviço (sem servidor)
node backend/__test_complete_flow.js

# Teste do servidor real (requer servidor rodando)
node backend/__test_real_server.js
```

