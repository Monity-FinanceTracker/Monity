# 🔧 Fix: "Cannot GET /" no CloudFront

Problema identificado: **Default root object está vazio** no CloudFront.

---

## ✅ Solução Rápida

### Passo 1: Configurar Default Root Object

1. Vá para [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Clique na distribuição `monity-frontend-cloudfront`
3. Vá para a aba **General**
4. Clique em **Edit** (canto superior direito)
5. Role até a seção **Settings**
6. Encontre **Default root object**
7. Digite: `index.html`
8. Clique em **Save changes**
9. Aguarde 5-10 minutos para propagação

### Passo 2: Verificar Origin (Origem)

1. Vá para a aba **Origins and origin groups**
2. Clique no origin para editar
3. Verifique o **Origin domain**:

   **❌ ERRADO:**
   ```
   seu-bucket.s3.amazonaws.com
   ```

   **✅ CORRETO:**
   ```
   seu-bucket.s3-website-us-east-1.amazonaws.com
   ```
   (deve terminar com `.s3-website-REGION.amazonaws.com`)

4. Se estiver errado:
   - Clique em **Edit**
   - Altere para o **website endpoint** do S3
   - Você encontra isso em: S3 → Seu bucket → Properties → Static website hosting
   - Clique em **Save changes**

### Passo 3: Configurar Error Pages (SPA Routing)

1. Vá para a aba **Error pages**
2. Clique em **Create custom error response**

   **Para 403:**
   - **HTTP error code:** `403: Forbidden`
   - **Customize error response:** ✅ **Yes**
   - **Response page path:** `/index.html`
   - **HTTP response code:** `200: OK`
   - Clique em **Create custom error response**

   **Para 404:**
   - Clique em **Create custom error response** novamente
   - **HTTP error code:** `404: Not Found`
   - **Customize error response:** ✅ **Yes**
   - **Response page path:** `/index.html`
   - **HTTP response code:** `200: OK`
   - Clique em **Create custom error response**

### Passo 4: Aguardar Propagação

- Aguarde 5-10 minutos
- CloudFront precisa distribuir as mudanças para todos os edge locations

### Passo 5: Testar

1. Acesse: `https://app.monity-finance.com`
2. Deve funcionar agora! ✅

---

## 🔍 Verificações Adicionais

### Verificar S3 Bucket

1. Vá para [S3 Console](https://console.aws.amazon.com/s3/)
2. Clique no seu bucket
3. Verifique:
   - ✅ Arquivos estão no bucket (incluindo `index.html`)
   - ✅ Static website hosting está habilitado
   - ✅ Index document: `index.html`
   - ✅ Error document: `index.html`

### Testar S3 Directamente

Antes do CloudFront, teste se S3 está funcionando:

1. Vá para S3 → Seu bucket → Properties → Static website hosting
2. Copie a URL do **Bucket website endpoint**
3. Cole no navegador (será HTTP, não HTTPS)
4. Deve carregar o site
5. Se não carregar, o problema está no S3, não no CloudFront

---

## 📋 Checklist Completo

- [ ] Default root object configurado como `index.html`
- [ ] Origin aponta para website endpoint do S3 (não REST endpoint)
- [ ] Error pages 403 e 404 configuradas para `/index.html` com status 200
- [ ] S3 bucket tem static website hosting habilitado
- [ ] `index.html` existe no bucket
- [ ] Aguardou 5-10 minutos após mudanças
- [ ] Testou URL do CloudFront

---

## 🚨 Se Ainda Não Funcionar

1. **Invalidar Cache do CloudFront:**
   - CloudFront → Distribuição → Aba **Invalidations**
   - Clique em **Create invalidation**
   - Digite: `/*`
   - Clique em **Create invalidation**
   - Aguarde 2-5 minutos

2. **Verificar Bucket Policy:**
   - S3 → Bucket → Permissions → Bucket policy
   - Deve permitir acesso público (GetObject)

3. **Testar URL Direta do CloudFront:**
   - Tente: `https://d380hazpiz3if5.cloudfront.net`
   - Se funcionar, o problema é DNS
   - Se não funcionar, o problema é CloudFront/S3

---

## ✅ Depois de Corrigir

Quando funcionar, você deve ver:
- ✅ Site carrega normalmente
- ✅ Navegação funciona (SPA routing)
- ✅ HTTPS funcionando (cadeado verde)
- ✅ Sem erros no console

