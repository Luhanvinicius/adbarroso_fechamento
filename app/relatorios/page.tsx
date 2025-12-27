'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { User, UserRole } from '@/types';
import { fetchCongregacoes, fetchRelatorio, fetchMovimentacoes, fetchSaldoAnterior } from '@/lib/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function RelatoriosPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [congregacoes, setCongregacoes] = useState<any[]>([]);
  const [relatorio, setRelatorio] = useState<any>(null);
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [saldoAnterior, setSaldoAnterior] = useState(0);
  const [corrigindoValores, setCorrigindoValores] = useState(false);
  
  const currentDate = new Date();
  const [selectedCongregacao, setSelectedCongregacao] = useState('');
  const [selectedMes, setSelectedMes] = useState(currentDate.getMonth() + 1);
  const [selectedAno, setSelectedAno] = useState(currentDate.getFullYear());

  useEffect(() => {
    const loadData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      const userObj = JSON.parse(userData);
      setUser(userObj);
      
      try {
        const congs = await fetchCongregacoes();
        setCongregacoes(congs);
        
        if (userObj.congregacaoId) {
          setSelectedCongregacao(userObj.congregacaoId);
        } else if (congs.length > 0) {
          setSelectedCongregacao(congs[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [router]);

  useEffect(() => {
    const loadRelatorio = async () => {
      if (!selectedCongregacao) {
        console.log('Nenhuma congregação selecionada');
        return;
      }
      
      console.log('Carregando relatório:', { selectedCongregacao, selectedMes, selectedAno });
      
      try {
        const [rel, movs, saldo] = await Promise.all([
          fetchRelatorio(selectedCongregacao, selectedMes, selectedAno),
          fetchMovimentacoes({ congregacaoId: selectedCongregacao, mes: selectedMes, ano: selectedAno }),
          fetchSaldoAnterior(selectedCongregacao, selectedMes, selectedAno)
        ]);
        
        console.log('Dados carregados:', { rel, movs, saldo });
        
        setRelatorio(rel);
        setMovimentacoes(movs);
        setSaldoAnterior(saldo);
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        setRelatorio(null);
        setMovimentacoes([]);
        setSaldoAnterior(0);
      }
    };
    
    loadRelatorio();
  }, [selectedCongregacao, selectedMes, selectedAno]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const meses = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }));

  const anos = Array.from({ length: 5 }, (_, i) => {
    const ano = currentDate.getFullYear() - 2 + i;
    return { value: ano.toString(), label: ano.toString() };
  });

  const chartData = relatorio ? [
    { name: 'Dízimo', value: relatorio.totalDizimo },
    { name: 'Ofertas', value: relatorio.totalOfertas },
    { name: 'Outros', value: relatorio.totalOutros },
  ] : [];

  const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8'];

  const barData = relatorio ? [
    { name: 'Entradas', valor: relatorio.totalEntradas },
    { name: 'Saídas', valor: relatorio.totalSaidas },
    { name: 'Saldo Final', valor: relatorio.saldoFinal },
  ] : [];

  // Calcular saldo acumulado para cada movimentação
  const calcularSaldoAcumulado = (index: number) => {
    let saldo = saldoAnterior;
    for (let i = 0; i <= index; i++) {
      const mov = movimentacoes[i];
      if (mov.tipo === 'entrada') {
        saldo += mov.valor;
      } else {
        saldo -= mov.valor;
      }
    }
    return saldo;
  };

  const handleCorrigirValores = async () => {
    if (!confirm('Tem certeza que deseja corrigir os valores de Novembro/2025? Isso irá remover e reinserir todas as movimentações.')) {
      return;
    }

    setCorrigindoValores(true);
    try {
      const response = await fetch('/api/corrigir-valores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao corrigir valores');
      }

      alert(`✅ Valores corrigidos com sucesso!\n\nTotais:\n- Dízimo: R$ ${data.totais.dizimo}\n- Ofertas: R$ ${data.totais.ofertas}\n- Total Entradas: R$ ${data.totais.totalEntradas}\n- Total Saídas: R$ ${data.totais.totalSaidas}\n- Saldo Final: R$ ${data.totais.saldoFinal}\n\nMovimentações inseridas: ${data.movimentacoesInseridas}`);

      // Recarregar dados
      if (selectedCongregacao) {
        const [rel, movs, saldo] = await Promise.all([
          fetchRelatorio(selectedCongregacao, selectedMes, selectedAno),
          fetchMovimentacoes({ congregacaoId: selectedCongregacao, mes: selectedMes, ano: selectedAno }),
          fetchSaldoAnterior(selectedCongregacao, selectedMes, selectedAno)
        ]);
        setRelatorio(rel);
        setMovimentacoes(movs);
        setSaldoAnterior(saldo);
      }
    } catch (error: any) {
      alert('Erro ao corrigir valores: ' + error.message);
    } finally {
      setCorrigindoValores(false);
    }
  };

  // Obter nome da congregação selecionada
  const congregacaoNome = congregacoes.find(c => c.id === selectedCongregacao)?.name || '';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={user.role as UserRole} userName={user.name} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header 
          title="Relatórios Financeiros" 
          subtitle="Análise e visualização de dados"
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Filtros */}
            <Card className="mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {(!user.congregacaoId || user.role === 'admin' || user.role === 'presidente_campo' || user.role === 'tesoureiro_campo') && (
                  <div className={user.congregacaoId && user.role !== 'admin' && user.role !== 'presidente_campo' && user.role !== 'tesoureiro_campo' ? 'hidden' : ''}>
                    <Select
                      label="Congregação"
                      value={selectedCongregacao}
                      onChange={(e) => setSelectedCongregacao(e.target.value)}
                      options={congregacoes.map(c => ({ value: c.id, label: c.name }))}
                    />
                  </div>
                )}
                <Select
                  label="Mês"
                  value={selectedMes.toString()}
                  onChange={(e) => setSelectedMes(parseInt(e.target.value))}
                  options={meses}
                />
                <Select
                  label="Ano"
                  value={selectedAno.toString()}
                  onChange={(e) => setSelectedAno(parseInt(e.target.value))}
                  options={anos}
                />
              </div>
              {/* Botão para corrigir valores - apenas para Nov/2025 e Pici */}
              {selectedMes === 11 && selectedAno === 2025 && selectedCongregacao && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCorrigirValores}
                    disabled={corrigindoValores}
                    className="w-full sm:w-auto px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {corrigindoValores ? 'Corrigindo...' : '🔧 Corrigir Valores de Novembro/2025'}
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Este botão irá remover e reinserir todas as movimentações de Nov/2025 para corrigir os valores conforme a planilha.
                  </p>
                </div>
              )}
            </Card>

            {relatorio && (
              <>
                {/* Título do Relatório */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-church-dark">
                    Campo do Barroso II - {getMonthName(selectedMes)} de {selectedAno}
                  </h2>
                  {congregacaoNome && (
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Congregação: {congregacaoNome}
                    </p>
                  )}
                </div>

                {/* Resumo */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Saldo Anterior</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-church-dark">
                      {formatCurrency(relatorio.saldoAnterior)}
                    </p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Entradas</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                      {formatCurrency(relatorio.totalEntradas)}
                    </p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Saídas</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
                      {formatCurrency(relatorio.totalSaidas)}
                    </p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Saldo Final</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-church-blue">
                      {formatCurrency(relatorio.saldoFinal)}
                    </p>
                  </Card>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <Card title="Distribuição de Entradas" className="overflow-hidden">
                    {chartData.length > 0 && chartData.some(d => d.value > 0) && (
                      <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px] p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={chartData.filter(d => d.value > 0)} 
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="value" fill="#0284c7" radius={[0, 4, 4, 0]}>
                              {chartData.filter(d => d.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {(!chartData.length || !chartData.some(d => d.value > 0)) && (
                      <div className="h-[250px] sm:h-[300px] lg:h-[350px] flex items-center justify-center text-gray-400">
                        Nenhum dado disponível
                      </div>
                    )}
                  </Card>

                  <Card title="Movimentação Financeira" className="overflow-hidden">
                    {barData.length > 0 && (
                      <div className="w-full" style={{ height: '250px', minHeight: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="valor" fill="#0284c7" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Detalhamento */}
                <Card title="Detalhamento de Entradas" className="mb-4 sm:mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Dízimo</h4>
                      <p className="text-lg sm:text-xl font-bold text-green-700">
                        {formatCurrency(relatorio.totalDizimo)}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Ofertas</h4>
                      <p className="text-lg sm:text-xl font-bold text-blue-700">
                        {formatCurrency(relatorio.totalOfertas)}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Outros</h4>
                      <p className="text-lg sm:text-xl font-bold text-purple-700">
                        {formatCurrency(relatorio.totalOutros)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Tabela Detalhada de Movimentações */}
                <Card title="Movimentações Detalhadas" className="mb-4 sm:mb-6">
                  <Table className="min-w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="sticky left-0 bg-church-blue z-10 whitespace-nowrap">DIA</TableHead>
                            <TableHead className="min-w-[200px] whitespace-nowrap">DESCRIÇÃO</TableHead>
                            <TableHead className="whitespace-nowrap">DÍZIMO</TableHead>
                            <TableHead className="whitespace-nowrap">OFERTAS</TableHead>
                            <TableHead className="whitespace-nowrap">OUTROS</TableHead>
                            <TableHead className="whitespace-nowrap">TOTAL ENTRADA</TableHead>
                            <TableHead className="whitespace-nowrap">SAÍDAS</TableHead>
                            <TableHead className="whitespace-nowrap">SALDO</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Saldo Anterior */}
                          <TableRow className="bg-gray-50 font-semibold hover:bg-gray-50">
                            <TableCell className="font-bold">SALDO ANTERIOR</TableCell>
                            <TableCell colSpan={6}></TableCell>
                            <TableCell className="font-bold text-right">{formatCurrency(saldoAnterior)}</TableCell>
                          </TableRow>
                          
                          {/* Movimentações */}
                          {movimentacoes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                                Nenhuma movimentação encontrada para este período
                              </TableCell>
                            </TableRow>
                          ) : (
                            movimentacoes.map((mov, index) => {
                              const saldo = calcularSaldoAcumulado(index);
                              return (
                                <TableRow key={mov.id}>
                                  <TableCell className="font-medium">{mov.dia}</TableCell>
                                  <TableCell className="min-w-[200px]">{mov.descricao}</TableCell>
                                  <TableCell className="text-right">
                                    {mov.tipo === 'entrada' && mov.categoriaEntrada === 'dizimo' 
                                      ? formatCurrency(mov.valor) 
                                      : '-'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {mov.tipo === 'entrada' && mov.categoriaEntrada === 'ofertas' 
                                      ? formatCurrency(mov.valor) 
                                      : '-'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {mov.tipo === 'entrada' && mov.categoriaEntrada === 'outros' 
                                      ? formatCurrency(mov.valor) 
                                      : '-'}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {mov.tipo === 'entrada' ? formatCurrency(mov.valor) : '-'}
                                  </TableCell>
                                  <TableCell className="text-right text-red-600 font-medium">
                                    {mov.tipo === 'saida' ? formatCurrency(mov.valor) : '-'}
                                  </TableCell>
                                  <TableCell className="text-right font-bold">
                                    {formatCurrency(saldo)}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                          
                          {/* Totais */}
                          {movimentacoes.length > 0 && (
                            <TableRow className="bg-gray-800 text-white font-bold hover:bg-gray-800">
                              <TableCell className="text-white font-bold">TOTAIS</TableCell>
                              <TableCell colSpan={1} className="text-white"></TableCell>
                              <TableCell className="text-right text-white font-bold">{formatCurrency(relatorio.totalDizimo)}</TableCell>
                              <TableCell className="text-right text-white font-bold">{formatCurrency(relatorio.totalOfertas)}</TableCell>
                              <TableCell className="text-right text-white font-bold">{formatCurrency(relatorio.totalOutros)}</TableCell>
                              <TableCell className="text-right text-white font-bold">{formatCurrency(relatorio.totalEntradas)}</TableCell>
                              <TableCell className="text-right text-white font-bold">{formatCurrency(relatorio.totalSaidas)}</TableCell>
                              <TableCell className="text-right text-white font-bold">{formatCurrency(relatorio.saldoFinal)}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

