# Como Executar o Schema SQL no Supabase

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `hkjvxswdpsoiidgvuyit`

### 2. Abra o SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique no botão **"New query"** (Nova consulta)

### 3. Execute o Schema

1. Abra o arquivo `supabase/schema.sql` do projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique no botão **"Run"** (ou pressione Ctrl+Enter)

### 4. Verifique se as Tabelas Foram Criadas

1. No menu lateral, vá em **"Table Editor"**
2. Você deve ver 4 tabelas:
   - ✅ `congregacoes`
   - ✅ `users`
   - ✅ `movimentacoes`
   - ✅ `saldos_anteriores`

### 5. Execute o Seed

Depois que as tabelas estiverem criadas, execute:

```bash
npm run seed
```

## ⚠️ Importante

- O schema cria as tabelas com todas as colunas necessárias
- Também cria os índices para melhor performance
- Configura as políticas RLS (Row Level Security)
- Se alguma tabela já existir, você pode ver um erro - isso é normal, pode ignorar

## 🔍 Verificação Rápida

Se quiser verificar se as tabelas existem via SQL:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('congregacoes', 'users', 'movimentacoes', 'saldos_anteriores');
```

Deve retornar 4 linhas, uma para cada tabela.


