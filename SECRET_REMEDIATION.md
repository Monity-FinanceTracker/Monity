# Remediação de Segredo Exposto - GitGuardian

## 🔴 Problema Identificado

O GitGuardian detectou um JWT (JSON Web Token) hardcoded no arquivo `frontend/.env.production` no commit `33a4875`.

**Secret detectado:**
- **Tipo:** JSON Web Token (Supabase ANON KEY)
- **Arquivo:** `frontend/.env.production`
- **Commit:** `33a4875`
- **Status:** ⚠️ Secret exposto no histórico do Git

## 📋 Ações de Remediação

### 1. ✅ Verificação Inicial

- [x] Arquivo `.env.production` já está no `.gitignore`
- [x] Arquivo `.env.production.example` existe e está correto (sem secrets)
- [x] Arquivo atual não está mais no repositório (removido)

### 2. 🔄 Rotação do Secret (CRÍTICO)

**AÇÃO IMEDIATA NECESSÁRIA:**

Como o JWT do Supabase foi exposto, você DEVE rotacionar a chave:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Vá em **Settings** > **API**
3. Gere uma nova **anon key**
4. Atualize a variável de ambiente em todos os ambientes:
   - Ambiente de produção (Vercel/Netlify/etc)
   - Ambiente de desenvolvimento local
   - Qualquer outro ambiente que use essa chave

### 3. 🧹 Limpeza do Histórico do Git (Opcional mas Recomendado)

**⚠️ ATENÇÃO:** Reescrever o histórico do Git pode afetar outros desenvolvedores. Siga estas etapas com cuidado.

#### Opção A: Usando git-filter-repo (Recomendado)

```bash
# Instalar git-filter-repo se necessário
pip install git-filter-repo

# Remover o arquivo do histórico
git filter-repo --path frontend/.env.production --invert-paths

# Forçar push (CUIDADO: avise toda a equipe antes!)
git push origin --force --all
git push origin --force --tags
```

#### Opção B: Usando BFG Repo-Cleaner

```bash
# Baixar BFG Repo-Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/

# Remover o arquivo do histórico
java -jar bfg.jar --delete-files .env.production

# Limpar e fazer push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

#### Opção C: Remover apenas o conteúdo do arquivo no commit específico

Se você não quiser reescrever todo o histórico, pode criar um novo commit que remove o conteúdo:

```bash
# Criar um commit que remove o conteúdo sensível
git checkout 33a4875
# Editar o arquivo para remover o secret
git commit --amend
git push origin --force
```

**⚠️ IMPORTANTE:** 
- Avise TODA a equipe antes de fazer force push
- Todos os desenvolvedores precisarão fazer `git pull --rebase` ou recriar seus clones
- Considere criar uma branch de backup antes: `git branch backup-before-cleanup`

### 4. ✅ Verificações Pós-Remediação

Após a remediação, verifique:

- [ ] Secret foi rotacionado no Supabase
- [ ] Variáveis de ambiente atualizadas em todos os ambientes
- [ ] Arquivo `.env.production` não está mais no histórico (se optou por limpar)
- [ ] `.gitignore` está configurado corretamente
- [ ] Arquivo `.env.production.example` existe e está atualizado

### 5. 🛡️ Prevenção Futura

Para evitar que isso aconteça novamente:

#### a) Instalar GitGuardian CLI no pre-commit

```bash
# Instalar GitGuardian CLI
pip install ggshield

# Configurar pre-commit hook
ggshield install

# Ou adicionar ao .pre-commit-config.yaml
```

#### b) Verificar antes de commitar

```bash
# Scan antes de fazer push
ggshield scan pre-commit

# Scan de um arquivo específico
ggshield secret scan path frontend/.env.production
```

#### c) Configurar pre-commit hook manualmente

Crie `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Verificar se arquivos .env estão sendo commitados
if git diff --cached --name-only | grep -E '\.env$|\.env\.(local|production|development)$'; then
    echo "❌ ERRO: Arquivos .env não devem ser commitados!"
    echo "Use .env.example como template."
    exit 1
fi
```

#### d) Adicionar ao package.json (se usar npm scripts)

```json
{
  "scripts": {
    "precommit": "ggshield scan pre-commit || exit 1"
  }
}
```

## 📚 Boas Práticas

### ✅ FAZER:
- ✅ Usar arquivos `.env.example` como templates
- ✅ Armazenar secrets em variáveis de ambiente do sistema/hosting
- ✅ Usar serviços de gerenciamento de secrets (AWS Secrets Manager, HashiCorp Vault, etc.)
- ✅ Verificar secrets antes de commitar
- ✅ Usar diferentes chaves para dev/staging/production

### ❌ NÃO FAZER:
- ❌ Commitar arquivos `.env` com secrets
- ❌ Hardcodar secrets no código
- ❌ Compartilhar secrets em mensagens, issues ou PRs
- ❌ Usar a mesma chave em múltiplos ambientes
- ❌ Ignorar alertas de segurança

## 🔗 Recursos Adicionais

- [GitGuardian Best Practices](https://docs.gitguardian.com/internal-repositories-monitoring/integrations/git_hooks/pre_commit)
- [Supabase Security Guide](https://supabase.com/docs/guides/platform/security)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## 📝 Checklist de Remediação

- [ ] Secret rotacionado no Supabase
- [ ] Variáveis de ambiente atualizadas em produção
- [ ] Variáveis de ambiente atualizadas em desenvolvimento
- [ ] Histórico do Git limpo (se aplicável)
- [ ] Equipe notificada sobre mudanças
- [ ] GitGuardian CLI instalado e configurado
- [ ] Pre-commit hooks configurados
- [ ] Documentação atualizada

## 🔍 Verificações Realizadas

### Arquivos no Histórico do Git
- ✅ `frontend/.env.production` - **CONTÉM SECRET** (commit 33a4875)
- ⚠️ `.env` - Verificar se contém secrets (encontrado no histórico)
- ✅ `frontend/.env.production.example` - Sem secrets (correto)
- ✅ `backend/.env.example` - Verificado (sem secrets)

### Configurações Atuais
- ✅ `.gitignore` configurado corretamente para ignorar arquivos `.env*`
- ✅ GitHub Actions usando secrets do GitHub (correto)
- ✅ Arquivo de exemplo existe e está correto

### Próximos Passos
1. **URGENTE:** Rotacionar a chave do Supabase
2. Atualizar variáveis de ambiente em todos os ambientes
3. Considerar limpar o histórico do Git (após avisar a equipe)
4. Instalar GitGuardian CLI para prevenção futura

---

**Data da remediação:** _Preencher após conclusão_  
**Responsável:** _Preencher_  
**Status:** 🔄 Em andamento

