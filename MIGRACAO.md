# Guia de Migração para Supabase/PostgreSQL

## 📋 Passos para Migração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hkjvxswdpsoiidgvuyit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Criar Schema no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Execute o conteúdo do arquivo `supabase/schema.sql`
4. Verifique se todas as tabelas foram criadas:
   - `congregacoes`
   - `users`
   - `movimentacoes`
   - `saldos_anteriores`

### 4. Popular Banco de Dados (Seed)

Execute o script de seed para popular o banco com dados iniciais:

```bash
npm run seed
```

Ou execute diretamente:

```bash
npx tsx scripts/seed.ts
```

### 5. Testar Localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` e teste o login com:
- Email: `admin@adbarroso.com`
- Senha: `admin123`

## 🚀 Deploy no Vercel

### 1. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Fazer Deploy

```bash
vercel
```

Ou conecte seu repositório GitHub ao Vercel para deploy automático.

## ✅ Verificações Pós-Migração

- [ ] Schema criado no Supabase
- [ ] Dados iniciais populados (seed executado)
- [ ] Login funcionando
- [ ] Todas as rotas API funcionando
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy realizado com sucesso

## 📝 Notas Importantes

- O sistema agora usa **PostgreSQL via Supabase** ao invés de armazenamento em memória
- Todas as operações são **assíncronas** (async/await)
- O arquivo `lib/db-operations.ts` agora exporta funções do `db-operations-supabase.ts`
- O sistema antigo (`lib/db.ts`) ainda existe mas não é mais usado


