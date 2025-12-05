# Status das Migrations - Supabase

Este documento lista todos os arquivos de migration e indica quais devem ser executados no Supabase.

## ✅ Migrations Necessárias (Devem ser Executadas)

### 1. **Tabelas e Estruturas Básicas**

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `add-category-metadata.sql` | Adiciona campo `metadata` JSONB na tabela `categories` | ✅ **Executar** |
| `add-transactions-metadata.sql` | Adiciona campo `metadata` JSONB na tabela `transactions` | ✅ **Executar** |
| `add-performance-indexes.sql` | Cria índices para melhorar performance de queries | ✅ **Executar** |

### 2. **Feature: Cash Flow (Transações Agendadas)**

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `create-scheduled-transactions-table.sql` | Cria tabela `scheduled_transactions` | ✅ **Executar** |
| `create-scheduled-transaction-executions-table.sql` | Cria tabela `scheduled_transaction_executions` | ✅ **Executar** |

### 3. **Feature: Analytics**

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `analytics-tables-migration.sql` | Cria tabelas `analytics_sessions` e `analytics_events` | ✅ **Executar** |
| `analytics-rls-policies.sql` | Cria políticas RLS para tabelas de analytics | ✅ **Executar** (após analytics-tables) |

### 4. **Feature: AI Chat**

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `create-ai-chat-tables.sql` | Cria tabelas `ai_chat_messages` e `ai_chat_usage` | ✅ **Executar** |

### 5. **Feature: Investment Calculator**

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `create-investment-calculator-tables.sql` | Cria tabelas `investment_simulations` e `investment_calculator_usage` | ✅ **Executar** |

### 6. **Feature: Invitation Link System**

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `complete-invitation-link-migration.sql` | **MIGRATION COMPLETA** - Contém todas as mudanças necessárias | ✅ **Executar APENAS ESTE** |

---

## ⚠️ Migrations Consolidadas (NÃO Executar Separadamente)

Estes arquivos estão **consolidados** dentro de `complete-invitation-link-migration.sql`:

| Arquivo | Status | Motivo |
|---------|--------|--------|
| `add-invitation-link-fields.sql` | ❌ **NÃO executar** | Consolidação incluída em `complete-invitation-link-migration.sql` |
| `allow-null-invited-user.sql` | ❌ **NÃO executar** | Consolidação incluída em `complete-invitation-link-migration.sql` |
| `update-group-invitations-rls.sql` | ❌ **NÃO executar** | Versão antiga com recursão - substituída pela versão consolidada |
| `update-group-invitations-rls-simple.sql` | ❌ **NÃO executar** | Consolidação incluída em `complete-invitation-link-migration.sql` |

**⚠️ ATENÇÃO:** Se você já executou alguns dos arquivos consolidados, execute apenas `complete-invitation-link-migration.sql`. As cláusulas `IF NOT EXISTS` e `DROP POLICY IF EXISTS` garantem que não haverá conflitos.

---

## 📋 Ordem Recomendada de Execução

### Fase 1: Estruturas Básicas
1. `add-category-metadata.sql`
2. `add-transactions-metadata.sql`
3. `add-performance-indexes.sql`

### Fase 2: Features Funcionais
4. `create-scheduled-transactions-table.sql`
5. `create-scheduled-transaction-executions-table.sql`
6. `analytics-tables-migration.sql`
7. `analytics-rls-policies.sql` (após analytics-tables)
8. `create-ai-chat-tables.sql`
9. `create-investment-calculator-tables.sql`
10. `complete-invitation-link-migration.sql`

---

## 🔍 Como Verificar se uma Migration Já Foi Executada

### Verificar campos adicionados:
```sql
-- Verificar se campo metadata existe em categories
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' AND column_name = 'metadata';

-- Verificar se invitation_token existe em group_invitations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'group_invitations' AND column_name = 'invitation_token';
```

### Verificar tabelas criadas:
```sql
-- Verificar se tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'analytics_sessions';
```

### Verificar índices criados:
```sql
-- Verificar índices de uma tabela
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'transactions';
```

### Verificar políticas RLS:
```sql
-- Verificar políticas RLS de uma tabela
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'group_invitations';
```

---

## 📝 Resumo

- **Total de migrations SQL**: 14 arquivos
- **Migrations necessárias**: 10 arquivos
- **Migrations consolidadas/obsoletas**: 4 arquivos (não executar separadamente)

**🎯 Para o sistema de invitation link:** Execute apenas `complete-invitation-link-migration.sql`. Ele contém tudo que precisa!

