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
import { fetchCongregacoes, fetchRelatorio } from '@/lib/api-client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface RelatorioMensal {
  mes: number;
  ano: number;
  saldoAnterior: number;
  totalDizimo: number;
  totalOfertas: number;
  totalOutros: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
}

export default function RelatoriosComparativosPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [congregacoes, setCongregacoes] = useState<any[]>([]);
  const [relatorios, setRelatorios] = useState<RelatorioMensal[]>([]);
  
  const currentDate = new Date();
  const [selectedCongregacao, setSelectedCongregacao] = useState('');
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
    const loadRelatoriosAnuais = async () => {
      if (!selectedCongregacao) {
        return;
      }
      
      setLoading(true);
      try {
        const relatoriosPromises = [];
        for (let mes = 1; mes <= 12; mes++) {
          relatoriosPromises.push(
            fetchRelatorio(selectedCongregacao, mes, selectedAno)
              .catch(() => null) // Retorna null se não houver dados para o mês
          );
        }
        
        const resultados = await Promise.all(relatoriosPromises);
        const relatoriosValidos = resultados
          .filter((r): r is RelatorioMensal => r !== null)
          .sort((a, b) => a.mes - b.mes); // Ordenar por mês
        setRelatorios(relatoriosValidos);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        setRelatorios([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadRelatoriosAnuais();
  }, [selectedCongregacao, selectedAno]);

  if (loading && !relatorios.length) {
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

  const anos = Array.from({ length: 5 }, (_, i) => {
    const ano = currentDate.getFullYear() - 2 + i;
    return { value: ano.toString(), label: ano.toString() };
  });

  // Preparar dados para gráficos
  const chartData = relatorios.map(rel => ({
    mes: getMonthName(rel.mes),
    mesNum: rel.mes,
    dizimo: rel.totalDizimo,
    ofertas: rel.totalOfertas,
    outros: rel.totalOutros,
    entradas: rel.totalEntradas,
    saidas: rel.totalSaidas,
    saldoFinal: rel.saldoFinal,
  })).sort((a, b) => a.mesNum - b.mesNum);

  // Calcular totais do ano
  const totaisAno = relatorios.reduce((acc, rel) => ({
    dizimo: acc.dizimo + rel.totalDizimo,
    ofertas: acc.ofertas + rel.totalOfertas,
    outros: acc.outros + rel.totalOutros,
    entradas: acc.entradas + rel.totalEntradas,
    saidas: acc.saidas + rel.totalSaidas,
  }), { dizimo: 0, ofertas: 0, outros: 0, entradas: 0, saidas: 0 });

  const saldoFinalAno = relatorios.length > 0 
    ? relatorios[relatorios.length - 1].saldoFinal 
    : 0;

  const congregacaoNome = congregacoes.find(c => c.id === selectedCongregacao)?.name || '';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={user.role as UserRole} userName={user.name} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header 
          title="Relatórios Comparativos" 
          subtitle="Comparação mês a mês do ano"
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Filtros */}
            <Card className="mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  label="Ano"
                  value={selectedAno.toString()}
                  onChange={(e) => setSelectedAno(parseInt(e.target.value))}
                  options={anos}
                />
              </div>
            </Card>

            {relatorios.length > 0 ? (
              <>
                {/* Título */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-church-dark">
                    Comparativo Anual - {selectedAno}
                  </h2>
                  {congregacaoNome && (
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Congregação: {congregacaoNome}
                    </p>
                  )}
                </div>

                {/* Resumo do Ano */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Dízimo</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                      {formatCurrency(totaisAno.dizimo)}
                    </p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Ofertas</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                      {formatCurrency(totaisAno.ofertas)}
                    </p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Entradas</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                      {formatCurrency(totaisAno.entradas)}
                    </p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Saídas</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
                      {formatCurrency(totaisAno.saidas)}
                    </p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Saldo Final</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-church-blue">
                      {formatCurrency(saldoFinalAno)}
                    </p>
                  </Card>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Gráfico de Entradas e Saídas */}
                  <Card title="Entradas vs Saídas por Mês" className="overflow-hidden">
                    <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px] p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                          <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Gráfico de Dízimo e Ofertas */}
                  <Card title="Dízimo vs Ofertas por Mês" className="overflow-hidden">
                    <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px] p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="dizimo" fill="#0284c7" name="Dízimo" />
                          <Bar dataKey="ofertas" fill="#0ea5e9" name="Ofertas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Gráfico de Saldo Final */}
                  <Card title="Evolução do Saldo Final" className="overflow-hidden">
                    <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px] p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="saldoFinal" 
                            stroke="#0284c7" 
                            strokeWidth={2}
                            name="Saldo Final"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Gráfico de Total de Entradas */}
                  <Card title="Total de Entradas por Mês" className="overflow-hidden">
                    <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px] p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="mes" type="category" width={80} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="entradas" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Tabela Comparativa */}
                <Card title="Tabela Comparativa Mensal" className="mb-4 sm:mb-6">
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">MÊS</TableHead>
                          <TableHead className="whitespace-nowrap text-right">DÍZIMO</TableHead>
                          <TableHead className="whitespace-nowrap text-right">OFERTAS</TableHead>
                          <TableHead className="whitespace-nowrap text-right">OUTROS</TableHead>
                          <TableHead className="whitespace-nowrap text-right">TOTAL ENTRADAS</TableHead>
                          <TableHead className="whitespace-nowrap text-right">SAÍDAS</TableHead>
                          <TableHead className="whitespace-nowrap text-right">SALDO FINAL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartData.map((item, index) => {
                          const rel = relatorios.find(r => r.mes === item.mesNum);
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.mes}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.dizimo)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.ofertas)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.outros)}</TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                {formatCurrency(item.entradas)}
                              </TableCell>
                              <TableCell className="text-right font-medium text-red-600">
                                {formatCurrency(item.saidas)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-church-blue">
                                {formatCurrency(item.saldoFinal)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        
                        {/* Totais */}
                        <TableRow className="bg-gray-800 text-white font-bold hover:bg-gray-800">
                          <TableCell className="text-white font-bold">TOTAIS</TableCell>
                          <TableCell className="text-right text-white font-bold">
                            {formatCurrency(totaisAno.dizimo)}
                          </TableCell>
                          <TableCell className="text-right text-white font-bold">
                            {formatCurrency(totaisAno.ofertas)}
                          </TableCell>
                          <TableCell className="text-right text-white font-bold">
                            {formatCurrency(totaisAno.outros)}
                          </TableCell>
                          <TableCell className="text-right text-white font-bold">
                            {formatCurrency(totaisAno.entradas)}
                          </TableCell>
                          <TableCell className="text-right text-white font-bold">
                            {formatCurrency(totaisAno.saidas)}
                          </TableCell>
                          <TableCell className="text-right text-white font-bold">
                            {formatCurrency(saldoFinalAno)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Nenhum dado encontrado para o ano de {selectedAno}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Selecione outro ano ou verifique se há movimentações cadastradas.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

