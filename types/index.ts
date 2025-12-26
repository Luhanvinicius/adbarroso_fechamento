export type UserRole = 
  | 'admin' 
  | 'presidente_campo'  // Pr. Presidente do Campo - tem acesso admin + assina fechamento
  | 'pastor' 
  | 'tesoureiro_campo' 
  | 'tesoureiro_congregacao' 
  | 'lider_congregacao';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campo?: string; // Campo ao qual o usuário pertence
  congregacaoId?: string;
  createdAt: Date;
}

export interface Congregacao {
  id: string;
  name: string;
  campo: string;
  createdAt: Date;
}

export interface Movimentacao {
  id: string;
  dia: number;
  mes: number;
  ano: number;
  descricao: string;
  tipo: 'entrada' | 'saida';
  categoriaEntrada?: 'dizimo' | 'ofertas' | 'outros';
  valor: number;
  congregacaoId: string;
  userId: string;
  createdAt: Date;
}

export interface SaldoAnterior {
  id: string;
  mes: number;
  ano: number;
  valor: number;
  congregacaoId: string;
}

export interface RelatorioMensal {
  mes: number;
  ano: number;
  congregacaoId: string;
  saldoAnterior: number;
  totalDizimo: number;
  totalOfertas: number;
  totalOutros: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
  movimentacoes: Movimentacao[];
}

