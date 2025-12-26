import { supabaseAdmin } from './supabase';
import { User, Congregacao, Movimentacao, SaldoAnterior, RelatorioMensal } from '@/types';
import bcrypt from 'bcryptjs';

// ============ USUÁRIOS ============
export async function createUser(user: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User> {
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: user.role,
      campo: user.campo || null,
      congregacao_id: user.congregacaoId || null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as User['role'],
    campo: data.campo || undefined,
    congregacaoId: data.congregacao_id || undefined,
    createdAt: new Date(data.created_at),
  };
}

export async function getUserByEmail(email: string): Promise<(User & { password: string }) | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role as User['role'],
    campo: data.campo || undefined,
    congregacaoId: data.congregacao_id || undefined,
    createdAt: new Date(data.created_at),
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as User['role'],
    campo: data.campo || undefined,
    congregacaoId: data.congregacao_id || undefined,
    createdAt: new Date(data.created_at),
  };
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('name');

  if (error) throw error;

  return (data || []).map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as User['role'],
    campo: user.campo || undefined,
    congregacaoId: user.congregacao_id || undefined,
    createdAt: new Date(user.created_at),
  }));
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>> & { password?: string }): Promise<User> {
  const updateData: any = {};
  
  if (updates.name) updateData.name = updates.name;
  if (updates.email) updateData.email = updates.email;
  if (updates.role) updateData.role = updates.role;
  if (updates.campo !== undefined) updateData.campo = updates.campo || null;
  if (updates.congregacaoId !== undefined) updateData.congregacao_id = updates.congregacaoId || null;
  if (updates.password) {
    updateData.password = bcrypt.hashSync(updates.password, 10);
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw new Error(`Erro ao atualizar usuário: ${error.message}`);
  }

  if (!data) {
    throw new Error('Usuário não encontrado após atualização');
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as User['role'],
    campo: data.campo || undefined,
    congregacaoId: data.congregacao_id || undefined,
    createdAt: new Date(data.created_at),
  };
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

// ============ CONGREGAÇÕES ============
export async function createCongregacao(congregacao: Omit<Congregacao, 'id' | 'createdAt'>): Promise<Congregacao> {
  const { data, error } = await supabaseAdmin
    .from('congregacoes')
    .insert({
      name: congregacao.name,
      campo: congregacao.campo,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    campo: data.campo,
    createdAt: new Date(data.created_at),
  };
}

export async function getAllCongregacoes(): Promise<Congregacao[]> {
  const { data, error } = await supabaseAdmin
    .from('congregacoes')
    .select('*')
    .order('name');

  if (error) throw error;

  return (data || []).map(cong => ({
    id: cong.id,
    name: cong.name,
    campo: cong.campo,
    createdAt: new Date(cong.created_at),
  }));
}

export async function getCongregacaoById(id: string): Promise<Congregacao | null> {
  const { data, error } = await supabaseAdmin
    .from('congregacoes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    campo: data.campo,
    createdAt: new Date(data.created_at),
  };
}

// ============ MOVIMENTAÇÕES ============
export async function createMovimentacao(movimentacao: Omit<Movimentacao, 'id' | 'createdAt'>): Promise<Movimentacao> {
  const insertData = {
    dia: movimentacao.dia,
    mes: movimentacao.mes,
    ano: movimentacao.ano,
    descricao: movimentacao.descricao,
    tipo: movimentacao.tipo,
    categoria_entrada: movimentacao.categoriaEntrada || null,
    valor: movimentacao.valor,
    congregacao_id: movimentacao.congregacaoId,
    user_id: movimentacao.userId,
  };

  console.log('Criando movimentação:', insertData);

  const { data, error } = await supabaseAdmin
    .from('movimentacoes')
    .insert(insertData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Erro ao criar movimentação:', error);
    throw new Error(`Erro ao criar movimentação: ${error.message}`);
  }

  if (!data) {
    throw new Error('Movimentação não foi criada');
  }

  return {
    id: data.id,
    dia: data.dia,
    mes: data.mes,
    ano: data.ano,
    descricao: data.descricao,
    tipo: data.tipo as Movimentacao['tipo'],
    categoriaEntrada: data.categoria_entrada as Movimentacao['categoriaEntrada'] | undefined,
    valor: parseFloat(data.valor),
    congregacaoId: data.congregacao_id,
    userId: data.user_id,
    createdAt: new Date(data.created_at),
  };
}

export async function getMovimentacoes(
  congregacaoId?: string,
  mes?: number,
  ano?: number
): Promise<Movimentacao[]> {
  let query = supabaseAdmin
    .from('movimentacoes')
    .select('*');

  if (congregacaoId) {
    query = query.eq('congregacao_id', congregacaoId);
  }
  if (mes !== undefined) {
    query = query.eq('mes', mes);
  }
  if (ano !== undefined) {
    query = query.eq('ano', ano);
  }

  const { data, error } = await query.order('dia', { ascending: true });

  if (error) throw error;

  return (data || []).map(mov => ({
    id: mov.id,
    dia: mov.dia,
    mes: mov.mes,
    ano: mov.ano,
    descricao: mov.descricao,
    tipo: mov.tipo as Movimentacao['tipo'],
    categoriaEntrada: mov.categoria_entrada as Movimentacao['categoriaEntrada'] | undefined,
    valor: parseFloat(mov.valor),
    congregacaoId: mov.congregacao_id,
    userId: mov.user_id,
    createdAt: new Date(mov.created_at),
  }));
}

export async function deleteMovimentacao(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('movimentacoes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ SALDOS ANTERIORES ============
export async function getSaldoAnterior(congregacaoId: string, mes: number, ano: number): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('saldos_anteriores')
    .select('valor')
    .eq('congregacao_id', congregacaoId)
    .eq('mes', mes)
    .eq('ano', ano)
    .single();

  if (error || !data) return 0;

  return parseFloat(data.valor) || 0;
}

export async function setSaldoAnterior(
  congregacaoId: string,
  mes: number,
  ano: number,
  valor: number
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('saldos_anteriores')
    .upsert({
      congregacao_id: congregacaoId,
      mes,
      ano,
      valor,
    }, {
      onConflict: 'congregacao_id,mes,ano'
    });

  if (error) throw error;
}

// ============ RELATÓRIOS ============
export async function getRelatorioMensal(
  congregacaoId: string,
  mes: number,
  ano: number
): Promise<RelatorioMensal> {
  const movimentacoesMes = await getMovimentacoes(congregacaoId, mes, ano);
  const saldoAnterior = await getSaldoAnterior(congregacaoId, mes, ano);
  
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

