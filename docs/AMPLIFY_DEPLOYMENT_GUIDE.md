# 🚀 AWS Amplify Deployment Guide - Landing Page (Next.js)

Guia completo passo a passo para fazer deploy da landing page Next.js no AWS Amplify.

---

## 📋 Pré-requisitos

- ✅ Repositório Git (GitHub, GitLab, Bitbucket) com o código da landing page
- ✅ Conta AWS
- ✅ Domínio configurado no Route 53 (opcional, mas recomendado)
- ✅ Next.js app funcionando localmente

---

## 🔧 Passo 1: Preparar Repositório

### 1.1 Verificar Estrutura

Certifique-se que sua landing page está em um repositório Git:

```bash
cd monity-landing-page

# Verificar estrutura
ls -la
# Deve ter: package.json, next.config.mjs, app/, etc.
```

### 1.2 Commit e Push (se ainda não fez)

```bash
# Verificar status
git status

# Se houver mudanças não commitadas:
git add .
git commit -m "Prepare for AWS Amplify deployment"
git push
```

---

## 🌐 Passo 2: Criar App no AWS Amplify

### 2.1 Acessar Amplify Console

1. Vá para [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Clique em **New app** → **Host web app**

### 2.2 Conectar Repositório

1. Escolha sua plataforma Git:
   - **GitHub** (mais comum)
   - GitLab
   - Bitbucket
   - AWS CodeCommit

2. **Autorizar conexão:**
   - Se primeira vez, clique em **Authorize** para conectar sua conta
   - Conceda permissões necessárias

3. **Selecionar repositório:**
   - Escolha o repositório que contém `monity-landing-page`
   - Selecione o branch (geralmente `main` ou `master`)

4. Clique em **Next**

### 2.3 Configurar Build Settings

O Amplify detecta automaticamente Next.js, mas vamos verificar:

#### 2.3.1 Build Settings

1. **App name:** `monity-landing-page` (ou como preferir)

2. **Environment variables (se necessário):**
   - Clique em **Add environment variable** se sua app precisa de variáveis
   - Exemplo:
     - `NEXT_PUBLIC_API_URL` = `https://api.monity-finance.com`
     - Outras variáveis públicas se necessário

3. **Build settings:**
   - O Amplify deve detectar automaticamente
   - Você pode usar o **amplify.yml** customizado (opcional)

#### 2.3.2 Criar amplify.yml (Opcional - Recomendado)

No repositório, crie `amplify.yml` na raiz:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

**OU** deixe o Amplify detectar automaticamente (geralmente funciona bem).

### 2.4 Revisar e Criar

1. Revise todas as configurações
2. Clique em **Save and deploy**

### 2.5 Aguardar Deploy

- O Amplify vai:
  1. Clonar o repositório
  2. Instalar dependências (`npm install`)
  3. Rodar build (`npm run build`)
  4. Fazer deploy

- **Tempo estimado:** 5-10 minutos
- Você verá logs em tempo real

---

## ✅ Passo 3: Verificar Deploy

### 3.1 Acessar App Deployado

Após o deploy completar:

1. Na página do app, você verá uma URL:
   - Formato: `https://main.xxxxxxxxx.amplifyapp.com`
2. Clique na URL ou copie e cole no navegador
3. Sua landing page deve estar funcionando! 🎉

### 3.2 Testar Funcionalidades

- ✅ Página carrega
- ✅ Navegação funciona
- ✅ Links funcionam
- ✅ Imagens carregam
- ✅ Sem erros no console

---

## 🔐 Passo 4: Configurar Domínio Customizado

### 4.1 Adicionar Domínio no Amplify

1. No Amplify Console, vá para seu app
2. No menu lateral, clique em **Domain management**
3. Clique em **Add domain**

### 4.2 Configurar Domínio

1. **Domain name:** Digite `monity-finance.com`
   - (sem `www` ou subdomínio - vamos configurar depois)

2. Clique em **Configure domain**

### 4.3 Configurar Subdomínios

1. Amplify sugere automaticamente:
   - `www.monity-finance.com`
   - Você pode adicionar mais se quiser

2. **Subdomains:**
   - Mantenha `www.monity-finance.com`
   - Você pode adicionar outros se necessário

3. Clique em **Configure domain**

### 4.4 Verificar Certificado SSL

- Amplify solicita automaticamente certificado SSL **GRÁTIS**
- Aguarde 5-15 minutos para validação
- Status mudará para **Available** quando pronto

### 4.5 Configurar DNS no Route 53

Amplify mostra instruções específicas, mas basicamente:

#### Opção 1: AWS Route 53 (Recomendado)

1. Amplify mostrará registros DNS para criar
2. Vá para [Route 53 Console](https://console.aws.amazon.com/route53/)
3. Clique em **Hosted zones** → `monity-finance.com`

4. **Criar registros:**

   **Registro A (Root domain):**
   - **Record name:** (deixe vazio para root)
   - **Type:** `A`
   - **Alias:** ✅ Enable
   - **Route traffic to:** Alias to CloudFront distribution
   - **CloudFront distribution:** Selecione a distribuição do Amplify
   - Create record

   **Registro CNAME (www):**
   - **Record name:** `www`
   - **Type:** `CNAME`
   - **Value:** Cole o valor que Amplify forneceu
   - Create record

#### Opção 2: Amplify Gerenciar DNS (Mais Fácil)

1. Se seu domínio está no Route 53
2. Amplify pode criar registros automaticamente
3. Clique em **Use Route 53** e siga as instruções

### 4.6 Aguardar Propagação DNS

- Geralmente 5-15 minutos
- Teste: `dig monity-finance.com` deve retornar IPs do Amplify

### 4.7 Testar Domínio

1. Aguarde DNS propagar
2. Acesse `https://monity-finance.com`
3. Deve redirecionar para sua landing page! ✅

---

## 🔄 Passo 5: Configurar Deploy Automático

### 5.1 Verificar Auto Deploy

Por padrão, Amplify faz deploy automático quando você faz push:

1. No Amplify Console → App → **App settings** → **General**
2. Verifique **Auto deployment** está habilitado

### 5.2 Branch Configuration (Opcional)

Você pode configurar diferentes branches:

1. **App settings** → **Branches**
2. Adicione branches (ex: `develop`, `staging`)
3. Cada branch terá sua própria URL

### 5.3 Preview Deploys (Pull Requests)

- Amplify cria preview deployments automaticamente para PRs
- Útil para testar antes de merge
- Configure em **App settings** → **Build settings**

---

## ⚙️ Passo 6: Environment Variables (Se Necessário)

Se sua landing page precisa de variáveis de ambiente:

1. **App settings** → **Environment variables**
2. Clique em **Manage variables**
3. Adicione variáveis:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://api.monity-finance.com`
   - (Prefixo `NEXT_PUBLIC_` é necessário para variáveis acessíveis no browser)

4. **Escopo:**
   - Selecione branches que devem usar essas variáveis
   - Ou **All branches**

5. Clique em **Save**

6. **Importante:** Após adicionar variáveis, faça um novo deploy:
   - Vá para **Deployments**
   - Clique em **Redeploy this version** ou faça push de novo

---

## 🎨 Passo 7: Custom Headers e Redirects (Opcional)

### 7.1 Configurar Redirects

Para Next.js, geralmente não precisa, mas se quiser:

1. **App settings** → **Rewrites and redirects**
2. Adicione regras se necessário
3. Next.js já gerencia isso automaticamente

### 7.2 Custom Headers

1. **App settings** → **Rewrites and redirects**
2. Adicione headers customizados se necessário

---

## 🚨 Troubleshooting

### Problema: Build Falha

**Soluções:**
1. Verifique logs de build no Amplify Console
2. Teste build localmente: `npm run build`
3. Verifique `package.json` scripts estão corretos
4. Verifique Node.js version (Amplify usa Node 18+)

### Problema: Página 404 em Rotas

**Solução:**
- Next.js no Amplify funciona automaticamente
- Se usar rotas customizadas, configure no `next.config.mjs`
- Verifique `app/` directory structure está correta

### Problema: Variáveis de Ambiente Não Funcionam

**Solução:**
- Variáveis precisam prefixo `NEXT_PUBLIC_` para serem acessíveis no browser
- Após adicionar variáveis, faça novo deploy
- Verifique que variáveis estão no escopo correto (branch)

### Problema: Imagens Não Carregam

**Solução:**
- Verifique `next.config.mjs` tem `images: { unoptimized: true }` (já tem!)
- Verifique paths das imagens estão corretos
- Verifique permissões de arquivos

### Problema: SSL Certificate Pending

**Solução:**
- Aguarde 15-30 minutos para validação
- Verifique DNS records estão corretos
- Se demorar muito, delete e recrie o domínio

---

## 📊 Custos Estimados

- **AWS Amplify:** 
  - Build minutes: 1,000 min/mês **GRÁTIS** ✅
  - Hosting: 15 GB storage + 125 GB transfer/mês **GRÁTIS** ✅
  - Depois: ~$0.01 per build minute + storage/transfer
- **SSL Certificate:** **GRÁTIS** ✅
- **Route 53:** $0.50/mês por hosted zone

**Total típico:** $0.50-2/mês para tráfego pequeno-médio

---

## ✅ Checklist Final

- [ ] Repositório Git configurado
- [ ] App criado no Amplify
- [ ] Conectado ao repositório
- [ ] Build settings configurados
- [ ] Deploy inicial completo
- [ ] App acessível via URL do Amplify
- [ ] Domínio customizado configurado
- [ ] SSL certificate validado
- [ ] DNS records criados no Route 53
- [ ] Domínio customizado funcionando
- [ ] Environment variables configuradas (se necessário)
- [ ] Auto-deploy funcionando
- [ ] Testado todas as funcionalidades

---

## 🔄 Atualizações Futuras

Para atualizar a landing page:

1. **Faça mudanças no código**
2. **Commit e push:**
   ```bash
   git add .
   git commit -m "Update landing page"
   git push
   ```
3. **Amplify detecta automaticamente** e faz novo deploy
4. Aguarde 3-5 minutos
5. Mudanças estarão live! 🚀

---

## 🎉 Pronto!

Sua landing page está agora:
- ✅ Deployada no AWS Amplify
- ✅ Com HTTPS automático
- ✅ Com domínio customizado
- ✅ Com deploy automático configurado
- ✅ Com CDN global (CloudFront automático)

**URLs:**
- **Amplify:** `https://main.xxxxx.amplifyapp.com`
- **Custom Domain:** `https://monity-finance.com`
- **WWW:** `https://www.monity-finance.com`

---

## 📚 Arquitetura Completa

Agora você tem:

1. **Backend API:** EC2 → `api.monity-finance.com`
2. **Frontend App:** S3 + CloudFront → `app.monity-finance.com`
3. **Landing Page:** AWS Amplify → `monity-finance.com`

**Tudo funcionando! 🎊**
