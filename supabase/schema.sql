-- Schema do Banco de Dados - Sistema AD Barroso
-- Execute este script no Supabase SQL Editor

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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_congregacao ON users(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_congregacao ON movimentacoes(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_periodo ON movimentacoes(congregacao_id, mes, ano);
CREATE INDEX IF NOT EXISTS idx_saldos_anteriores_congregacao ON saldos_anteriores(congregacao_id, mes, ano);

-- Habilitar Row Level Security (RLS)
ALTER TABLE congregacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldos_anteriores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir tudo para service_role, ajustar conforme necessário)
-- Em produção, você deve criar políticas mais restritivas

-- Política para congregacoes (todos podem ler)
CREATE POLICY "Allow all operations on congregacoes for service role"
  ON congregacoes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para users (todos podem ler, mas apenas service_role pode modificar)
CREATE POLICY "Allow all operations on users for service role"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para movimentacoes
CREATE POLICY "Allow all operations on movimentacoes for service role"
  ON movimentacoes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para saldos_anteriores
CREATE POLICY "Allow all operations on saldos_anteriores for service role"
  ON saldos_anteriores FOR ALL
  USING (true)
  WITH CHECK (true);


