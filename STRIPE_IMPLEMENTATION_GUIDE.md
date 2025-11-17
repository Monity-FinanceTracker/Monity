# Guia de Implementação do Stripe - Monity

Este documento explica como a integração do Stripe foi implementada no projeto Monity, incluindo checkout sessions, webhooks, gerenciamento de assinaturas e portal de faturamento.

## Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Inicialização do Stripe](#inicialização-do-stripe)
5. [Gerenciamento de Clientes](#gerenciamento-de-clientes)
6. [Sessões de Checkout](#sessões-de-checkout)
7. [Webhooks](#webhooks)
8. [Gerenciamento de Assinaturas](#gerenciamento-de-assinaturas)
9. [Portal de Faturamento](#portal-de-faturamento)
10. [Segurança](#segurança)
11. [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## Visão Geral

O Monity usa o Stripe para processar pagamentos e gerenciar assinaturas premium. A implementação inclui:

- **Checkout Sessions**: Criação de sessões de pagamento para novas assinaturas
- **Webhooks**: Atualizações em tempo real do status de assinatura
- **Billing Portal**: Portal para clientes gerenciarem suas assinaturas
- **Customer Management**: Criação e gerenciamento automático de clientes

---

## Configuração Inicial

### 1. Instalação da Dependência

```bash
npm install stripe
```

O Stripe versão 18.5.0 está instalado no projeto.

### 2. Arquivos Principais

```
backend/
├── controllers/
│   └── billingController.js      # Lógica principal do Stripe
├── routes/
│   └── billing.js                # Rotas de billing
└── server.js                      # Configuração do webhook
```

---

## Estrutura do Banco de Dados

### Tabela `profiles`

O status de assinatura do usuário é armazenado na tabela `profiles` com os seguintes campos:

```sql
profiles (
  id UUID PRIMARY KEY,
  subscription_tier VARCHAR DEFAULT 'free',        -- 'free' ou 'premium'
  subscription_status VARCHAR DEFAULT 'inactive',  -- Status da assinatura
  stripe_customer_id VARCHAR,                     -- ID do cliente no Stripe
  stripe_subscription_id VARCHAR,                  -- ID da assinatura no Stripe
  current_period_end TIMESTAMP,                   -- Fim do período atual
  plan_price_id VARCHAR                            -- ID do preço/plano
)
```

### Campos de Assinatura

- **subscription_tier**: Tier do usuário (`free` ou `premium`)
- **subscription_status**: Status da assinatura (`active`, `trialing`, `canceled`, `inactive`)
- **stripe_customer_id**: ID único do cliente no Stripe
- **stripe_subscription_id**: ID da assinatura ativa
- **current_period_end**: Data de expiração do período atual
- **plan_price_id**: ID do preço do plano contratado

---

## Inicialização do Stripe

### Configuração Condicional

O Stripe é inicializado apenas se a chave secreta estiver disponível:

```javascript
// backend/controllers/billingController.js
const { supabaseAdmin } = require("../config/supabase");
const { logger } = require("../utils/logger");

let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
} else {
  logger.warn("STRIPE_SECRET_KEY not found. Billing features will be disabled.");
}
```

### Verificação de Disponibilidade

Todos os métodos do controller verificam se o Stripe está disponível:

```javascript
_ensureStripeAvailable() {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }
}
```

---

## Gerenciamento de Clientes

### Método: `getOrCreateStripeCustomerId`

Este método busca ou cria um cliente no Stripe:

```javascript
async getOrCreateStripeCustomerId(userId, email) {
  this._ensureStripeAvailable();
  
  // 1. Buscar customer ID existente no banco de dados
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new Error("User profile not found.");
  }

  // 2. Se já existe um customer ID, retornar
  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // 3. Criar novo cliente no Stripe
  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  // 4. Salvar o customer ID no banco de dados
  await supabaseAdmin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}
```

**Pontos importantes:**
- Usa `supabaseAdmin` para escrever no banco de dados
- Armazena o `userId` no metadata do cliente Stripe
- Retorna o customer ID existente se já houver um associado ao usuário

---

## Sessões de Checkout

### Criar Sessão de Checkout

O endpoint `POST /api/v1/billing/create-checkout-session` cria uma sessão de checkout:

```javascript
createCheckoutSession = async (req, res) => {
  const { priceId } = req.body;
  const user = req.user; // from auth middleware

  if (!user || !user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 1. Obter ou criar customer ID
    const customerId = await this.getOrCreateStripeCustomerId(
      user.id,
      user.email
    );

    // 2. Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?canceled=true`,
      customer: customerId,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error("Error creating checkout session", { error: error.message });
    res.status(500).json({ error: error.message });
  }
};
```

**Parâmetros importantes:**
- `mode: "subscription"`: Indica que é uma assinatura recorrente
- `customer`: ID do cliente no Stripe
- `metadata.supabase_user_id`: ID do usuário no Supabase (usado nos webhooks)
- `success_url` e `cancel_url`: URLs de redirecionamento após pagamento

---

## Webhooks

### Configuração no Servidor

O webhook é configurado **ANTES** do `express.json()` para preservar o corpo da requisição em formato bruto:

```javascript
// backend/server.js
const app = express();

// IMPORTANTE: Webhook ANTES do express.json()
app.post(
  "/api/v1/webhook/stripe",
  express.raw({ type: "application/json" }),
  controllers.billingController.handleWebhook
);

// Depois configurar outros middlewares
app.use(express.json());
```

**⚠️ Importante:** 
- Usar `express.raw()` é essencial para validar a assinatura do webhook
- O webhook deve vir **ANTES** de qualquer outro middleware que parseia o body

### Manipulador de Webhook

```javascript
handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Validar assinatura do webhook
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error("Webhook signature verification failed", {
      error: err.message,
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar diferentes tipos de eventos
  switch (event.type) {
    case "checkout.session.completed":
      // Tratar checkout completo
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      // Tratar mudanças na assinatura
      break;
    case "customer.subscription.deleted":
    case "invoice.payment_failed":
      // Tratar cancelamento ou falha no pagamento
      break;
  }

  res.json({ received: true });
};
```

### Eventos Tratados

#### 1. `checkout.session.completed`

Disparado quando o checkout é concluído:

```javascript
case "checkout.session.completed": {
  const checkoutSession = event.data.object;
  const { metadata: { supabase_user_id } = {}, subscription } = checkoutSession;

  if (subscription && supabase_user_id) {
    // Atualizar assinatura do usuário
    await this.handleSubscriptionChange(supabase_user_id, subscription);
  }
  break;
}
```

#### 2. `customer.subscription.created` / `customer.subscription.updated`

Atualiza a assinatura no banco de dados:

```javascript
case "customer.subscription.created":
case "customer.subscription.updated": {
  const subscriptionObject = event.data.object;
  const customerId = subscriptionObject.customer;

  // Buscar usuário pelo customer ID
  const { data: [userProfile] = [] } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId);

  if (userProfile) {
    await this.handleSubscriptionChange(userProfile.id, subscriptionObject.id);
  }
  break;
}
```

#### 3. `customer.subscription.deleted` / `invoice.payment_failed`

Remove ou desativa a assinatura:

```javascript
case "customer.subscription.deleted":
case "invoice.payment_failed": {
  const deletedSub = event.data.object;
  const deletedCustId = deletedSub.customer;

  // Buscar usuário pelo customer ID
  const { data: [deletedProfile] = [] } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", deletedCustId);

  if (deletedProfile) {
    // Reverter para free tier
    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_tier: "free",
        subscription_status: "canceled",
        stripe_subscription_id: null,
        current_period_end: null,
        plan_price_id: null,
      })
      .eq("id", deletedProfile.id);
  }
  break;
}
```

---

## Gerenciamento de Assinaturas

### Método: `handleSubscriptionChange`

Este método atualiza o status da assinatura no banco de dados:

```javascript
async handleSubscriptionChange(supabase_user_id, stripe_subscription_id) {
  // 1. Recuperar assinatura do Stripe
  const subscription = await stripe.subscriptions.retrieve(stripe_subscription_id);

  // 2. Determinar tier e status
  const newStatus = subscription.status;
  const newTier = (newStatus === "active" || newStatus === "trialing") 
    ? "premium" 
    : "free";

  // 3. Extrair price ID
  const priceId = subscription.items.data[0].price.id;

  // 4. Calcular período de término
  let currentPeriodEnd = null;
  if (subscription.current_period_end && typeof subscription.current_period_end === "number") {
    currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  }

  // 5. Atualizar banco de dados
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: newTier,
      subscription_status: newStatus,
      stripe_subscription_id: subscription.id,
      current_period_end: currentPeriodEnd,
      plan_price_id: priceId,
    })
    .eq("id", supabase_user_id)
    .select();

  if (error) {
    throw error;
  }

  return { success: true, userId: supabase_user_id, tier: newTier, status: newStatus };
}
```

**Lógica de Tier:**
- `subscription_tier = "premium"` se status for `active` ou `trialing`
- `subscription_tier = "free"` para outros status

### Pagamentos Únicos

O sistema também suporta pagamentos únicos (sem assinatura recorrente):

```javascript
async handleOneTimePayment(supabase_user_id, checkoutSession) {
  // Para pagamentos únicos, dar 1 mês de premium
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: "premium",
      subscription_status: "active",
      stripe_subscription_id: null, // Sem assinatura
      current_period_end: currentPeriodEnd.toISOString(),
      plan_price_id: null,
    })
    .eq("id", supabase_user_id);
}
```

---

## Portal de Faturamento

O portal de faturamento permite que clientes gerenciem suas assinaturas:

```javascript
createBillingPortalSession = async (req, res) => {
  const user = req.user;

  try {
    // Obter customer ID
    const customerId = await this.getOrCreateStripeCustomerId(
      user.id,
      user.email
    );

    // Criar sessão do portal
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`,
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error("Error creating billing portal session", {
      error: error.message,
    });
    res.status(500).json({ error: error.message });
  }
};
```

**Funcionalidades do Portal:**
- Atualizar método de pagamento
- Visualizar histórico de pagamentos
- Cancelar assinatura
- Baixar faturas

---

## Segurança

### 1. Verificação de Assinatura de Webhook

O Stripe valida a assinatura de cada webhook:

```javascript
event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
```

- **Endpoint Secret**: `STRIPE_WEBHOOK_SECRET` da variável de ambiente
- **Assinatura**: Headers `stripe-signature` da requisição
- **Body Raw**: Usa `express.raw()` para preservar o corpo original

### 2. Autenticação

Todas as rotas de billing requerem autenticação:

```javascript
router.post(
  "/create-checkout-session",
  middleware.auth.authenticate,  // Requer token JWT
  controllers.billingController.createCheckoutSession
);
```

### 3. Metadata Seguro

O `supabase_user_id` é armazenado no metadata do Stripe para evitar fraude:

```javascript
metadata: {
  supabase_user_id: user.id,
}
```

### 4. Logging

Todos os eventos críticos são logados:

```javascript
logger.info("Processing checkout.session.completed", {
  sessionId: checkoutSession.id,
  userId: supabase_user_id,
  subscriptionId: subscription,
});
```

---

## Variáveis de Ambiente

### Requeridas

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...                    # Chave secreta do Stripe
STRIPE_WEBHOOK_SECRET=whsec_...                  # Secret do webhook
VITE_STRIPE_PRICE_PREMIUM_MONTHLY=price_...      # ID do preço mensal
VITE_STRIPE_PRICE_ID=price_...                   # ID do preço (alternativo)

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:5173       # URL base do frontend
```

### Configuração do Webhook no Stripe Dashboard

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Clique em "Add endpoint"
3. URL do endpoint: `https://yourdomain.com/api/v1/webhook/stripe`
4. Eventos a selecionar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copie o "Signing secret" para a variável `STRIPE_WEBHOOK_SECRET`

---

## Fluxo Completo de Assinatura

### 1. Usuário Inicia Upgrade

```
Frontend → POST /api/v1/billing/create-checkout-session
```

### 2. Backend Cria Sessão de Checkout

```
→ Busca/cria customer ID no Stripe
→ Cria sessão de checkout
→ Retorna URL de checkout
```

### 3. Usuário Completa Pagamento

```
Frontend → Redireciona para Stripe Checkout
→ Usuário preenche dados do cartão
→ Pagamento processado
```

### 4. Webhook Atualiza Status

```
Stripe → POST /api/v1/webhook/stripe
→ Valida assinatura
→ Processa evento checkout.session.completed
→ Atualiza subscription_tier no banco
```

### 5. Frontend Atualiza Interface

```
Frontend → GET /api/v1/subscription-tier/
→ Retorna tier atualizado
→ Interface exibe features premium
```

---

## Checklist de Implementação

### Backend

- [ ] Instalar pacote `stripe`
- [ ] Configurar variáveis de ambiente
- [ ] Criar `billingController.js`
- [ ] Criar rotas em `billing.js`
- [ ] Configurar webhook em `server.js`
- [ ] Adicionar campos na tabela `profiles`

### Frontend

- [ ] Criar página de assinatura
- [ ] Adicionar botão de upgrade
- [ ] Implementar check de tier premium
- [ ] Adicionar proteção de rotas premium

### Stripe Dashboard

- [ ] Criar produto e preço
- [ ] Configurar webhook endpoint
- [ ] Testar eventos com Stripe CLI

---

## Testando a Implementação

### 1. Usar Stripe CLI para Testar Webhooks Localmente

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Encaminhar webhooks para servidor local
stripe listen --forward-to localhost:3000/api/v1/webhook/stripe

# Em outro terminal, disparar evento de teste
stripe trigger checkout.session.completed
```

### 2. Testar em Modo de Teste

- Use cartões de teste do Stripe
- Ex: `4242 4242 4242 4242` (sucesso)
- Ex: `4000 0000 0000 0002` (falha)

### 3. Verificar Logs

```javascript
logger.info("Subscription updated", {
  userId,
  tier,
  status
});
```

---

## Resolução de Problemas

### Webhook Não Recebe Eventos

- Verificar se a URL está acessível publicamente
- Usar ngrok para desenvolvimento local
- Verificar logs de erros na assinatura

### Assinatura Não Atualiza

- Verificar logs do webhook
- Confirmar que `supabase_user_id` está no metadata
- Verificar conexão com banco de dados

### Erro de Assinatura Inválida

- Verificar `STRIPE_WEBHOOK_SECRET`
- Garantir que `express.raw()` está configurado
- Verificar se o body não foi modificado

---

## Exemplo de Uso Completo

### Backend Controller

```javascript
class BillingController {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async getOrCreateStripeCustomerId(userId, email) {
    // Busca ou cria customer
  }

  createCheckoutSession = async (req, res) => {
    // Cria sessão de checkout
  }

  createBillingPortalSession = async (req, res) => {
    // Cria sessão do portal
  }

  handleWebhook = async (req, res) => {
    // Processa webhooks
  }

  async handleSubscriptionChange(userId, subscriptionId) {
    // Atualiza assinatura
  }
}
```

### Rotas

```javascript
router.post(
  "/create-checkout-session",
  middleware.auth.authenticate,
  billingController.createCheckoutSession
);

router.post(
  "/create-portal-session",
  middleware.auth.authenticate,
  billingController.createBillingPortalSession
);
```

### Server Configuration

```javascript
app.post(
  "/api/v1/webhook/stripe",
  express.raw({ type: "application/json" }),
  controllers.billingController.handleWebhook
);
```

---

## Conclusão

Esta implementação fornece uma integração completa do Stripe para assinaturas recorrentes com:

- ✅ Gerenciamento automático de clientes
- ✅ Webhooks em tempo real
- ✅ Portal de faturamento
- ✅ Suporte a pagamentos únicos
- ✅ Logging detalhado
- ✅ Tratamento de erros robusto
- ✅ Segurança via verificação de assinatura

Esta estrutura pode ser adaptada para outros projetos seguindo o mesmo padrão de arquitetura MVC.





