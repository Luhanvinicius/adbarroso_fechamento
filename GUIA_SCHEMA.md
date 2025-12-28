# 🗄️ Guia Completo: Criar Tabelas no Supabase

## ⚠️ IMPORTANTE: Execute o Schema SQL ANTES de rodar o seed!

O erro `Could not find the table 'public.congregacoes'` significa que as tabelas ainda não foram criadas no Supabase.

## 📋 Passo a Passo Detalhado

### 1️⃣ Acesse o Supabase Dashboard

1. Abra seu navegador e vá para: **https://supabase.com/dashboard**
2. Faça login na sua conta
3. Na lista de projetos, clique no projeto: **hkjvxswdpsoiidgvuyit**

### 2️⃣ Abra o SQL Editor

1. No menu lateral esquerdo, procure por **"SQL Editor"** (ícone de código `</>`)
2. Clique nele
3. Você verá uma área de texto grande no centro da tela

### 3️⃣ Copie o Schema SQL

1. Abra o arquivo `supabase/schema.sql` do seu projeto
2. **Selecione TODO o conteúdo** (Ctrl+A)
3. **Copie** (Ctrl+C)

### 4️⃣ Cole e Execute no Supabase

1. **Cole** o conteúdo no SQL Editor do Supabase (Ctrl+V)
2. Clique no botão **"Run"** (ou pressione **Ctrl+Enter**)
3. Aguarde alguns segundos...

### 5️⃣ Verifique o Resultado

Você deve ver uma mensagem de sucesso. Se houver erros, eles aparecerão em vermelho.

### 6️⃣ Confirme que as Tabelas Foram Criadas

1. No menu lateral, clique em **"Table Editor"** (ícone de tabela)
2. Você deve ver 4 tabelas listadas:
   - ✅ `congregacoes`
   - ✅ `users`
   - ✅ `movimentacoes`
   - ✅ `saldos_anteriores`

### 7️⃣ Execute o Seed

Agora sim, volte ao terminal e execute:

```bash
npm run seed
```

## 🔍 Verificação Rápida via SQL

Se quiser verificar se as tabelas existem, execute este SQL no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('congregacoes', 'users', 'movimentacoes', 'saldos_anteriores')
ORDER BY table_name;
```

Deve retornar 4 linhas.

## ❓ Problemas Comuns

### Erro: "relation already exists"
- **Solução**: Isso é normal! Significa que a tabela já existe. Pode continuar.

### Erro: "permission denied"
- **Solução**: Certifique-se de estar usando o SQL Editor e não o Table Editor.

### Erro: "syntax error"
- **Solução**: Verifique se copiou TODO o conteúdo do arquivo `supabase/schema.sql`

## 📝 Conteúdo do Schema

O schema cria:
- ✅ 4 tabelas principais
- ✅ Relacionamentos entre tabelas (foreign keys)
- ✅ Índices para performance
- ✅ Validações (CHECK constraints)
- ✅ Políticas de segurança (RLS)

## 🚀 Após Criar as Tabelas

Depois de executar o schema com sucesso:

1. Execute: `npm run seed`
2. Teste o sistema: `npm run dev`
3. Faça login com: `admin@adbarroso.com` / `admin123`


