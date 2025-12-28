# 🚀 Setup Rápido do Banco de Dados

## ⚡ Método Mais Rápido (Recomendado)

### 1. Acesse o SQL Editor do Supabase

**Link direto:** https://supabase.com/dashboard/project/hkjvxswdpsoiidgvuyit/sql/new

Ou:
1. Acesse: https://supabase.com/dashboard
2. Clique no projeto: **hkjvxswdpsoiidgvuyit**
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New query"**

### 2. Copie e Cole o Schema SQL

1. Abra o arquivo `supabase/schema.sql` no seu projeto
2. **Selecione TODO o conteúdo** (Ctrl+A)
3. **Copie** (Ctrl+C)
4. **Cole no SQL Editor** do Supabase (Ctrl+V)
5. Clique em **"Run"** (ou pressione Ctrl+Enter)

### 3. Verifique se Funcionou

Você deve ver uma mensagem de sucesso. Se houver erros de "already exists", pode ignorar - significa que as tabelas já existem.

### 4. Execute o Seed

Agora execute no terminal:

```bash
npm run seed
```

## ✅ Pronto!

Agora você pode executar:

```bash
npm run dev
```

E acessar: http://localhost:3000

---

## 🔍 Verificar Tabelas Criadas

No Supabase Dashboard, vá em **"Table Editor"** e você deve ver:
- ✅ `congregacoes`
- ✅ `users`
- ✅ `movimentacoes`
- ✅ `saldos_anteriores`


