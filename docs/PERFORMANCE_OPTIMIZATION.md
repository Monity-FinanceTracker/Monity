# 🚀 Performance Optimization Guide

Guia completo para otimizar performance e reduzir tempo de resposta (especialmente login).

---

## 🔍 Diagnóstico Inicial

### 1. Identificar Gargalos

Teste cada componente separadamente:

```bash
# Teste backend direto (EC2)
curl -w "\nTime: %{time_total}s\n" https://api.monity-finance.com/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Teste CloudFront
curl -w "\nTime: %{time_total}s\n" https://app.monity-finance.com

# Teste Supabase (se tiver endpoint)
curl -w "\nTime: %{time_total}s\n" https://your-project.supabase.co
```

**Meta:** Login deve levar < 2 segundos total.

---

## ⚡ Otimizações Críticas (Prioridade Alta)

### 1. Verificar Região dos Serviços

**Problema:** Serviços em regiões diferentes = alta latência.

#### Checklist de Regiões:

- ✅ **EC2 Backend:** Qual região? (ex: `us-east-1`)
- ✅ **S3 + CloudFront:** Qual região? (ex: `us-east-1`)
- ✅ **Supabase:** Qual região? (verifique no dashboard)
- ✅ **Route 53:** Global (ok)

**Solução:**
1. Todos os serviços devem estar na **mesma região** (recomendado: `us-east-1`)
2. Se Supabase estiver em região diferente, considere migrar ou criar novo projeto na região correta

#### Verificar Região do Supabase:
```bash
# No Supabase Dashboard → Settings → General
# Ou teste latência:
ping your-project.supabase.co
```

---

### 2. Otimizar Backend API (EC2)

#### A. Habilitar Gzip Compression

No seu `server.js`, adicione:

```javascript
const compression = require('compression');

// Depois do app = express()
app.use(compression());
```

Instalar:
```bash
npm install compression
```

#### B. Adicionar Caching Headers

```javascript
// Middleware para cache de respostas estáticas
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/')) {
    // APIs não devem ser cacheadas
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  next();
});
```

#### C. Otimizar Queries no Banco

Verifique queries lentas no Supabase:
1. Supabase Dashboard → Logs → Database Logs
2. Procure queries com tempo > 100ms
3. Adicione índices:

```sql
-- Exemplo: Índice para busca por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Exemplo: Índice para busca de transações
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id, date DESC);
```

#### D. Connection Pooling

Verifique se está usando connection pooling no Supabase. No `backend/.env`:

```env
# Supabase já gerencia pooling, mas verifique:
# URL deve incluir pooling se disponível
SUPABASE_URL=https://your-project.supabase.co
```

#### E. Redis Cache (Já Instalado mas Verificar)

Se já tem Redis instalado no backend, use para cache:

```javascript
// Cache de sessões e dados frequentes
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Exemplo: Cache de user lookup
async function getUserCached(userId) {
  const cached = await client.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const user = await getUserFromDB(userId);
  await client.setEx(`user:${userId}`, 300, JSON.stringify(user)); // 5min cache
  return user;
}
```

---

### 3. Otimizar CloudFront (Frontend)

#### A. Verificar Cache Headers

No CloudFront, verifique **Behaviors**:

1. CloudFront → Distribuição → **Behaviors**
2. Clique no behavior padrão → **Edit**
3. **Cache policy:**
   - Use `CachingOptimized` para produção
   - OU crie custom policy:
     - Cache TTL: 86400 (1 dia) para assets
     - Cache TTL: 0 para HTML

#### B. Compression Automático

CloudFront comprime automaticamente se:
- Origin envia `Content-Encoding: gzip`
- OU CloudFront comprime automaticamente (já habilitado por padrão)

Verifique: CloudFront → Distribuição → **Behaviors** → Compression: **On**

#### C. HTTP/2 e HTTP/3

Já deve estar habilitado, mas verifique:
- CloudFront → **General** → Supported HTTP versions: `HTTP/2, HTTP/1.1`

Para HTTP/3 (QUIC):
- CloudFront → **General** → Edit → HTTP/3: **Enabled**

---

### 4. Otimizar Frontend Bundle

#### A. Verificar Tamanho do Bundle

```bash
cd frontend
npm run build

# Verifique tamanhos:
du -sh dist/
ls -lh dist/js/*.js
```

**Meta:** Bundle total < 500KB (comprimido)

#### B. Code Splitting

O Vite já faz isso, mas verifique `vite.config.js`:

```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'router': ['react-router-dom'],
        // Separe libs grandes
      }
    }
  }
}
```

#### C. Lazy Loading de Rotas

Já implementado? Verifique `App.jsx`:

```javascript
const Dashboard = lazy(() => import('./components/Dashboard'));
const Transactions = lazy(() => import('./components/Transactions'));
// etc...
```

#### D. Imagens Otimizadas

- Use WebP format
- Lazy load imagens
- Use CDN para imagens grandes

---

### 5. Otimizar Supabase Queries

#### A. Índices no Banco

Verifique e adicione índices para queries frequentes:

```sql
-- Supabase Dashboard → SQL Editor

-- Índice para login (email lookup)
CREATE INDEX IF NOT EXISTS idx_auth_users_email 
ON auth.users(email);

-- Índice para transações por usuário
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON transactions(user_id, date DESC);

-- Índice para categorias
CREATE INDEX IF NOT EXISTS idx_categories_user_id 
ON categories(user_id);
```

#### B. Row Level Security (RLS)

RLS pode adicionar overhead. Verifique policies:

```sql
-- Otimize policies complexas
-- Use índices nas condições WHERE
```

#### C. Connection String

Use connection pooling URL se disponível no Supabase.

---

## 🔧 Otimizações de Infraestrutura

### 1. Upgrade EC2 Instance (Se Necessário)

**Verifique CPU/Memory usage:**

```bash
# SSH no EC2
ssh ubuntu@api.monity-finance.com

# Ver uso de recursos
htop
# ou
top
```

Se CPU > 70% ou Memory > 80% constantemente:
- Considere upgrade: `t3.small` → `t3.medium`

**Custo estimado:** +$15-20/mês

---

### 2. CloudFront Edge Locations

Já está usando todas (configurado como "Use all edge locations").

Para reduzir custo (mantendo performance):
- CloudFront → **General** → Edit → **Price class:** `Use only North America and Europe`

---

### 3. Database Connection Pooling

Se não está usando pooling no Supabase:

1. Supabase Dashboard → Settings → Database
2. Verifique **Connection pooling** está habilitado
3. Use connection string com pooling se disponível

---

## 📊 Monitoring e Debugging

### 1. Habilitar Logs Detalhados

#### Backend (PM2):

```bash
# Ver logs em tempo real
pm2 logs monity-backend --lines 100

# Monitorar requests lentos
pm2 logs monity-backend | grep -i "slow\|timeout"
```

#### CloudFront:

1. CloudFront → Distribuição → **Behaviors**
2. Habilite **Standard logging** (opcional, custa extra)
3. OU use CloudWatch Logs

#### Nginx (EC2):

```bash
# Ver access logs
sudo tail -f /var/log/nginx/monity-backend-access.log

# Ver apenas requests lentos
sudo tail -f /var/log/nginx/monity-backend-access.log | awk '$NF > 1 {print}'
```

---

### 2. Performance Monitoring

#### Adicionar Timing no Backend:

```javascript
// server.js
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});
```

#### Frontend Performance:

```javascript
// Adicionar no frontend
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  if (metric.value > 2000) { // > 2s
    console.warn('Slow metric:', metric);
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 🎯 Quick Wins (Implementar Primeiro)

### 1. Habilitar Gzip no Backend (5 minutos)

```bash
# No EC2
cd ~/monity-backend
npm install compression

# Editar server.js
nano server.js
# Adicione no topo: const compression = require('compression');
# Adicione após app = express(): app.use(compression());
```

### 2. Verificar Regiões (2 minutos)

- Todos serviços na mesma região?
- Supabase na mesma região do EC2?

### 3. Adicionar Índices no Banco (10 minutos)

```sql
-- Execute no Supabase SQL Editor
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
```

### 4. Invalidar Cache CloudFront (1 minuto)

```
CloudFront → Invalidations → Create invalidation → /*
```

---

## 📈 Métricas Esperadas Após Otimizações

- **Login API:** < 500ms
- **Page Load:** < 2s
- **Time to Interactive:** < 3s
- **API Response:** < 200ms (média)

---

## 🚨 Troubleshooting Lento

### Se Login Especificamente Está Lento:

1. **Verificar query no Supabase:**
   ```sql
   EXPLAIN ANALYZE 
   SELECT * FROM auth.users WHERE email = 'test@example.com';
   ```

2. **Verificar network:**
   ```bash
   # Teste latência
   ping api.monity-finance.com
   ping your-project.supabase.co
   ```

3. **Verificar backend logs:**
   ```bash
   pm2 logs monity-backend --lines 50 | grep -i login
   ```

4. **Verificar Nginx:**
   ```bash
   sudo tail -f /var/log/nginx/monity-backend-access.log | grep login
   ```

---

## ✅ Checklist de Otimização

- [ ] Gzip habilitado no backend
- [ ] Todos serviços na mesma região
- [ ] Índices criados no banco
- [ ] CloudFront compression habilitado
- [ ] Bundle size < 500KB
- [ ] HTTP/2 habilitado
- [ ] Connection pooling configurado
- [ ] Cache headers corretos
- [ ] Monitoring configurado
- [ ] Logs verificados para gargalos

---

## 🔄 Próximos Passos

1. **Implemente Quick Wins primeiro** (30 minutos)
2. **Meça performance antes e depois**
3. **Identifique o maior gargalo** usando logs
4. **Otimize especificamente o gargalo**

Me diga qual otimização você quer implementar primeiro, ou me envie os resultados dos testes de diagnóstico! 🚀

