'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { User, UserRole, Congregacao } from '@/types';
import { fetchCongregacoes, createCongregacao } from '@/lib/api-client';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CongregacoesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [congregacoes, setCongregacoes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    campo: 'Barroso II',
  });

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
      } catch (error) {
        console.error('Erro ao carregar congregações:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const novaCongregacao = await createCongregacao(formData);
      setCongregacoes([...congregacoes, novaCongregacao]);
      setShowForm(false);
      setFormData({ name: '', campo: 'Barroso II' });
    } catch (error: any) {
      alert(error.message || 'Erro ao criar congregação');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={user.role as UserRole} userName={user.name} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Congregações" 
          subtitle="Gerenciamento de congregações"
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Lista de Congregações
              </h2>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Congregação
              </Button>
            </div>

            {showForm && (
              <Card className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Nova Congregação</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nome da Congregação"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Pici"
                      required
                    />
                    <Input
                      label="Campo"
                      value={formData.campo}
                      onChange={(e) => setFormData({ ...formData, campo: e.target.value })}
                      placeholder="Ex: Barroso II"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit">Salvar</Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({ name: '', campo: 'Barroso II' });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {congregacoes.map((cong) => (
                    <TableRow key={cong.id}>
                      <TableCell className="font-medium">{cong.name}</TableCell>
                      <TableCell>{cong.campo}</TableCell>
                      <TableCell>
                        {new Date(cong.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

