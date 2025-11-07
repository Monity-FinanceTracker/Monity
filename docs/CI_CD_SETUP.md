# 🚀 CI/CD Setup Guide - GitHub Actions

Guia completo para configurar deploy automático do frontend usando GitHub Actions.

---

## 📋 O Que Será Automatizado

Quando você fizer `git push` para `main`:
1. ✅ Build automático do frontend
2. ✅ Upload para S3
3. ✅ Invalidação de cache do CloudFront
4. ✅ Deploy em produção automático

---

## 🔧 Passo 1: Criar AWS IAM User (Para CI/CD)

### 1.1 Criar Usuário IAM

1. Vá para [IAM Console](https://console.aws.amazon.com/iam/)
2. Clique em **Users** → **Create user**
3. **User name:** `monity-github-actions`
4. Clique em **Next**

### 1.2 Anexar Políticas

1. Em **Set permissions**, selecione **Attach policies directly**
2. Clique em **Create policy**
3. Vá para a aba **JSON** e cole:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::SEU-BUCKET-NAME/*",
        "arn:aws:s3:::SEU-BUCKET-NAME"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    }
  ]
}
```

**Substitua `SEU-BUCKET-NAME` pelo nome real do seu bucket!**

4. Clique em **Next** → Nome: `MonityDeployPolicy` → **Create policy**
5. Volte para criar o usuário
6. Filtre e selecione a política `MonityDeployPolicy` que você criou
7. Clique em **Next** → **Create user**

### 1.3 Criar Access Keys

1. Clique no usuário criado
2. Aba **Security credentials**
3. Clique em **Create access key**
4. Selecione **Application running outside AWS**
5. Clique em **Next** → **Create access key**
6. **IMPORTANTE:** Copie:
   - **Access key ID**
   - **Secret access key** (só aparece uma vez!)

7. Guarde essas credenciais - vamos usar no GitHub Secrets

---

## 🔐 Passo 2: Configurar GitHub Secrets

### 2.1 Acessar Secrets

1. Vá para seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**

### 2.2 Adicionar Secrets

Adicione os seguintes secrets:

#### Secret 1: AWS_ACCESS_KEY_ID
- **Name:** `AWS_ACCESS_KEY_ID`
- **Value:** Cole o Access key ID que você copiou
- Clique em **Add secret**

#### Secret 2: AWS_SECRET_ACCESS_KEY
- **Name:** `AWS_SECRET_ACCESS_KEY`
- **Value:** Cole o Secret access key que você copiou
- Clique em **Add secret**

#### Secret 3: AWS_REGION
- **Name:** `AWS_REGION`
- **Value:** `us-east-1` (ou sua região)
- Clique em **Add secret**

#### Secret 4: S3_BUCKET_NAME
- **Name:** `S3_BUCKET_NAME`
- **Value:** Nome do seu bucket S3 (ex: `monity-frontend`)
- Clique em **Add secret**

#### Secret 5: CLOUDFRONT_DISTRIBUTION_ID
- **Name:** `CLOUDFRONT_DISTRIBUTION_ID`
- **Value:** ID da sua distribuição CloudFront (ex: `E1234567890ABC`)
- Você encontra em: CloudFront Console → Distribuição → ID
- Clique em **Add secret**

#### Secret 6: VITE_API_URL
- **Name:** `VITE_API_URL`
- **Value:** `https://api.monity-finance.com/api/v1`
- Clique em **Add secret**

#### Secret 7: VITE_SUPABASE_URL
- **Name:** `VITE_SUPABASE_URL`
- **Value:** Sua URL do Supabase
- Clique em **Add secret**

#### Secret 8: VITE_SUPABASE_ANON_KEY
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Sua chave anon do Supabase
- Clique em **Add secret**

---

## 📝 Passo 3: Verificar Workflow File

### 3.1 Verificar Estrutura

O arquivo `.github/workflows/deploy.yml` já deve estar criado no repositório.

Se não estiver, crie:
```
Monity/
  .github/
    workflows/
      deploy.yml
```

### 3.2 Verificar Conteúdo

O workflow deve estar configurado para:
- ✅ Trigger em push para `main`/`master`/`production`
- ✅ Build do frontend
- ✅ Deploy para S3
- ✅ Invalidação do CloudFront

---

## 🚀 Passo 4: Testar Deploy Automático

### 4.1 Fazer Push

```bash
# No seu repositório local
cd Monity/frontend

# Fazer uma pequena mudança (ex: atualizar comentário)
# Ou apenas fazer push do código existente

git add .
git commit -m "Setup CI/CD for automated deployment"
git push origin main
```

### 4.2 Verificar Deploy

1. Vá para seu repositório no GitHub
2. Clique na aba **Actions**
3. Você verá o workflow rodando em tempo real
4. Aguarde completar (geralmente 2-5 minutos)

### 4.3 Verificar Logs

- Clique no workflow que está rodando
- Clique no job **deploy**
- Veja os logs em tempo real
- Se der erro, os logs mostram o problema

---

## ✅ Passo 5: Verificar Resultado

### 5.1 Verificar S3

1. Vá para S3 Console
2. Verifique que arquivos foram atualizados
3. Verifique timestamps dos arquivos

### 5.2 Verificar Site

1. Aguarde 2-5 minutos (propagação CloudFront)
2. Acesse `https://app.monity-finance.com`
3. Suas mudanças devem estar live! 🎉

---

## 🔄 Workflow Detalhado

### Quando o CI/CD Roda?

1. **Push para `main`/`master`/`production`** com mudanças em `frontend/`
2. **Trigger manual** via GitHub Actions UI
3. **Pull Request** (opcional - pode configurar)

### O Que Acontece?

1. **Checkout:** Clona o código
2. **Setup Node:** Instala Node.js 20
3. **Install:** `npm ci` (instala dependências)
4. **Env:** Cria `.env.production` com secrets
5. **Build:** `npm run build` (gera pasta `dist/`)
6. **AWS Config:** Configura credenciais AWS
7. **Deploy S3:** Upload de arquivos para S3
8. **Invalidate CF:** Invalida cache do CloudFront
9. **Done:** Deploy completo! ✅

---

## 🎯 Branch Strategy (Opcional)

### Desenvolvimento → Staging → Produção

Você pode configurar diferentes buckets/distribuições:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches:
      - main          # Produção
      - staging       # Staging
      - develop       # Desenvolvimento

jobs:
  deploy:
    steps:
      - name: Set S3 Bucket
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "BUCKET=monity-frontend-prod" >> $GITHUB_ENV
          elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
            echo "BUCKET=monity-frontend-staging" >> $GITHUB_ENV
          else
            echo "BUCKET=monity-frontend-dev" >> $GITHUB_ENV
          fi
```

---

## 🚨 Troubleshooting

### Erro: "Access Denied" no S3

**Solução:**
- Verifique IAM policy tem permissões para o bucket
- Verifique bucket name no secret está correto

### Erro: "Invalid CloudFront Distribution ID"

**Solução:**
- Verifique o ID está correto no secret
- ID está no formato: `E1234567890ABC`

### Erro: "Build Failed"

**Solução:**
- Verifique logs no GitHub Actions
- Teste build localmente: `npm run build`
- Verifique se secrets estão configurados

### Erro: "Missing Environment Variables"

**Solução:**
- Verifique todos os secrets estão configurados
- Verifique nomes dos secrets estão exatamente como no workflow

---

## 📊 Monitoramento

### GitHub Actions Dashboard

- Vá para **Actions** no GitHub
- Veja histórico de deploys
- Veja status (✅ sucesso, ❌ falha)

### Notificações

1. **Settings** → **Notifications**
2. Configure para receber email quando workflow falha
3. Ou use Discord/Slack notifications (via webhooks)

---

## 🔐 Segurança

### Best Practices

1. ✅ **Nunca commit credenciais** no código
2. ✅ **Use GitHub Secrets** para dados sensíveis
3. ✅ **IAM User com permissões mínimas** (só S3 + CloudFront)
4. ✅ **Rotacione access keys** periodicamente
5. ✅ **Use branch protection** no `main` (requer PR + review)

### Branch Protection (Recomendado)

1. **Settings** → **Branches**
2. Adicione rule para `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

---

## ✅ Checklist Final

- [ ] IAM User criado com permissões corretas
- [ ] Access keys criadas e guardadas
- [ ] Todos os GitHub Secrets configurados
- [ ] Workflow file criado no repositório
- [ ] Testado push e deploy automático
- [ ] Site atualizado após deploy
- [ ] Logs verificados sem erros

---

## 🎉 Pronto!

Agora você tem:

- ✅ **Deploy automático** ao fazer push
- ✅ **Build otimizado** em ambiente limpo
- ✅ **Cache invalidation** automático
- ✅ **Histórico de deploys** no GitHub
- ✅ **Notificações** de erros (opcional)

**Para atualizar o frontend, basta:**
```bash
git add .
git commit -m "Update frontend"
git push
```

E o deploy acontece automaticamente! 🚀

---

## 📚 Recursos Adicionais

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [CloudFront Invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)

