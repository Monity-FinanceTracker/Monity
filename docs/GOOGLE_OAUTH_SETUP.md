# 🔵 Configuração Google OAuth - Guia Completo

## 📋 Visão Geral

Este guia mostra como configurar o Google OAuth para o Monity, permitindo que usuários façam login com suas contas Google. Isso garante que **100% dos emails sejam válidos** (verificados pelo Google).

**Tempo estimado:** 15-20 minutos

---

## 🎯 Benefícios do Google OAuth:

✅ **Emails 100% válidos** - Google já verificou
✅ **Melhor UX** - Login com 1 clique
✅ **Mais seguro** - Sem armazenar senhas
✅ **Menos atrito** - Usuário não precisa criar senha
✅ **Gratuito** - Sem custos

---

## 📦 PRÉ-REQUISITOS:

- [ ] Conta Google (Gmail)
- [ ] Projeto Supabase criado
- [ ] Backend Monity rodando

---

## 🔧 PASSO 1: Configurar Google Cloud Console

### 1.1. Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com
2. Faça login com sua conta Google
3. Clique em **"Select a project"** no topo
4. Clique em **"New Project"**

### 1.2. Criar Novo Projeto

```
Nome do projeto: Monity
Organização: (deixe padrão)
```

Clique em **"Create"** e aguarde (~30 segundos)

### 1.3. Habilitar Google+ API

1. No menu lateral, vá em **"APIs & Services" > "Library"**
2. Busque por: **"Google+ API"**
3. Clique em **"Google+ API"**
4. Clique em **"Enable"**

### 1.4. Configurar OAuth Consent Screen

1. Vá em **"APIs & Services" > "OAuth consent screen"**
2. Selecione **"External"**
3. Clique em **"Create"**

**Preencha:**
```
App name: Monity
User support email: seu.email@gmail.com
App logo: (opcional)
Application home page: http://localhost:3000 (dev) ou sua URL de produção
Application privacy policy: (opcional por enquanto)
Authorized domains: (deixe vazio por enquanto)
Developer contact: seu.email@gmail.com
```

4. Clique em **"Save and Continue"**
5. Em **"Scopes"**, clique em **"Add or Remove Scopes"**
6. Selecione:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Clique em **"Update"** e depois **"Save and Continue"**
8. Em **"Test users"**, adicione seu email para testar
9. Clique em **"Save and Continue"**

### 1.5. Criar OAuth Client ID

1. Vá em **"APIs & Services" > "Credentials"**
2. Clique em **"+ Create Credentials"**
3. Selecione **"OAuth client ID"**
4. Tipo: **"Web application"**

**Preencha:**
```
Name: Monity Web Client

Authorized JavaScript origins:
- http://localhost:3000
- http://localhost:5173 (se usar Vite)
- https://sua-url-de-producao.com (quando publicar)

Authorized redirect URIs:
- http://localhost:3000/auth/callback
- https://<SEU-PROJECT-ID>.supabase.co/auth/v1/callback
```

5. Clique em **"Create"**

### 1.6. Copiar Credenciais

Você verá uma modal com:
```
Client ID: 123456789-abc...apps.googleusercontent.com
Client Secret: GOCSPX-abc123...
```

**⚠️ IMPORTANTE:** Copie e salve em local seguro!

---

## 🔧 PASSO 2: Configurar Supabase

### 2.1. Acessar Dashboard do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto Monity
3. Vá em **"Authentication" > "Providers"**

### 2.2. Habilitar Google Provider

1. Encontre **"Google"** na lista
2. Clique para expandir
3. Ative o toggle **"Enable Sign in with Google"**

**Preencha:**
```
Client ID (for OAuth): [Cole o Client ID do Google Cloud Console]
Client Secret (for OAuth): [Cole o Client Secret]
```

### 2.3. Configurar Redirect URL

No Supabase, você verá a **Callback URL**:
```
https://<seu-project-id>.supabase.co/auth/v1/callback
```

**Copie essa URL** e **volte ao Google Cloud Console** para adicionar nos Authorized redirect URIs (se ainda não adicionou).

### 2.4. Salvar Configurações

1. Role até o fim e clique em **"Save"**
2. Aguarde confirmação

---

## 🔧 PASSO 3: Configurar Backend Monity

### 3.1. Variáveis de Ambiente

No arquivo `backend/.env`, adicione:

```env
# Supabase (já deve ter)
SUPABASE_URL=https://seu-project-id.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-key

# Google OAuth (adicionar)
GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

# URLs de callback
FRONTEND_URL=http://localhost:3000
```

### 3.2. Instalar Dependências (se necessário)

```bash
cd backend
npm install @supabase/supabase-js
```

---

## 🔧 PASSO 4: Configurar Frontend

### 4.1. Variáveis de Ambiente

No arquivo `frontend/.env` (ou `.env.local`), adicione:

```env
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
```

### 4.2. Configurar Supabase Client

No arquivo `frontend/src/lib/supabaseClient.js` (ou similar):

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🧪 PASSO 5: Testar Configuração

### 5.1. Testar OAuth Flow (Manual)

1. Acesse: https://seu-project-id.supabase.co/auth/v1/authorize?provider=google
2. Você deve ser redirecionado para tela de login do Google
3. Faça login com sua conta Google
4. Deve ser redirecionado de volta com sucesso

### 5.2. Verificar no Supabase Dashboard

1. Vá em **"Authentication" > "Users"**
2. Você deve ver seu usuário criado com provider "google"

---

## 📝 CHECKLIST DE CONFIGURAÇÃO:

### Google Cloud Console:
- [ ] Projeto criado
- [ ] Google+ API habilitada
- [ ] OAuth Consent Screen configurado
- [ ] OAuth Client ID criado
- [ ] Authorized redirect URIs configurados
- [ ] Client ID e Secret copiados

### Supabase:
- [ ] Google Provider habilitado
- [ ] Client ID configurado
- [ ] Client Secret configurado
- [ ] Callback URL adicionada no Google Cloud Console
- [ ] Configurações salvas

### Backend:
- [ ] Variáveis de ambiente configuradas
- [ ] GOOGLE_CLIENT_ID no .env
- [ ] GOOGLE_CLIENT_SECRET no .env
- [ ] Servidor reiniciado

### Frontend:
- [ ] Variáveis de ambiente configuradas
- [ ] VITE_GOOGLE_CLIENT_ID no .env
- [ ] Supabase client configurado

---

## 🎯 URLs IMPORTANTES:

```
Google Cloud Console:
https://console.cloud.google.com

Supabase Dashboard:
https://app.supabase.com

OAuth Authorize URL (testar):
https://<seu-project-id>.supabase.co/auth/v1/authorize?provider=google

Callback URL (Supabase):
https://<seu-project-id>.supabase.co/auth/v1/callback
```

---

## ⚠️ TROUBLESHOOTING:

### Erro: "Redirect URI mismatch"
**Solução:** 
1. Verifique se a Callback URL do Supabase está exatamente igual nos Authorized redirect URIs do Google Cloud Console
2. Não esqueça de salvar as alterações
3. Pode levar alguns minutos para propagar

### Erro: "Access blocked: This app's request is invalid"
**Solução:**
1. Verifique se habilitou a Google+ API
2. Verifique se configurou o OAuth Consent Screen
3. Adicione seu email nos Test Users

### Erro: "Invalid client_id"
**Solução:**
1. Verifique se copiou o Client ID corretamente
2. Verifique se não tem espaços em branco
3. Reinicie o servidor

### Usuário não aparece no Supabase após login
**Solução:**
1. Verifique os logs do navegador (Console)
2. Verifique se o callback URL está correto
3. Verifique as Row Level Security (RLS) policies no Supabase

---

## 🚀 PRÓXIMOS PASSOS:

Após configurar, você pode:

1. ✅ Testar OAuth flow manualmente
2. ✅ Implementar botão "Login with Google" no frontend
3. ✅ Adicionar tratamento de erros
4. ✅ Adicionar logs para debug

---

## 📚 REFERÊNCIAS:

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)

---

**Need help?** Entre em contato ou consulte a documentação oficial do Supabase.

**Status:** ✅ Configuração completa! Pronto para implementar no código.

