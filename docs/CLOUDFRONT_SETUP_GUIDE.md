# 🚀 CloudFront Setup Guide para Frontend

Guia passo a passo para configurar CloudFront e ter HTTPS + CDN no seu frontend.

---

## 📋 Pré-requisitos

- ✅ S3 bucket configurado com Static Website Hosting
- ✅ Arquivos já enviados para o bucket
- ✅ S3 website endpoint funcionando

---

## 🌐 Passo 1: Criar Distribuição CloudFront

### 1.1 Acessar CloudFront Console

1. Vá para [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Clique em **Create distribution**

### 1.2 Configurar Origin (Origem)

Na seção **Origin settings**:

1. **Origin domain:**
   - **NÃO use** o formato `bucket-name.s3.amazonaws.com`
   - **USE** o **website endpoint** do S3:
   - Exemplo: `seu-bucket-name.s3-website-us-east-1.amazonaws.com`
   - Você encontra isso em: S3 → Seu bucket → Properties → Static website hosting

2. **Origin path:** Deixe **vazio**

3. **Name:** Será preenchido automaticamente

4. **Origin access:**
   - Selecione **S3 bucket access** (ou Legacy access settings)
   - Escolha **Use website endpoint** (importante!)
   - Se aparecer opção de OAC/OAI, pode deixar como está

### 1.3 Configurar Default Cache Behavior

1. **Viewer protocol policy:**
   - Selecione **Redirect HTTP to HTTPS** ✅

2. **Allowed HTTP methods:**
   - Selecione **GET, HEAD, OPTIONS**
   - (Para SPA, não precisa de POST/PUT/DELETE)

3. **Cache policy:**
   - **Desenvolvimento:** Use `CachingDisabled` (para ver mudanças imediatas)
   - **Produção:** Use `CachingOptimized` (melhor performance)

4. **Origin request policy:** Deixe padrão

### 1.4 Configurar Settings

1. **Price class:**
   - Escolha conforme seu orçamento
   - `Use all edge locations` = mais caro, mais rápido globalmente
   - `Use only North America and Europe` = mais barato

2. **Alternate domain names (CNAMEs):**
   - Adicione: `app.monity-finance.com`
   - (Deixe vazio por enquanto se ainda não tem SSL)

3. **Custom SSL certificate:**
   - Se já tem certificado: Selecione
   - Se não tem: Deixe vazio por enquanto (faremos depois)

4. **Default root object:**
   - Digite: `index.html` ✅

5. **Web Application Firewall (WAF):** Deixe desabilitado (pode habilitar depois se quiser)

6. **HTTP/3:** Pode habilitar (é gratuito e melhora performance)

### 1.5 Criar Distribuição

1. Clique em **Create distribution** no final da página
2. Aguarde 10-15 minutos enquanto status mostra **Deploying**
3. Quando status mudar para **Enabled**, está pronto!

---

## 🔐 Passo 2: Solicitar Certificado SSL

### 2.1 Acessar Certificate Manager

1. Vá para [Certificate Manager Console](https://console.aws.amazon.com/acm/)
2. **IMPORTANTE:** Certifique-se de estar na região **us-east-1** (N. Virginia)
   - CloudFront só aceita certificados de us-east-1!
   - Mude a região no canto superior direito se necessário

### 2.2 Solicitar Certificado

1. Clique em **Request certificate**
2. Selecione **Request a public certificate**
3. Clique em **Next**

### 2.3 Configurar Domínio

1. **Domain name:** Digite `app.monity-finance.com`

2. **Additional names (opcional):**
   - Se quiser suportar wildcard: `*.monity-finance.com`
   - Isso permite qualquer subdomínio

3. **Validation method:**
   - Selecione **DNS validation** ✅
   - (Mais fácil que email)

4. Clique em **Request**

### 2.4 Validar Certificado

1. Você verá o certificado com status **Pending validation**

2. Clique no certificado para ver detalhes

3. Na seção **Domains**, expanda o domínio

4. Você verá um registro CNAME para adicionar no DNS

5. Clique em **Create record in Route 53** (se seu domínio está no Route 53)

   OU

   Adicione manualmente no Route 53:
   - Vá para Route 53 → Hosted zones → monity-finance.com
   - Create record:
     - **Name:** Copie do certificado (ex: `_abc123.app.monity-finance.com`)
     - **Type:** CNAME
     - **Value:** Copie do certificado
     - Create record

6. Aguarde 5-10 minutos para validação

7. Status mudará para **Issued** quando validado ✅

---

## 🔗 Passo 3: Conectar Certificado ao CloudFront

### 3.1 Atualizar Distribuição CloudFront

1. Vá para [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Clique no ID da sua distribuição
3. Vá para a aba **General**
4. Clique em **Edit**

### 3.2 Adicionar Custom Domain

1. Role até **Alternate domain names (CNAMEs)**

2. Clique em **Add item**

3. Digite: `app.monity-finance.com`

4. Role até **Custom SSL certificate**

5. Selecione seu certificado na lista (deve aparecer agora que foi validado)

6. Clique em **Save changes**

7. Aguarde 5-10 minutos para propagação

---

## 📍 Passo 4: Configurar DNS (Route 53)

### 4.1 Criar Registro DNS

1. Vá para [Route 53 Console](https://console.aws.amazon.com/route53/)
2. Clique em **Hosted zones**
3. Selecione `monity-finance.com`
4. Clique em **Create record**

### 4.2 Configurar Registro A

1. **Record name:** `app`

2. **Record type:** `A - Routes traffic to an IPv4 address`

3. **Alias:** ✅ **Enable** (marcar como Alias)

4. **Route traffic to:**
   - Selecione **Alias to CloudFront distribution**
   - Selecione sua distribuição CloudFront na lista
   - OU cole o **Distribution domain name** do CloudFront

5. **Routing policy:** Simple routing

6. **Evaluate target health:** Deixe desmarcado

7. Clique em **Create records**

### 4.3 Aguardar Propagação DNS

- Geralmente leva 2-5 minutos
- Teste: `dig app.monity-finance.com` deve retornar IPs do CloudFront

---

## ✅ Passo 5: Testar Tudo

### 5.1 Testar URLs

```bash
# 1. S3 Website Endpoint (HTTP)
http://seu-bucket-name.s3-website-us-east-1.amazonaws.com

# 2. CloudFront Distribution (HTTPS)
https://d1234567890abc.cloudfront.net

# 3. Custom Domain (HTTPS) - FINAL!
https://app.monity-finance.com
```

### 5.2 Verificar no Navegador

1. Abra `https://app.monity-finance.com`
2. Verifique:
   - ✅ Site carrega
   - ✅ HTTPS funciona (cadeado verde)
   - ✅ Navegação funciona (SPA routing)
   - ✅ API calls funcionam (abrir DevTools → Console)

### 5.3 Verificar SSL

1. Clique no cadeado verde na barra de endereço
2. Verifique que o certificado é válido
3. Certificado deve mostrar `app.monity-finance.com`

---

## 🔄 Passo 6: Configurar Error Pages (SPA Routing)

Importante para React Router funcionar corretamente!

### 6.1 Criar Custom Error Response

1. Vá para CloudFront → Sua distribuição
2. Aba **Error pages**
3. Clique em **Create custom error response**

### 6.2 Configurar Error 403

1. **HTTP error code:** `403: Forbidden`
2. **Customize error response:** ✅ **Yes**
3. **Response page path:** `/index.html`
4. **HTTP response code:** `200: OK`
5. Clique em **Create custom error response**

### 6.3 Configurar Error 404

1. Clique em **Create custom error response** novamente
2. **HTTP error code:** `404: Not Found`
3. **Customize error response:** ✅ **Yes**
4. **Response page path:** `/index.html`
5. **HTTP response code:** `200: OK`
6. Clique em **Create custom error response**

### 6.4 Aguardar Propagação

- Aguarde 5-10 minutos
- Teste navegação direta: `https://app.monity-finance.com/transactions`
- Deve funcionar agora! ✅

---

## 🚨 Troubleshooting

### Problema: "403 Forbidden" no CloudFront

**Solução:**
- Verifique que usou o **website endpoint** do S3 (não o bucket endpoint)
- Verifique bucket policy permite acesso público

### Problema: SPA Routing não funciona (404 em rotas diretas)

**Solução:**
- Configure custom error responses (Passo 6 acima)
- Certifique-se que Error document no S3 é `index.html`

### Problema: Certificado não aparece no CloudFront

**Solução:**
- Certifique-se que certificado foi solicitado em **us-east-1**
- Aguarde validação completa (status "Issued")

### Problema: DNS não resolve

**Solução:**
- Aguarde 5-10 minutos para propagação
- Verifique registro A está como Alias para CloudFront
- Teste: `dig app.monity-finance.com`

### Problema: Site carrega mas API não funciona (CORS)

**Solução:**
- Verifique backend CORS inclui `https://app.monity-finance.com`
- Verifique API URL no frontend `.env.production` está correta

---

## 📊 Custos Estimados

- **CloudFront:** ~$0.085/GB transferido (primeiro 1TB é free tier)
- **Certificate Manager:** **GRÁTIS** ✅
- **Route 53:** $0.50/mês por hosted zone
- **Total típico:** $1-5/mês para tráfego pequeno-médio

---

## ✅ Checklist Final

- [ ] CloudFront distribution criado
- [ ] Origin configurado com website endpoint do S3
- [ ] SSL certificate solicitado em us-east-1
- [ ] Certificado validado (status "Issued")
- [ ] Certificado anexado ao CloudFront
- [ ] DNS record criado no Route 53
- [ ] Custom error responses configuradas (403, 404 → index.html)
- [ ] Testado https://app.monity-finance.com
- [ ] SPA routing funciona
- [ ] API calls funcionam

---

## 🎉 Pronto!

Seu frontend agora está:
- ✅ Acessível via HTTPS
- ✅ Servido via CDN global (rápido em todo mundo)
- [ ] Com domínio customizado
- ✅ Com SPA routing funcionando

**Próximo passo:** Deploy da landing page (Next.js) no Amplify! 🚀
