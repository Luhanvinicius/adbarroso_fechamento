// Wrapper para usar Supabase - migração completa
export * from './db-operations-supabase';

// Mantendo compatibilidade com código antigo (será removido após migração completa)
import { dbOps } from './db';
import { User, Congregacao, Movimentacao, SaldoAnterior, RelatorioMensal } from '@/types';
import bcrypt from 'bcryptjs';

// Funções antigas mantidas apenas para referência - NÃO USAR

// ============ USUÁRIOS ============
export function createUser(user: Omit<User, 'id' | 'createdAt'> & { password: string }): User {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  
  const newUser = {
    id,
    name: user.name,
    email: user.email,
    password: hashedPassword,
    role: user.role,
    campo: user.campo,
    congregacaoId: user.congregacaoId,
    createdAt: Date.now(),
  };
  
  dbOps.createUser(newUser);
  
  return {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
    campo: user.campo,
    congregacaoId: user.congregacaoId,
    createdAt: new Date(),
  };
}

export function getUserByEmail(email: string): (User & { password: string }) | null {
  const user = dbOps.getUserByEmail(email);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
    campo: user.campo,
    congregacaoId: user.congregacaoId,
    createdAt: new Date(user.createdAt),
  };
}

export function getUserById(id: string): User | null {
  const user = dbOps.getUserById(id);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    campo: user.campo,
    congregacaoId: user.congregacaoId,
    createdAt: new Date(user.createdAt),
  };
}

export function getAllUsers(): User[] {
  return dbOps.getAllUsers().map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    campo: user.campo,
    congregacaoId: user.congregacaoId,
    createdAt: new Date(user.createdAt),
  }));
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

// ============ CONGREGAÇÕES ============
export function createCongregacao(congregacao: Omit<Congregacao, 'id' | 'createdAt'>): Congregacao {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  const newCong = {
    id,
    name: congregacao.name,
    campo: congregacao.campo,
    createdAt: Date.now(),
  };
  
  dbOps.createCongregacao(newCong);

  return {
    id,
    name: congregacao.name,
    campo: congregacao.campo,
    createdAt: new Date(),
  };
}

export function getAllCongregacoes(): Congregacao[] {
  return dbOps.getAllCongregacoes()
    .map(cong => ({
      id: cong.id,
      name: cong.name,
      campo: cong.campo,
      createdAt: new Date(cong.createdAt),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCongregacaoById(id: string): Congregacao | null {
  const cong = dbOps.getCongregacaoById(id);
  if (!cong) return null;

  return {
    id: cong.id,
    name: cong.name,
    campo: cong.campo,
    createdAt: new Date(cong.createdAt),
  };
}

// ============ MOVIMENTAÇÕES ============
export function createMovimentacao(movimentacao: Omit<Movimentacao, 'id' | 'createdAt'>): Movimentacao {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  const newMov = {
    id,
    ...movimentacao,
    createdAt: Date.now(),
  };
  
  dbOps.createMovimentacao(newMov);

  return {
    id,
    ...movimentacao,
    createdAt: new Date(),
  };
}

export function getMovimentacoes(
  congregacaoId?: string,
  mes?: number,
  ano?: number
): Movimentacao[] {
  const movs = dbOps.getMovimentacoes({ congregacaoId, mes, ano });
  
  return movs.map(mov => ({
    id: mov.id,
    dia: mov.dia,
    mes: mov.mes,
    ano: mov.ano,
    descricao: mov.descricao,
    tipo: mov.tipo,
    categoriaEntrada: mov.categoriaEntrada,
    valor: mov.valor,
    congregacaoId: mov.congregacaoId,
    userId: mov.userId,
    createdAt: new Date(mov.createdAt),
  }));
}

export function deleteMovimentacao(id: string): void {
  dbOps.deleteMovimentacao(id);
}

// ============ SALDOS ANTERIORES ============
export function getSaldoAnterior(congregacaoId: string, mes: number, ano: number): number {
  return dbOps.getSaldoAnterior(congregacaoId, mes, ano);
}

export function setSaldoAnterior(
  congregacaoId: string,
  mes: number,
  ano: number,
  valor: number
): void {
  dbOps.setSaldoAnterior(congregacaoId, mes, ano, valor);
}

// ============ RELATÓRIOS ============
export function getRelatorioMensal(
  congregacaoId: string,
  mes: number,
  ano: number
): RelatorioMensal {
  const movimentacoesMes = getMovimentacoes(congregacaoId, mes, ano);
  const saldoAnterior = getSaldoAnterior(congregacaoId, mes, ano);
  
  const entradas = movimentacoesMes.filter(m => m.tipo === 'entrada');
  const saidas = movimentacoesMes.filter(m => m.tipo === 'saida');
  
  const totalDizimo = entradas
    .filter(e => e.categoriaEntrada === 'dizimo')
    .reduce((sum, e) => sum + e.valor, 0);
  
  const totalOfertas = entradas
    .filter(e => e.categoriaEntrada === 'ofertas')
    .reduce((sum, e) => sum + e.valor, 0);
  
  const totalOutros = entradas
    .filter(e => e.categoriaEntrada === 'outros')
    .reduce((sum, e) => sum + e.valor, 0);
  
  const totalEntradas = entradas.reduce((sum, e) => sum + e.valor, 0);
  const totalSaidas = saidas.reduce((sum, s) => sum + s.valor, 0);
  const saldoFinal = saldoAnterior + totalEntradas - totalSaidas;
  
  return {
    mes,
    ano,
    congregacaoId,
    saldoAnterior,
    totalDizimo,
    totalOfertas,
    totalOutros,
    totalEntradas,
    totalSaidas,
    saldoFinal,
    movimentacoes: movimentacoesMes,
  };
}
