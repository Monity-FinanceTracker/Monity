# 📧 Configuração de Email Confirmation - Guia Completo

## 📋 Visão Geral

Este guia mostra como configurar a confirmação obrigatória de email no Supabase, garantindo que todos os usuários confirmem seus emails antes de usar o sistema.

**Tempo estimado:** 5-10 minutos

---

## 🎯 Benefícios:

✅ **Emails 100% válidos** - Usuário precisa ter acesso ao email
✅ **Mais segurança** - Previne cadastros com emails de terceiros
✅ **Padrão da indústria** - Usado por Gmail, Facebook, etc.
✅ **Gratuito** - Sem custos adicionais
✅ **Fácil de implementar** - Configuração rápida

---

## 🔧 PASSO 1: Configurar Supabase Dashboard

### 1.1. Acessar Authentication Settings

1. Acesse: https://app.supabase.com
2. Selecione seu projeto **Monity**
3. No menu lateral, vá em **"Authentication"**
4. Clique em **"Email Templates"**

### 1.2. Habilitar Email Confirmation

1. No menu lateral de Authentication, clique em **"Providers"**
2. Encontre **"Email"** na lista
3. Certifique-se de que está **HABILITADO** (toggle verde)
4. Role até a seção **"Confirm email"**
5. **Marque a checkbox:** ☑️ **"Enable email confirmations"**

### 1.3. Configurar Redirect URL

Na mesma tela, configure:

```
Site URL: http://localhost:3000 (desenvolvimento)
          https://sua-url.com (produção)

Redirect URLs:
- http://localhost:3000/auth/verify
- https://sua-url.com/auth/verify
```

### 1.4. Salvar Configurações

1. Role até o fim da página
2. Clique em **"Save"**
3. Aguarde a confirmação

---

## 🔧 PASSO 2: Personalizar Email Template (Opcional)

### 2.1. Acessar Email Templates

1. Em Authentication, clique em **"Email Templates"**
2. Selecione **"Confirm signup"**

### 2.2. Template Padrão

O Supabase já tem um template bom. Exemplo:

```html
<h2>Confirme seu email</h2>
<p>Olá {{ .Email }}!</p>
<p>Obrigado por se cadastrar no Monity.</p>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
```

### 2.3. Personalizar (Se quiser)

Você pode customizar:
- Logo da empresa
- Cores e estilo
- Texto da mensagem
- Idioma (português)

**Exemplo customizado:**

```html
<h2>🎉 Bem-vindo ao Monity!</h2>

<p>Olá!</p>

<p>Obrigado por se cadastrar no <strong>Monity</strong>, seu gerenciador financeiro pessoal.</p>

<p>Para começar a usar, confirme seu email clicando no botão abaixo:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #4F46E5; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 6px; display: inline-block;">
    ✅ Confirmar Meu Email
  </a>
</p>

<p>Ou copie e cole este link no navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p style="color: #666; font-size: 12px;">
  Se você não se cadastrou no Monity, ignore este email.
</p>

<p style="color: #666; font-size: 12px;">
  Este link expira em 24 horas.
</p>
```

### 2.4. Testar Template

1. Clique em **"Save"**
2. Faça um cadastro de teste
3. Verifique se recebeu o email
4. Teste o link de confirmação

---

## 🔧 PASSO 3: Configurar Backend Monity

### 3.1. Variáveis de Ambiente

No arquivo `backend/.env`, certifique-se de ter:

```env
SUPABASE_URL=https://seu-project-id.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-key
FRONTEND_URL=http://localhost:3000
```

### 3.2. Endpoints Disponíveis

Os seguintes endpoints já estão implementados:

#### **POST /api/auth/resend-confirmation**
Reenvia o email de confirmação.

```bash
POST http://localhost:5000/api/auth/resend-confirmation
Content-Type: application/json

{
  "email": "usuario@email.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email de confirmação reenviado com sucesso!",
  "email": "usuario@email.com"
}
```

#### **GET /api/auth/check-verification**
Verifica se o email foi confirmado.

```bash
GET http://localhost:5000/api/auth/check-verification?email=usuario@email.com
```

**Response:**
```json
{
  "success": true,
  "email": "usuario@email.com",
  "verified": true,
  "confirmedAt": "2025-11-10T10:30:00Z",
  "message": "Email já foi confirmado"
}
```

---

## 🔧 PASSO 4: Configurar Frontend (Quando Implementar)

### 4.1. Tela de Confirmação Pendente

Criar uma tela que aparece após o registro:

```jsx
// EmailConfirmationScreen.jsx
function EmailConfirmationScreen({ email }) {
  return (
    <div className="confirmation-screen">
      <h2>📧 Confirme seu email</h2>
      <p>Enviamos um email para <strong>{email}</strong></p>
      <p>Clique no link do email para ativar sua conta.</p>
      
      <button onClick={resendEmail}>
        Reenviar Email
      </button>
    </div>
  );
}
```

### 4.2. Handler de Resend

```javascript
async function resendEmail() {
  const response = await fetch('/api/auth/resend-confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert('Email reenviado com sucesso!');
  }
}
```

### 4.3. Verificar Status

```javascript
async function checkEmailStatus() {
  const response = await fetch(
    `/api/auth/check-verification?email=${email}`
  );
  
  const data = await response.json();
  
  if (data.verified) {
    // Redirecionar para login ou dashboard
    window.location.href = '/dashboard';
  }
}
```

---

## 🧪 PASSO 5: Testar Configuração

### 5.1. Teste Manual Completo

1. **Registro:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"seu.email@gmail.com","password":"senha123"}'
   ```

2. **Verificar Email:**
   - Abra sua caixa de entrada
   - Procure email do Supabase
   - Clique no link de confirmação

3. **Tentar Login (antes de confirmar):**
   - Supabase pode bloquear ou permitir (depende da config)
   - Por padrão, bloqueia até confirmar

4. **Reenviar Confirmação:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/resend-confirmation \
     -H "Content-Type: application/json" \
     -d '{"email":"seu.email@gmail.com"}'
   ```

5. **Verificar Status:**
   ```bash
   curl "http://localhost:5000/api/auth/check-verification?email=seu.email@gmail.com"
   ```

---

## 📝 CHECKLIST DE CONFIGURAÇÃO:

### Supabase Dashboard:
- [ ] Email Provider habilitado
- [ ] "Enable email confirmations" marcado
- [ ] Site URL configurado
- [ ] Redirect URLs configuradas
- [ ] Email template personalizado (opcional)
- [ ] Configurações salvas

### Backend:
- [ ] Variáveis de ambiente configuradas
- [ ] FRONTEND_URL no .env
- [ ] Endpoints testados
- [ ] Logs funcionando

### Frontend (Quando implementar):
- [ ] Tela de confirmação criada
- [ ] Botão "Reenviar email" funcionando
- [ ] Verificação de status implementada
- [ ] Redirect após confirmação

---

## 🎯 FLUXOS DE CONFIRMAÇÃO:

### **Fluxo 1: Registro Normal**
```
1. Usuário se registra
   ↓
2. Supabase envia email de confirmação
   ↓
3. Usuário recebe email
   ↓
4. Usuário clica no link
   ↓
5. Supabase confirma email
   ↓
6. Redirect para frontend
   ↓
7. ✅ Usuário pode fazer login
```

### **Fluxo 2: Reenvio de Email**
```
1. Usuário não recebeu email
   ↓
2. Clica em "Reenviar email"
   ↓
3. Frontend → POST /api/auth/resend-confirmation
   ↓
4. Backend → Supabase resend
   ↓
5. Novo email enviado
   ↓
6. Usuário confirma
   ↓
7. ✅ Email confirmado
```

### **Fluxo 3: Verificação de Status**
```
1. Frontend quer saber se está confirmado
   ↓
2. GET /api/auth/check-verification
   ↓
3. Backend verifica no Supabase
   ↓
4. Retorna status
   ↓
5. Frontend decide o que fazer
```

---

## ⚠️ COMPORTAMENTO APÓS CONFIGURAR:

### **Com Email Confirmation HABILITADO:**
- ✅ Registro cria usuário
- ⏳ Usuário recebe email
- ❌ Login bloqueado até confirmar
- ✅ Após confirmar, pode fazer login

### **Com Email Confirmation DESABILITADO (padrão):**
- ✅ Registro cria usuário
- ✅ Pode fazer login imediatamente
- ⚠️ Email não é validado

---

## 🎯 CASOS DE USO:

### **Caso 1: Email Não Chegou**
```
Usuário: "Não recebi o email"
Solução: Botão "Reenviar email"
```

### **Caso 2: Email Expirou**
```
Usuário: "Link expirou"
Solução: Reenviar novo email (links expiram em 24h)
```

### **Caso 3: Email Foi para Spam**
```
Usuário: "Não vi o email"
Solução: Verificar pasta de spam
```

### **Caso 4: Email Errado no Cadastro**
```
Usuário: "Digitei email errado"
Solução: Cadastrar novamente com email correto
```

---

## 🐛 TROUBLESHOOTING:

### **Email não chega:**
1. Verifique pasta de spam
2. Verifique se SMTP está configurado no Supabase
3. Teste com outro email
4. Verifique logs do Supabase

### **Link não funciona:**
1. Link expira em 24 horas
2. Reenviar novo email
3. Verificar redirect URL

### **"Email already confirmed":**
1. Email já foi confirmado antes
2. Usuário pode fazer login

### **"User not found":**
1. Email não está cadastrado
2. Registrar primeiro

---

## 📊 ESTATÍSTICAS:

```
┌─────────────────────────────────────┐
│ Tempo de configuração: 5-10 min    │
│ Custo: R$ 0                        │
│ Taxa de confirmação típica: 80-90% │
│ Expiração de link: 24 horas        │
│ Reenvios permitidos: Ilimitado     │
└─────────────────────────────────────┘
```

---

## ✅ RESULTADO FINAL:

### **Antes:**
```
❌ Usuário pode usar sem confirmar email
❌ Emails podem ser inválidos
```

### **Depois:**
```
✅ Usuário PRECISA confirmar email
✅ Garante que email é acessível
✅ Mais uma camada de segurança
✅ Padrão da indústria
```

---

## 📚 REFERÊNCIAS:

- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Email Confirmation](https://supabase.com/docs/guides/auth/auth-email)

---

**Status:** ✅ Documentação completa
**Próximo:** Testar configuração

