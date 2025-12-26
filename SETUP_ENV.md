# Configuração do Arquivo .env.local

## 📝 Instruções

1. **Copie o arquivo `.env.example` para `.env.local`:**

```bash
cp .env.example .env.local
```

Ou crie manualmente o arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Supabase Configuration - OBRIGATÓRIAS
NEXT_PUBLIC_SUPABASE_URL=https://hkjvxswdpsoiidgvuyit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhranZ4c3dkcHNvaWlkZ3Z1eWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NzY3MTUsImV4cCI6MjA4MjM1MjcxNX0.xZGmDtsSK8qv5Dr5u7pnZLr_VzUAdJQv54tUZcbi_wk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhranZ4c3dkcHNvaWlkZ3Z1eWl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc3NjcxNSwiZXhwIjoyMDgyMzUyNzE1fQ.vlP5395Fv0ElfwVEhlKAYWMqy_R8YAbgut2XFnUGXUk

# PostgreSQL Configuration (opcional - para uso direto se necessário)
POSTGRES_DATABASE=postgres
POSTGRES_HOST=db.hkjvxswdpsoiidgvuyit.supabase.co
POSTGRES_PASSWORD=xGlciq0wEgzYRs0E
POSTGRES_PRISMA_URL=postgres://postgres.hkjvxswdpsoiidgvuyit:xGlciq0wEgzYRs0E@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL=postgres://postgres.hkjvxswdpsoiidgvuyit:xGlciq0wEgzYRs0E@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.hkjvxswdpsoiidgvuyit:xGlciq0wEgzYRs0E@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_USER=postgres

# Supabase Additional Keys (opcional)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhranZ4c3dkcHNvaWlkZ3Z1eWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NzY3MTUsImV4cCI6MjA4MjM1MjcxNX0.xZGmDtsSK8qv5Dr5u7pnZLr_VzUAdJQv54tUZcbi_wk
SUPABASE_JWT_SECRET=NbMJifY/BcIPogtIrHPEhxor+tbOmQ5hGtmppQTBxZ8iTz5YRSwk9NXWwZW+PUidDIzDODIrFPa+f0Sn8uywCg==
SUPABASE_PUBLISHABLE_KEY=sb_publishable_97TJdq37FxsP-Xd32L3dvA_7lFuKaGm
SUPABASE_SECRET_KEY=sb_secret_pP6g2phs4x1yFImq755tNg_h8jKWSyh
SUPABASE_URL=https://hkjvxswdpsoiidgvuyit.supabase.co
```

## ✅ Variáveis Obrigatórias

Para o sistema funcionar, você precisa **apenas** destas 3 variáveis:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

As outras variáveis são opcionais e podem ser úteis para integrações futuras.

## 🔒 Segurança

⚠️ **IMPORTANTE**: O arquivo `.env.local` está no `.gitignore` e **NÃO** será commitado no Git. Isso é correto para manter suas credenciais seguras.

## 🚀 Próximos Passos

Após criar o `.env.local`:

1. Execute `npm install`
2. Execute o schema SQL no Supabase (`supabase/schema.sql`)
3. Execute `npm run seed` para popular o banco
4. Execute `npm run dev` para testar localmente

