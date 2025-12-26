'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { User, UserRole } from '@/types';
import { fetchUsers, fetchCongregacoes, createUser, updateUser, deleteUser } from '@/lib/api-client';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function UsuariosPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [congregacoes, setCongregacoes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tesoureiro_congregacao' as UserRole,
    campo: '',
    congregacaoId: '',
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
      
      if (userObj.role !== 'admin' && userObj.role !== 'presidente_campo') {
        router.push('/dashboard');
        return;
      }
      
      try {
        const [usersData, congs] = await Promise.all([
          fetchUsers(),
          fetchCongregacoes(),
        ]);
        setUsers(usersData);
        setCongregacoes(congs);
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

  if (!user || (user.role !== 'admin' && user.role !== 'presidente_campo')) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId && !formData.password) {
      alert('A senha é obrigatória para novos usuários');
      return;
    }
    
    try {
      if (editingUserId) {
        // Atualizar usuário existente
        const updatedUser = await updateUser(editingUserId, {
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined, // Só atualiza se fornecido
          role: formData.role,
          campo: formData.campo,
          congregacaoId: formData.congregacaoId || undefined,
        });
        setUsers(users.map(u => u.id === editingUserId ? updatedUser : u));
      } else {
        // Criar novo usuário
        const novoUsuario = await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          campo: formData.campo,
          congregacaoId: formData.congregacaoId || undefined,
        });
        setUsers([...users, novoUsuario]);
      }
      
      setShowForm(false);
      setEditingUserId(null);
      setFormData({ name: '', email: '', password: '', role: 'tesoureiro_congregacao', campo: '', congregacaoId: '' });
      
      // Recarregar lista
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (usr: User) => {
    setEditingUserId(usr.id);
    setFormData({
      name: usr.name,
      email: usr.email,
      password: '', // Não preencher senha
      role: usr.role,
      campo: usr.campo || '',
      congregacaoId: usr.congregacaoId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }
    
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir usuário');
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'presidente_campo', label: 'Pr. Presidente do Campo' },
    { value: 'pastor', label: 'Pastor' },
    { value: 'tesoureiro_campo', label: 'Tesoureiro do Campo' },
    { value: 'tesoureiro_congregacao', label: 'Tesoureiro da Congregação' },
    { value: 'lider_congregacao', label: 'Líder de Congregação' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={user.role as UserRole} userName={user.name} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Usuários" 
          subtitle="Gerenciamento de usuários do sistema"
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Lista de Usuários
              </h2>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

            {showForm && (
              <Card className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingUserId ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome completo"
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                    <Input
                      label="Senha"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUserId ? "Deixe em branco para manter a senha atual" : "••••••••"}
                      required={!editingUserId}
                    />
                    <Input
                      label="Campo"
                      value={formData.campo}
                      onChange={(e) => setFormData({ ...formData, campo: e.target.value })}
                      placeholder="Ex: Barroso II"
                      required
                    />
                    <Select
                      label="Perfil"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      options={roleOptions}
                    />
                    <Select
                      label="Congregação"
                      value={formData.congregacaoId}
                      onChange={(e) => setFormData({ ...formData, congregacaoId: e.target.value })}
                      options={[
                        { value: '', label: 'Nenhuma' },
                        ...congregacoes.map(c => ({ value: c.id, label: c.name })),
                      ]}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit">Salvar</Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingUserId(null);
                        setFormData({ name: '', email: '', password: '', role: 'tesoureiro_congregacao', campo: '', congregacaoId: '' });
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
                    <TableHead>Email</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Congregação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((usr) => (
                    <TableRow key={usr.id}>
                      <TableCell className="font-medium">{usr.name}</TableCell>
                      <TableCell>{usr.email}</TableCell>
                      <TableCell>{usr.campo || 'N/A'}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {usr.role.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {usr.congregacaoId 
                          ? congregacoes.find(c => c.id === usr.congregacaoId)?.name || 'N/A'
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(usr)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(usr.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Excluir usuário"
                          >
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

