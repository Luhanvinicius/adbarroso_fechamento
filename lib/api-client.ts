// Cliente API para facilitar chamadas às APIs do servidor

export async function fetchCongregacoes() {
  const res = await fetch('/api/congregacoes');
  if (!res.ok) throw new Error('Erro ao buscar congregações');
  return res.json();
}

export async function fetchMovimentacoes(params?: {
  congregacaoId?: string;
  mes?: number;
  ano?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.congregacaoId) searchParams.set('congregacaoId', params.congregacaoId);
  if (params?.mes) searchParams.set('mes', params.mes.toString());
  if (params?.ano) searchParams.set('ano', params.ano.toString());
  
  const res = await fetch(`/api/movimentacoes?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar movimentações');
  return res.json();
}

export async function createMovimentacao(data: any) {
  const res = await fetch('/api/movimentacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao criar movimentação');
  }
  return res.json();
}

export async function fetchRelatorio(congregacaoId: string, mes: number, ano: number) {
  const url = `/api/relatorios?congregacaoId=${congregacaoId}&mes=${mes}&ano=${ano}`;
  console.log('Buscando relatório:', url);
  
  const res = await fetch(url);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('Erro ao buscar relatório:', res.status, errorData);
    throw new Error(errorData.error || 'Erro ao buscar relatório');
  }
  
  const data = await res.json();
  console.log('Relatório recebido:', data);
  return data;
}

export async function fetchSaldoAnterior(congregacaoId: string, mes: number, ano: number) {
  const res = await fetch(
    `/api/saldo-anterior?congregacaoId=${congregacaoId}&mes=${mes}&ano=${ano}`
  );
  if (!res.ok) throw new Error('Erro ao buscar saldo anterior');
  const data = await res.json();
  return data.valor;
}

export async function updateSaldoAnterior(
  congregacaoId: string,
  mes: number,
  ano: number,
  valor: number
) {
  const res = await fetch('/api/saldo-anterior', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ congregacaoId, mes, ano, valor }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao atualizar saldo anterior');
  }
  return res.json();
}

export async function fetchUsers() {
  const dbData = typeof window !== 'undefined' ? localStorage.getItem('igreja_db') : null;
  let url = '/api/usuarios';
  if (dbData) {
    url += `?dbData=${encodeURIComponent(dbData)}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar usuários');
  return res.json();
}

export async function createUser(data: any) {
  const dbData = typeof window !== 'undefined' ? localStorage.getItem('igreja_db') : null;
  const payload: any = { ...data };
  if (dbData) {
    payload.dbData = JSON.parse(dbData);
  }
  
  const res = await fetch('/api/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao criar usuário');
  }
  return res.json();
}

export async function updateUser(id: string, data: any) {
  const dbData = typeof window !== 'undefined' ? localStorage.getItem('igreja_db') : null;
  const payload: any = { ...data };
  if (dbData) {
    payload.dbData = JSON.parse(dbData);
  }
  
  const res = await fetch(`/api/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao atualizar usuário');
  }
  return res.json();
}

export async function deleteUser(id: string) {
  const dbData = typeof window !== 'undefined' ? localStorage.getItem('igreja_db') : null;
  const payload: any = {};
  if (dbData) {
    payload.dbData = JSON.parse(dbData);
  }
  
  const res = await fetch(`/api/usuarios/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao deletar usuário');
  }
  return res.json();
}

export async function createCongregacao(data: any) {
  const res = await fetch('/api/congregacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao criar congregação');
  }
  return res.json();
}

