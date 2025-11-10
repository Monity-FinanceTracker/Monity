# 🧪 Teste - Email Confirmation

## 📋 Testes Disponíveis

### **Teste 1: Reenviar Email de Confirmação**

```bash
# PowerShell
$body = @{ email = "seu.email@gmail.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/resend-confirmation" -Method POST -Body $body -ContentType "application/json"
```

**✅ Resposta esperada:**
```json
{
  "success": true,
  "message": "Email de confirmação reenviado com sucesso! Verifique sua caixa de entrada.",
  "email": "seu.email@gmail.com"
}
```

---

### **Teste 2: Verificar Status de Confirmação**

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/check-verification?email=seu.email@gmail.com"
```

**✅ Resposta esperada (não confirmado):**
```json
{
  "success": true,
  "email": "seu.email@gmail.com",
  "verified": false,
  "confirmedAt": null,
  "message": "Email ainda não foi confirmado"
}
```

**✅ Resposta esperada (confirmado):**
```json
{
  "success": true,
  "email": "seu.email@gmail.com",
  "verified": true,
  "confirmedAt": "2025-11-10T12:30:00Z",
  "message": "Email já foi confirmado"
}
```

---

## 🎯 Endpoints Implementados:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/resend-confirmation` | Reenvia email de confirmação |
| GET | `/api/auth/check-verification` | Verifica status de confirmação |

---

## 📚 Documentação Completa:

Ver: `docs/EMAIL_CONFIRMATION_SETUP.md`

