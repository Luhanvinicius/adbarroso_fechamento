// Sistema de armazenamento em memória
// Funciona tanto no servidor quanto no cliente
// No servidor: dados em memória (persistem entre requisições)
// No cliente: dados salvos no localStorage

interface Database {
  users: Map<string, any>;
  congregacoes: Map<string, any>;
  movimentacoes: Map<string, any>;
  saldosAnteriores: Map<string, any>;
}

// Usar variável global para persistir entre requisições no servidor
declare global {
  var __igreja_db__: Database | undefined;
}

let db: Database;

if (typeof window === 'undefined') {
  // No servidor: usar variável global para persistir entre requisições
  if (!global.__igreja_db__) {
    global.__igreja_db__ = {
      users: new Map(),
      congregacoes: new Map(),
      movimentacoes: new Map(),
      saldosAnteriores: new Map(),
    };
  }
  db = global.__igreja_db__;
} else {
  // No cliente: criar nova instância
  db = {
    users: new Map(),
    congregacoes: new Map(),
    movimentacoes: new Map(),
    saldosAnteriores: new Map(),
  };
}

// Salvar dados no localStorage (apenas no cliente)
function saveToStorage() {
  if (typeof window !== 'undefined') {
    try {
      const data = {
        users: Array.from(db.users.entries()),
        congregacoes: Array.from(db.congregacoes.entries()),
        movimentacoes: Array.from(db.movimentacoes.entries()),
        saldosAnteriores: Array.from(db.saldosAnteriores.entries()),
      };
      localStorage.setItem('igreja_db', JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar dados:', e);
    }
  }
}

// Carregar dados do localStorage (apenas no cliente)
export function loadFromStorage() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('igreja_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        db.users = new Map(parsed.users || []);
        db.congregacoes = new Map(parsed.congregacoes || []);
        db.movimentacoes = new Map(parsed.movimentacoes || []);
        db.saldosAnteriores = new Map(parsed.saldosAnteriores || []);
        return true;
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  }
  return false;
}

// Sincronizar dados do cliente para o servidor (via API)
export function syncToServer(data: any, preserveExistingUsers: boolean = false) {
  if (typeof window === 'undefined') {
    // No servidor: atualizar diretamente
    // Os dados vêm como array de [key, value] entries
    // Garantir que global.__igreja_db__ existe
    if (!global.__igreja_db__) {
      global.__igreja_db__ = {
        users: new Map(),
        congregacoes: new Map(),
        movimentacoes: new Map(),
        saldosAnteriores: new Map(),
      };
    }
    
    // Atualizar diretamente no global para garantir persistência
    if (data.users && Array.isArray(data.users)) {
      if (preserveExistingUsers) {
        // Preservar usuários existentes, apenas adicionar novos
        const clientUsers = new Map(data.users);
        const existingUsers = global.__igreja_db__.users;
        for (const [id, user] of existingUsers.entries()) {
          if (!clientUsers.has(id)) {
            clientUsers.set(id, user);
          }
        }
        global.__igreja_db__.users = clientUsers;
      } else {
        global.__igreja_db__.users = new Map(data.users);
      }
      db.users = global.__igreja_db__.users;
    }
    if (data.congregacoes && Array.isArray(data.congregacoes)) {
      global.__igreja_db__.congregacoes = new Map(data.congregacoes);
      db.congregacoes = global.__igreja_db__.congregacoes;
    }
    if (data.movimentacoes && Array.isArray(data.movimentacoes)) {
      global.__igreja_db__.movimentacoes = new Map(data.movimentacoes);
      db.movimentacoes = global.__igreja_db__.movimentacoes;
    }
    if (data.saldosAnteriores && Array.isArray(data.saldosAnteriores)) {
      global.__igreja_db__.saldosAnteriores = new Map(data.saldosAnteriores);
      db.saldosAnteriores = global.__igreja_db__.saldosAnteriores;
    }
  }
}

export function getDatabase(): Database {
  // No servidor, sempre retorna a instância em memória
  // No cliente, carrega do localStorage se disponível
  if (typeof window === 'undefined') {
    // No servidor: garantir que estamos usando global.__igreja_db__
    if (!global.__igreja_db__) {
      global.__igreja_db__ = {
        users: new Map(),
        congregacoes: new Map(),
        movimentacoes: new Map(),
        saldosAnteriores: new Map(),
      };
    }
    db = global.__igreja_db__;
  } else {
    // No cliente: carregar do localStorage
    loadFromStorage();
  }
  return db;
}

export function saveDatabase() {
  saveToStorage();
}

// Funções auxiliares para operações de banco
export const dbOps = {
  // Acesso direto ao db (sempre pega a referência atualizada)
  get users() { 
    if (typeof window === 'undefined' && global.__igreja_db__) {
      return global.__igreja_db__.users;
    }
    return db.users; 
  },
  get congregacoes() { 
    if (typeof window === 'undefined' && global.__igreja_db__) {
      return global.__igreja_db__.congregacoes;
    }
    return db.congregacoes; 
  },
  get movimentacoes() { 
    if (typeof window === 'undefined' && global.__igreja_db__) {
      return global.__igreja_db__.movimentacoes;
    }
    return db.movimentacoes; 
  },
  get saldosAnteriores() { 
    if (typeof window === 'undefined' && global.__igreja_db__) {
      return global.__igreja_db__.saldosAnteriores;
    }
    return db.saldosAnteriores; 
  },
  
  // Users
  createUser(user: any) {
    if (typeof window === 'undefined' && global.__igreja_db__) {
      global.__igreja_db__.users.set(user.id, user);
      db = global.__igreja_db__;
    } else {
      db.users.set(user.id, user);
    }
    saveToStorage();
    return user;
  },
  
  getUserById(id: string) {
    return db.users.get(id) || null;
  },
  
  getUserByEmail(email: string) {
    const usersMap = typeof window === 'undefined' && global.__igreja_db__ 
      ? global.__igreja_db__.users 
      : db.users;
    for (const user of usersMap.values()) {
      if (user.email === email) return user;
    }
    return null;
  },
  
  getAllUsers() {
    const usersMap = typeof window === 'undefined' && global.__igreja_db__ 
      ? global.__igreja_db__.users 
      : db.users;
    return Array.from(usersMap.values());
  },
  
  // Congregações
  createCongregacao(cong: any) {
    if (typeof window === 'undefined' && global.__igreja_db__) {
      global.__igreja_db__.congregacoes.set(cong.id, cong);
      db = global.__igreja_db__;
    } else {
      db.congregacoes.set(cong.id, cong);
    }
    saveToStorage();
    return cong;
  },
  
  getCongregacaoById(id: string) {
    return db.congregacoes.get(id) || null;
  },
  
  getAllCongregacoes() {
    return Array.from(db.congregacoes.values());
  },
  
  // Movimentações
  createMovimentacao(mov: any) {
    db.movimentacoes.set(mov.id, mov);
    saveToStorage();
    return mov;
  },
  
  getMovimentacoes(filters?: {
    congregacaoId?: string;
    mes?: number;
    ano?: number;
  }) {
    let movs = Array.from(db.movimentacoes.values());
    
    if (filters?.congregacaoId) {
      movs = movs.filter(m => m.congregacaoId === filters.congregacaoId);
    }
    if (filters?.mes !== undefined) {
      movs = movs.filter(m => m.mes === filters.mes);
    }
    if (filters?.ano !== undefined) {
      movs = movs.filter(m => m.ano === filters.ano);
    }
    
    return movs.sort((a, b) => a.dia - b.dia);
  },
  
  deleteMovimentacao(id: string) {
    db.movimentacoes.delete(id);
    saveToStorage();
  },
  
  // Saldos Anteriores
  getSaldoAnterior(congregacaoId: string, mes: number, ano: number) {
    const key = `${congregacaoId}_${mes}_${ano}`;
    const saldo = db.saldosAnteriores.get(key);
    return saldo?.valor || 0;
  },
  
  setSaldoAnterior(congregacaoId: string, mes: number, ano: number, valor: number) {
    const key = `${congregacaoId}_${mes}_${ano}`;
    db.saldosAnteriores.set(key, {
      id: key,
      congregacaoId,
      mes,
      ano,
      valor,
    });
    saveToStorage();
  },
};

// Inicializar estrutura (não precisa fazer nada, mas mantém compatibilidade)
export function initializeDatabase() {
  // Estrutura já está pronta, apenas garante que está inicializada
}

export function closeDatabase() {
  saveToStorage();
}
