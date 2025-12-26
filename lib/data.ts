// Re-exportar funções do banco de dados para manter compatibilidade
export {
  getAllCongregacoes as congregacoes,
  getAllUsers as users,
  getMovimentacoes,
  createMovimentacao as addMovimentacao,
  getSaldoAnterior,
  setSaldoAnterior,
  getRelatorioMensal,
  getCongregacaoById,
  getUserById,
} from './db-operations';

