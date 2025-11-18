# 🔧 Solução Rápida para Remover Secret do Histórico

## Situação Atual
- Secret detectado no commit `33a4875` no arquivo `frontend/.env.production`
- O arquivo já foi removido do working directory
- O secret ainda está no histórico do Git do branch `feature/groups-enhancements`
- GitGuardian continua detectando o secret no PR #98

## ⚡ Solução Rápida (Recomendada para PR)

Como estamos em um branch de feature, a solução mais simples é usar `git filter-branch` apenas no branch atual:

### Passo 1: Fazer backup
```powershell
git branch backup-before-secret-removal
```

### Passo 2: Remover do histórico do branch
```powershell
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch frontend/.env.production" --prune-empty feature/groups-enhancements
```

### Passo 3: Limpar referências antigas
```powershell
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Passo 4: Verificar que foi removido
```powershell
git log --oneline --all -- frontend/.env.production
# Não deve retornar nada
```

### Passo 5: Force push do branch
```powershell
git push origin feature/groups-enhancements --force
```

## ⚠️ IMPORTANTE

1. **Avise a equipe** antes de fazer force push
2. **Verifique** que o secret foi realmente removido antes de fazer push
3. **Rotacione a chave do Supabase** mesmo após remover do histórico (o secret já foi exposto)

## 🔄 Alternativa: Usar git-filter-repo (Mais Moderno)

Se você tem Python instalado:

```powershell
# Instalar git-filter-repo
pip install git-filter-repo

# Remover apenas do branch atual
git filter-repo --path frontend/.env.production --invert-paths --refs feature/groups-enhancements

# Force push
git push origin feature/groups-enhancements --force
```

## ✅ Verificação Pós-Remediação

Após executar os comandos:

1. Verifique que o arquivo não está mais no histórico:
   ```powershell
   git log --oneline --all -- frontend/.env.production
   ```

2. Verifique que o GitGuardian não detecta mais o secret (o scan será executado automaticamente no PR)

3. **ROTACIONAR A CHAVE DO SUPABASE** (crítico - o secret já foi exposto)

## 🚨 Se Algo Der Errado

Se você precisar reverter:

```powershell
# Restaurar do backup
git checkout backup-before-secret-removal
git branch -D feature/groups-enhancements
git checkout -b feature/groups-enhancements backup-before-secret-removal
```

---

**Nota:** Este processo reescreve o histórico do branch. Todos que têm o branch local precisarão fazer:
```powershell
git fetch origin
git reset --hard origin/feature/groups-enhancements
```

