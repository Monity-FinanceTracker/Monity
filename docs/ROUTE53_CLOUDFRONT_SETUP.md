# 📍 Route 53 + CloudFront - Configuração Correta

Guia passo a passo para configurar DNS no Route 53 apontando para CloudFront.

---

## ❌ Erro Comum

Se você está vendo:
```
Value is not a valid IPv4 address
```

**Causa:** Você colocou o domínio do CloudFront (`d380hazpiz3if5.cloudfront.net`) no campo "Value" quando o Alias está habilitado.

---

## ✅ Solução Correta

### Passo 1: Acessar Route 53

1. Vá para [Route 53 Console](https://console.aws.amazon.com/route53/)
2. Clique em **Hosted zones**
3. Selecione `monity-finance.com`

### Passo 2: Criar Registro A com Alias

1. Clique em **Create record**

### Passo 3: Configurar o Registro

**IMPORTANTE:** Siga EXATAMENTE nesta ordem:

1. **Record name:** `app`
   - (Isso cria `app.monity-finance.com`)

2. **Record type:** `A - Routes traffic to an IPv4 address`

3. **Alias:** ✅ **HABILITE** (toggle para ON)

4. **Route traffic to:**
   - **NÃO** coloque nada no campo "Value" ainda!
   - **Selecione na dropdown:**
     - Escolha: **Alias to CloudFront distribution**
     - Depois aparecerá uma nova dropdown: **CloudFront distribution**
     - **Selecione sua distribuição:**
       - Deve aparecer algo como: `monity-frontend-cloudfront (EBCS9HQJKWAWI)`
       - OU digite o ID da distribuição: `EBCS9HQJKWAWI`

5. **Routing policy:** `Simple routing`

6. **Evaluate target health:** Deixe **desmarcado**

7. Clique em **Create records**

---

## 📸 O Que Deve Aparecer

Quando configurado corretamente, você verá:

```
Record name: app
Record type: A
Alias: [ON] ✅
Route traffic to: Alias to CloudFront distribution
CloudFront distribution: monity-frontend-cloudfront (EBCS9HQJKWAWI)
```

**NÃO deve ter** `d380hazpiz3if5.cloudfront.net` no campo Value!

---

## 🔍 Como Encontrar o ID da Distribuição

Se não aparecer na lista:

1. Vá para [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Encontre sua distribuição `monity-frontend-cloudfront`
3. O **ID** está ao lado do nome (ex: `EBCS9HQJKWAWI`)
4. Use esse ID na dropdown

---

## ⚠️ Alternativa: Usar "Switch to wizard"

Se a interface "Quick create" não estiver funcionando:

1. No Route 53, clique em **Switch to wizard** (canto superior direito)
2. Escolha **Simple routing**
3. Clique em **Next**
4. Configure:
   - **Subdomain:** `app`
   - **Record type:** `A`
   - **Alias:** ✅ Enable
   - **Alias target:** CloudFront distribution
   - Selecione sua distribuição
5. Clique em **Create records**

---

## ✅ Após Criar o Registro

1. Aguarde 2-5 minutos para propagação DNS
2. Teste:
   ```bash
   dig app.monity-finance.com
   ```
   Deve retornar IPs do CloudFront

3. Acesse no navegador:
   ```
   https://app.monity-finance.com
   ```

---

## 🚨 Se Ainda Não Funcionar

### Verificar Distribuição CloudFront

1. CloudFront → Sua distribuição → **General**
2. Verifique que **Alternate domain names** tem: `app.monity-finance.com`
3. Verifique que **Custom SSL certificate** está configurado
4. Status deve ser **Deployed** (não "Deploying")

### Verificar Origin

1. CloudFront → **Origins and origin groups**
2. Origin domain deve ser: `seu-bucket.s3-website-us-east-1.amazonaws.com`
3. **NÃO** deve ser: `seu-bucket.s3.amazonaws.com`

### Verificar S3

1. S3 → Seu bucket → **Properties** → **Static website hosting**
2. Deve estar **Enabled**
3. Index document: `index.html`
4. Teste a URL do website endpoint diretamente

---

## 📋 Checklist Final

- [ ] Registro A criado no Route 53
- [ ] Alias habilitado
- [ ] Route traffic to: **Alias to CloudFront distribution** (não o domínio diretamente)
- [ ] Distribuição CloudFront selecionada
- [ ] Aguardou 2-5 minutos para propagação DNS
- [ ] CloudFront tem `app.monity-finance.com` em Alternate domain names
- [ ] SSL certificate configurado no CloudFront
- [ ] Origin aponta para website endpoint do S3

---

## 🎯 Resumo

**NÃO faça:**
```
Value: d380hazpiz3if5.cloudfront.net  ❌
```

**FAÇA:**
```
Route traffic to: Alias to CloudFront distribution
CloudFront distribution: [Selecione da lista]  ✅
```

O Route 53 automaticamente resolve o domínio do CloudFront quando você seleciona a distribuição!

---

Depois de configurar, aguarde alguns minutos e teste. Me avise se funcionou! 🚀

