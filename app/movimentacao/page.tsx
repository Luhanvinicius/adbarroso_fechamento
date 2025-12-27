'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Combobox from '@/components/ui/Combobox';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { User, UserRole, Movimentacao } from '@/types';
import { 
  fetchCongregacoes,
  fetchMovimentacoes,
  createMovimentacao,
  fetchRelatorio,
  fetchSaldoAnterior,
  updateSaldoAnterior
} from '@/lib/api-client';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function MovimentacaoPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const currentDate = new Date();
  const [selectedCongregacao, setSelectedCongregacao] = useState('');
  const [selectedMes, setSelectedMes] = useState(currentDate.getMonth() + 1);
  const [selectedAno, setSelectedAno] = useState(currentDate.getFullYear());
  
  const [formData, setFormData] = useState({
    dia: currentDate.getDate(),
    descricao: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    categoriaEntrada: 'dizimo' as 'dizimo' | 'ofertas' | 'outros',
    valor: 0,
    culto: '',
  });

  const cultosPadrao = [
    'Doutrina',
    'Família',
    'Adoração',
    'Vitória',
    'Missões',
    'Santa Ceia',
    'Ações de Graça',
  ];

  const [saldoAnterior, setSaldoAnteriorValue] = useState(0);
  const [congregacoes, setCongregacoes] = useState<any[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [relatorio, setRelatorio] = useState<any>(null);

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
    const loadMovimentacoes = async () => {
      if (!selectedCongregacao) return;
      
      try {
        const [movs, rel, saldo] = await Promise.all([
          fetchMovimentacoes({ congregacaoId: selectedCongregacao, mes: selectedMes, ano: selectedAno }),
          fetchRelatorio(selectedCongregacao, selectedMes, selectedAno),
          fetchSaldoAnterior(selectedCongregacao, selectedMes, selectedAno),
        ]);
        
        setMovimentacoes(movs);
        setRelatorio(rel);
        setSaldoAnteriorValue(saldo);
      } catch (error) {
        console.error('Erro ao carregar movimentações:', error);
      }
    };
    
    loadMovimentacoes();
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

  const updateDescricaoAutomatica = (data: typeof formData) => {
    if (data.tipo === 'entrada' && data.culto && data.valor > 0) {
      const categoriaTexto = data.categoriaEntrada === 'dizimo' ? 'dízimo' : 
                             data.categoriaEntrada === 'ofertas' ? 'oferta' : 'entrada';
      const valorFormatado = data.valor.toFixed(2).replace('.', ',');
      const descricao = `Culto de ${data.culto} - ${categoriaTexto} de ${valorFormatado} reais`;
      setFormData({ ...data, descricao });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCongregacao) {
      alert('Selecione uma congregação');
      return;
    }

    // Validar se a congregação existe
    const congregacaoExiste = congregacoes.some(c => c.id === selectedCongregacao);
    if (!congregacaoExiste) {
      alert('Congregação selecionada não é válida. Por favor, selecione novamente.');
      return;
    }

    if (!user?.id) {
      alert('Usuário não identificado. Por favor, faça login novamente.');
      return;
    }

    try {
      console.log('Enviando movimentação:', {
        ...formData,
        mes: selectedMes,
        ano: selectedAno,
        congregacaoId: selectedCongregacao,
        userId: user.id,
      });
      
      await createMovimentacao({
        ...formData,
        mes: selectedMes,
        ano: selectedAno,
        congregacaoId: selectedCongregacao,
        userId: user.id,
      });

      setFormData({
        dia: currentDate.getDate(),
        descricao: '',
        tipo: 'entrada',
        categoriaEntrada: 'dizimo',
        valor: 0,
        culto: '',
      });
      setShowForm(false);
      setEditingId(null);
      
      // Recarregar dados
      const [movs, rel] = await Promise.all([
        fetchMovimentacoes({ congregacaoId: selectedCongregacao, mes: selectedMes, ano: selectedAno }),
        fetchRelatorio(selectedCongregacao, selectedMes, selectedAno),
      ]);
      setMovimentacoes(movs);
      setRelatorio(rel);
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar movimentação');
    }
  };

  const handleSaldoAnteriorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseFloat(e.target.value) || 0;
    setSaldoAnteriorValue(valor);
    if (selectedCongregacao) {
      try {
        await updateSaldoAnterior(selectedCongregacao, selectedMes, selectedAno, valor);
        // Recarregar relatório
        const rel = await fetchRelatorio(selectedCongregacao, selectedMes, selectedAno);
        setRelatorio(rel);
      } catch (error: any) {
        alert(error.message || 'Erro ao salvar saldo anterior');
      }
    }
  };

  const calcularSaldoAcumulado = (index: number): number => {
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

  const meses = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }));

  const anos = Array.from({ length: 5 }, (_, i) => {
    const ano = currentDate.getFullYear() - 2 + i;
    return { value: ano.toString(), label: ano.toString() };
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={user.role as UserRole} userName={user.name} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Movimentação do Caixa" 
          subtitle="Registro de entradas e saídas"
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Filtros */}
            <Card className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(!user.congregacaoId || user.role === 'admin' || user.role === 'tesoureiro_campo') && (
                  <Select
                    label="Congregação"
                    value={selectedCongregacao}
                    onChange={(e) => setSelectedCongregacao(e.target.value)}
                    options={congregacoes.map(c => ({ value: c.id, label: c.name }))}
                  />
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
                <div className="flex items-end">
                  <Input
                    label="Saldo Anterior"
                    type="number"
                    step="0.01"
                    value={saldoAnterior}
                    onChange={handleSaldoAnteriorChange}
                  />
                </div>
              </div>
            </Card>

            {/* Botão Nova Movimentação */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Movimentações - {getMonthName(selectedMes)}/{selectedAno}
              </h2>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Movimentação
              </Button>
            </div>

            {/* Formulário */}
            {showForm && (
              <Card className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingId ? 'Editar' : 'Nova'} Movimentação
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Dia"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dia}
                      onChange={(e) => setFormData({ ...formData, dia: parseInt(e.target.value) })}
                      required
                    />
                    <Select
                      label="Tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'entrada' | 'saida' })}
                      options={[
                        { value: 'entrada', label: 'Entrada' },
                        { value: 'saida', label: 'Saída' },
                      ]}
                    />
                    {formData.tipo === 'entrada' && (
                      <>
                        <Select
                          label="Categoria"
                          value={formData.categoriaEntrada}
                          onChange={(e) => {
                            const newData = { ...formData, categoriaEntrada: e.target.value as any };
                            setFormData(newData);
                            updateDescricaoAutomatica(newData);
                          }}
                          options={[
                            { value: 'dizimo', label: 'Dízimo' },
                            { value: 'ofertas', label: 'Ofertas' },
                            { value: 'outros', label: 'Outros' },
                          ]}
                        />
                        <Combobox
                          label="Culto"
                          value={formData.culto}
                          onChange={(value) => {
                            const newData = { ...formData, culto: value };
                            setFormData(newData);
                            updateDescricaoAutomatica(newData);
                          }}
                          options={cultosPadrao}
                          placeholder="Selecione ou digite o culto..."
                        />
                      </>
                    )}
                    <Input
                      label="Valor (R$)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor}
                      onChange={(e) => {
                        const newData = { ...formData, valor: parseFloat(e.target.value) || 0 };
                        setFormData(newData);
                        updateDescricaoAutomatica(newData);
                      }}
                      required
                    />
                  </div>
                  <Input
                    label="Descrição"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Rec. Culto de adoração - Oferta de 3,00 reais"
                    required
                  />
                  <div className="flex space-x-3">
                    <Button type="submit">
                      {editingId ? 'Atualizar' : 'Salvar'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Tabela de Movimentações */}
            {relatorio && (
              <Card>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-church-dark mb-2">
                    {congregacoes.find(c => c.id === selectedCongregacao)?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Campo do Barroso II - {getMonthName(selectedMes)} de {selectedAno}
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DIA</TableHead>
                      <TableHead>DESCRIÇÃO</TableHead>
                      <TableHead>DÍZIMO</TableHead>
                      <TableHead>OFERTAS</TableHead>
                      <TableHead>OUTROS</TableHead>
                      <TableHead>TOTAL ENTRADA</TableHead>
                      <TableHead>SAÍDAS</TableHead>
                      <TableHead>SALDO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell>SALDO ANTERIOR</TableCell>
                      <TableCell colSpan={5}></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="font-bold">{formatCurrency(saldoAnterior)}</TableCell>
                    </TableRow>
                    {movimentacoes.map((mov, index) => {
                      const saldo = calcularSaldoAcumulado(index);
                      return (
                        <TableRow key={mov.id}>
                          <TableCell>{mov.dia}</TableCell>
                          <TableCell>{mov.descricao}</TableCell>
                          <TableCell>
                            {mov.tipo === 'entrada' && mov.categoriaEntrada === 'dizimo' 
                              ? formatCurrency(mov.valor) 
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {mov.tipo === 'entrada' && mov.categoriaEntrada === 'ofertas' 
                              ? formatCurrency(mov.valor) 
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {mov.tipo === 'entrada' && mov.categoriaEntrada === 'outros' 
                              ? formatCurrency(mov.valor) 
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {mov.tipo === 'entrada' ? formatCurrency(mov.valor) : '-'}
                          </TableCell>
                          <TableCell>
                            {mov.tipo === 'saida' ? formatCurrency(mov.valor) : '-'}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(saldo)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-church-blue text-white font-bold">
                      <TableCell>TOTAIS</TableCell>
                      <TableCell></TableCell>
                      <TableCell>{formatCurrency(relatorio.totalDizimo)}</TableCell>
                      <TableCell>{formatCurrency(relatorio.totalOfertas)}</TableCell>
                      <TableCell>{formatCurrency(relatorio.totalOutros)}</TableCell>
                      <TableCell>{formatCurrency(relatorio.totalEntradas)}</TableCell>
                      <TableCell>{formatCurrency(relatorio.totalSaidas)}</TableCell>
                      <TableCell>{formatCurrency(relatorio.saldoFinal)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold text-church-dark mb-2">
                      TOTAL A SER RECOLHIDO NA TESOURARIA DA SEDE
                    </p>
                    <p className="text-2xl font-bold text-church-blue">
                      {formatCurrency(relatorio.saldoFinal)}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="border-t-2 border-gray-300 pt-4">
                      <p className="text-sm text-gray-600 mb-2">Dirigente Da Congregação</p>
                      <div className="h-12 border-b border-gray-400"></div>
                    </div>
                    <div className="border-t-2 border-gray-300 pt-4">
                      <p className="text-sm text-gray-600 mb-2">Tesoureiro Da Congregação</p>
                      <div className="h-12 border-b border-gray-400"></div>
                    </div>
                    <div className="border-t-2 border-gray-300 pt-4">
                      <p className="text-sm text-gray-600 mb-2">1º/2º Tesoureiro Da Sede</p>
                      <div className="h-12 border-b border-gray-400"></div>
                    </div>
                    <div className="border-t-2 border-gray-300 pt-4">
                      <p className="text-sm text-gray-600 mb-2">Pr. Presidente Do Campo</p>
                      <div className="h-12 border-b border-gray-400"></div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

