// Script para criar as tabelas no Supabase automaticamente
// Execute: npx tsx scripts/create-tables.ts

// Carregar variáveis de ambiente do .env.local manualmente
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (key && cleanValue) {
          process.env[key] = cleanValue;
        }
      }
    }
  });
  console.log('✅ Variáveis de ambiente carregadas');
} else {
  console.error('❌ Arquivo .env.local não encontrado!');
  process.exit(1);
}

import { supabaseAdmin } from '../lib/supabase';

async function createTables() {
  try {
    console.log('🔧 Criando tabelas no Supabase...\n');

    // Criar tabela congregacoes
    console.log('📋 Criando tabela congregacoes...');
    try {
      const { error: errorCongregacoes } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS congregacoes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            campo VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(name, campo)
          );
        `
      });
      if (errorCongregacoes) {
        console.log('⚠️  RPC não disponível, usando método alternativo...');
      }
    } catch (error) {
      // Se RPC não funcionar, tentar via query direta
      console.log('⚠️  RPC não disponível, usando método alternativo...');
    }

    // Método alternativo: usar query SQL direta
    const schemaSQL = `
-- Tabela de Congregações
CREATE TABLE IF NOT EXISTS congregacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  campo VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, campo)
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'presidente_campo', 'pastor', 'tesoureiro_campo', 'tesoureiro_congregacao', 'lider_congregacao')),
  campo VARCHAR(255),
  congregacao_id UUID REFERENCES congregacoes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Movimentações
CREATE TABLE IF NOT EXISTS movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia INTEGER NOT NULL CHECK (dia >= 1 AND dia <= 31),
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria_entrada VARCHAR(20) CHECK (categoria_entrada IN ('dizimo', 'ofertas', 'outros')),
  valor DECIMAL(10, 2) NOT NULL CHECK (valor >= 0),
  congregacao_id UUID NOT NULL REFERENCES congregacoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Saldos Anteriores
CREATE TABLE IF NOT EXISTS saldos_anteriores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL,
  valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
  congregacao_id UUID NOT NULL REFERENCES congregacoes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(congregacao_id, mes, ano)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_congregacao ON users(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_congregacao ON movimentacoes(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_periodo ON movimentacoes(congregacao_id, mes, ano);
CREATE INDEX IF NOT EXISTS idx_saldos_anteriores_congregacao ON saldos_anteriores(congregacao_id, mes, ano);

-- Habilitar RLS
ALTER TABLE congregacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldos_anteriores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Allow all operations on congregacoes for service role" ON congregacoes;
CREATE POLICY "Allow all operations on congregacoes for service role"
  ON congregacoes FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on users for service role" ON users;
CREATE POLICY "Allow all operations on users for service role"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on movimentacoes for service role" ON movimentacoes;
CREATE POLICY "Allow all operations on movimentacoes for service role"
  ON movimentacoes FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on saldos_anteriores for service role" ON saldos_anteriores;
CREATE POLICY "Allow all operations on saldos_anteriores for service role"
  ON saldos_anteriores FOR ALL
  USING (true)
  WITH CHECK (true);
    `;

    console.log('⚠️  Não é possível criar tabelas automaticamente via API.');
    console.log('📝 Você precisa executar o schema SQL manualmente no Supabase Dashboard.\n');
    console.log('📋 Siga estes passos:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá em "SQL Editor"');
    console.log('4. Copie e cole o conteúdo do arquivo: supabase/schema.sql');
    console.log('5. Clique em "Run"\n');
    console.log('📄 Ou copie este SQL:\n');
    console.log('─'.repeat(60));
    console.log(schemaSQL);
    console.log('─'.repeat(60));

    process.exit(1);
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createTables();

