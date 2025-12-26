'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Church
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { User, UserRole } from '@/types';
import { fetchCongregacoes, fetchRelatorio } from '@/lib/api-client';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [congregacaoNome, setCongregacaoNome] = useState<string>('');
  const [stats, setStats] = useState({
    totalDizimo: 0,
    totalOfertas: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    saldoFinal: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      let userObj = JSON.parse(userData);
      
      // Se for o Pr. Júnior, verificar e corrigir a congregação se necessário
      if (userObj.email === 'prjunior@adbarroso.com') {
        try {
          // Buscar congregações para encontrar o ID correto da Pici
          const congregacoes = await fetchCongregacoes();
          const piciCongregacao = congregacoes.find((c: any) => c.name === 'Pici');
          
          // Se encontrou a Pici e o usuário não está vinculado a ela, atualizar
          if (piciCongregacao && userObj.congregacaoId !== piciCongregacao.id) {
            // Atualizar usuário no localStorage
            userObj.congregacaoId = piciCongregacao.id;
            localStorage.setItem('user', JSON.stringify(userObj));
            
            // Também atualizar no servidor se possível
            try {
              const dbData = localStorage.getItem('igreja_db');
              if (dbData) {
                const db = JSON.parse(dbData);
                // Atualizar no objeto do banco local
                if (db.users && Array.isArray(db.users)) {
                  const userIndex = db.users.findIndex(([id, user]: [string, any]) => {
                    return user && user.email === 'prjunior@adbarroso.com';
                  });
                  if (userIndex >= 0) {
                    const [userId, userData] = db.users[userIndex];
                    userData.congregacaoId = piciCongregacao.id;
                    db.users[userIndex] = [userId, userData];
                    localStorage.setItem('igreja_db', JSON.stringify(db));
                  }
                }
              }
            } catch (updateError) {
              console.error('Erro ao atualizar usuário no banco:', updateError);
            }
          }
        } catch (error) {
          console.error('Erro ao verificar congregação:', error);
        }
      }
      
      setUser(userObj);

      // Buscar nome da congregação se o usuário tiver congregacaoId
      if (userObj.congregacaoId) {
        try {
          const congregacoes = await fetchCongregacoes();
          const congregacao = congregacoes.find((c: any) => c.id === userObj.congregacaoId);
          if (congregacao) {
            setCongregacaoNome(congregacao.name);
          }
        } catch (error) {
          console.error('Erro ao buscar congregação:', error);
        }
      }

      try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        let totalDizimo = 0;
        let totalOfertas = 0;
        let totalEntradas = 0;
        let totalSaidas = 0;
        let saldoFinal = 0;

        if (userObj.role === 'admin' || userObj.role === 'presidente_campo' || userObj.role === 'tesoureiro_campo') {
          // Totais de todas as congregações
          const congregacoes = await fetchCongregacoes();
          for (const cong of congregacoes) {
            try {
              const relatorio = await fetchRelatorio(cong.id, currentMonth, currentYear);
              totalDizimo += relatorio.totalDizimo;
              totalOfertas += relatorio.totalOfertas;
              totalEntradas += relatorio.totalEntradas;
              totalSaidas += relatorio.totalSaidas;
              saldoFinal += relatorio.saldoFinal;
            } catch (error) {
              // Ignorar erros de congregações sem dados
            }
          }
        } else if (userObj.congregacaoId) {
          // Totais da congregação do usuário
          const relatorio = await fetchRelatorio(userObj.congregacaoId, currentMonth, currentYear);
          totalDizimo = relatorio.totalDizimo;
          totalOfertas = relatorio.totalOfertas;
          totalEntradas = relatorio.totalEntradas;
          totalSaidas = relatorio.totalSaidas;
          saldoFinal = relatorio.saldoFinal;
        }

        setStats({
          totalDizimo,
          totalOfertas,
          totalEntradas,
          totalSaidas,
          saldoFinal,
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

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

  const statsCards = [
    {
      title: 'Total Dízimo',
      value: formatCurrency(stats.totalDizimo),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Ofertas',
      value: formatCurrency(stats.totalOfertas),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Entradas',
      value: formatCurrency(stats.totalEntradas),
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Saídas',
      value: formatCurrency(stats.totalSaidas),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Saldo Final',
      value: formatCurrency(stats.saldoFinal),
      icon: Church,
      color: 'text-church-blue',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={user.role as UserRole} userName={user.name} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          subtitle={`Bem-vindo, ${user.name}`}
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Resumo Financeiro - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.bgColor} p-3 rounded-lg`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </h3>
                    <p className="text-2xl font-bold text-church-dark">
                      {stat.value}
                    </p>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Ações Rápidas">
                <div className="space-y-3">
                  <a
                    href="/movimentacao"
                    className="block w-full px-4 py-3 bg-church-blue text-white rounded-lg hover:bg-blue-800 transition-colors text-center font-medium"
                  >
                    Nova Movimentação
                  </a>
                  <a
                    href="/relatorios"
                    className="block w-full px-4 py-3 border-2 border-church-blue text-church-blue rounded-lg hover:bg-blue-50 transition-colors text-center font-medium"
                  >
                    Ver Relatórios
                  </a>
                </div>
              </Card>

              <Card title="Informações do Sistema">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versão:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Perfil:</span>
                    <span className="font-medium capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  {user.congregacaoId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Congregação:</span>
                      <span className="font-medium">
                        {congregacaoNome || user.congregacaoId || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

