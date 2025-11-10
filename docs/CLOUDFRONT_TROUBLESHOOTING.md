# 🔍 CloudFront Troubleshooting - "Cannot GET /"

Mesmo com "Default root object" configurado, ainda aparece erro? Vamos diagnosticar passo a passo.

---

## ✅ Checklist de Diagnóstico

### 1. Verificar Origin (Origem) - MAIS COMUM

#### Passo a Passo:

1. CloudFront Console → Sua distribuição
2. Aba **Origins and origin groups**
3. Clique no origin para ver detalhes
4. **Verifique o Origin domain:**

**❌ ERRADO (REST Endpoint):**
```
seu-bucket.s3.amazonaws.com
```

**✅ CORRETO (Website Endpoint):**
```
seu-bucket.s3-website-us-east-1.amazonaws.com
```
(deve terminar com `.s3-website-REGION.amazonaws.com`)

#### Como Corrigir:

1. Se estiver errado, clique em **Edit**
2. **Origin domain:** Selecione ou digite o **website endpoint**
3. Você encontra o endpoint correto em:
   - S3 Console → Seu bucket → **Properties** → **Static website hosting**
   - Copie o "Bucket website endpoint"
4. **Origin path:** Deixe vazio
5. Clique em **Save changes**
6. Aguarde 5-10 minutos

---

### 2. Verificar S3 Bucket

#### Teste Direto do S3:

1. S3 Console → Seu bucket → **Properties**
2. Role até **Static website hosting**
3. Copie a URL do **Bucket website endpoint**
4. Cole no navegador (será HTTP, não HTTPS)
5. **O que deve acontecer:**
   - ✅ Se carregar: S3 está OK, problema é CloudFront
   - ❌ Se der erro: Problema está no S3

#### Verificações no S3:

**A. Static Website Hosting está habilitado?**
- Properties → Static website hosting → Deve estar **Enabled**
- Index document: `index.html`
- Error document: `index.html`

**B. Arquivos existem no bucket?**
- Objects tab → Deve ter:
  - `index.html`
  - Pasta `assets/` ou `js/` com arquivos JS
  - Pasta `css/` (se houver)
  - Outros arquivos do build

**C. Bucket Policy permite acesso público?**
- Permissions → Bucket policy → Deve ter algo como:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::SEU-BUCKET-NAME/*"
    }
  ]
}
```

**D. Block Public Access está desabilitado?**
- Permissions → Block public access → Deve estar **OFF** (todas as 4 opções desmarcadas)

---

### 3. Configurar Error Pages (SPA Routing)

Mesmo que não seja a causa do erro atual, é necessário para SPA:

1. CloudFront → Distribuição → Aba **Error pages**
2. **Create custom error response**

**Para 403:**
- HTTP error code: `403: Forbidden`
- Customize error response: ✅ **Yes**
- Response page path: `/index.html`
- HTTP response code: `200: OK`

**Para 404:**
- HTTP error code: `404: Not Found`
- Customize error response: ✅ **Yes**
- Response page path: `/index.html`
- HTTP response code: `200: OK`

---

### 4. Invalidar Cache do CloudFront

Cache antigo pode estar causando o problema:

1. CloudFront → Distribuição → Aba **Invalidations**
2. Clique em **Create invalidation**
3. Object paths: `/*`
4. Clique em **Create invalidation**
5. Aguarde 2-5 minutos para completar

---

### 5. Verificar Default Cache Behavior

1. CloudFront → Distribuição → Aba **Behaviors**
2. Clique no behavior padrão (geralmente o primeiro)
3. Verifique:

**Viewer protocol policy:**
- ✅ Deve ser: `Redirect HTTP to HTTPS` ou `HTTPS Only`

**Allowed HTTP methods:**
- ✅ Deve incluir: `GET, HEAD, OPTIONS`
- Para SPA, não precisa de POST/PUT/DELETE

**Cache policy:**
- Pode ser qualquer uma (CachingOptimized, CachingDisabled, etc.)

---

### 6. Testar URLs Diferentes

Para identificar onde está o problema:

#### Teste 1: URL Direta do CloudFront
```
https://d380hazpiz3if5.cloudfront.net
```
- ✅ Se funcionar: Problema é DNS/configuração do domínio
- ❌ Se não funcionar: Problema é CloudFront/S3

#### Teste 2: URL do S3 Website Endpoint
```
http://seu-bucket.s3-website-us-east-1.amazonaws.com
```
- ✅ Se funcionar: S3 está OK
- ❌ Se não funcionar: Problema está no S3

#### Teste 3: Domínio Customizado
```
https://app.monity-finance.com
```
- ✅ Se funcionar: Tudo OK!
- ❌ Se não funcionar: Verificar DNS ou SSL certificate

---

## 🔧 Solução Rápida (Ordem de Prioridade)

### Passo 1: Verificar Origin (5 minutos)
1. CloudFront → Origins
2. Certifique-se que aponta para `.s3-website-REGION.amazonaws.com`
3. Se não, edite e salve

### Passo 2: Testar S3 Direto (2 minutos)
1. S3 → Properties → Static website hosting
2. Copie URL do website endpoint
3. Teste no navegador

### Passo 3: Invalidar Cache (2 minutos)
1. CloudFront → Invalidations
2. Create invalidation → `/*`

### Passo 4: Aguardar (5-10 minutos)
- CloudFront precisa propagar mudanças

### Passo 5: Testar Novamente
- Tente todas as URLs de teste

---

## 🚨 Problemas Comuns e Soluções

### Problema: Origin aponta para REST endpoint

**Sintoma:** CloudFront não consegue acessar S3, ou retorna XML ao invés de HTML

**Solução:** 
- Mude origin para website endpoint
- Formato: `bucket-name.s3-website-region.amazonaws.com`

---

### Problema: S3 não tem index.html

**Sintoma:** Teste direto do S3 também falha

**Solução:**
1. Verifique que build foi feito (`npm run build`)
2. Verifique que `dist/index.html` existe
3. Faça upload para S3 novamente
4. Certifique-se que arquivo está na raiz do bucket

---

### Problema: Bucket Policy incorreta

**Sintoma:** 403 Forbidden ao testar S3 diretamente

**Solução:**
1. Permissions → Bucket policy
2. Adicione policy que permite `s3:GetObject` para `*`
3. Permissions → Block public access → Desabilite

---

### Problema: Cache antigo no CloudFront

**Sintoma:** Mudanças não aparecem, ou erro persiste mesmo após corrigir

**Solução:**
1. CloudFront → Invalidations
2. Create invalidation → `/*`
3. Aguarde completar (2-5 min)

---

### Problema: DNS não está apontando corretamente

**Sintoma:** `https://d380hazpiz3if5.cloudfront.net` funciona, mas `https://app.monity-finance.com` não

**Solução:**
1. Route 53 → Hosted zones → monity-finance.com
2. Verifique registro A para `app`:
   - Tipo: A (Alias)
   - Aponta para: CloudFront distribution
   - Distribution: Selecione a correta
3. Aguarde propagação DNS (2-5 min)

---

## 📊 Diagrama de Fluxo de Diagnóstico

```
Erro "Cannot GET /"
        ↓
Testar S3 direto (website endpoint)
        ↓
    Funciona? → Não → Problema no S3
        ↓              - Verificar arquivos
        ↓              - Verificar bucket policy
       Sim             - Verificar static website hosting
        ↓
Verificar Origin no CloudFront
        ↓
    É website endpoint? → Não → Corrigir para website endpoint
        ↓                                  ↓
       Sim                           Aguardar propagação
        ↓                                  ↓
Configurar Error Pages ←───────────────────┘
        ↓
Invalidar Cache CloudFront
        ↓
Aguardar 5-10 minutos
        ↓
Testar novamente
        ↓
    Funciona? → Não → Verificar DNS/SSL
        ↓
       Sim
        ↓
    ✅ Resolvido!
```

---

## ✅ Checklist Final

Após seguir todos os passos, verifique:

- [ ] Origin aponta para `.s3-website-REGION.amazonaws.com`
- [ ] S3 website endpoint funciona quando testado diretamente
- [ ] `index.html` existe na raiz do bucket S3
- [ ] Bucket policy permite acesso público
- [ ] Block public access está desabilitado
- [ ] Error pages 403 e 404 configuradas
- [ ] Cache do CloudFront invalidado
- [ ] Aguardou 5-10 minutos após mudanças
- [ ] Testou URL direta do CloudFront
- [ ] Testou domínio customizado

---

## 🎯 Próximos Passos

Se após seguir todos os passos ainda não funcionar:

1. **Capture os detalhes:**
   - Qual URL está testando?
   - Qual erro exato aparece?
   - Origin domain atual?
   - S3 website endpoint funciona?

2. **Verifique logs:**
   - CloudFront → Monitoring → Request logs (se habilitado)

3. **Teste com curl:**
   ```bash
   curl -I https://d380hazpiz3if5.cloudfront.net
   curl -I https://app.monity-finance.com
   ```

Me envie os resultados e posso ajudar mais especificamente! 🔍

