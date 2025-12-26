'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  DollarSign, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  Church,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  userRole: UserRole;
  userName: string;
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'presidente_campo', 'pastor', 'tesoureiro_campo', 'tesoureiro_congregacao', 'lider_congregacao'],
    },
    {
      label: 'Movimentação',
      href: '/movimentacao',
      icon: DollarSign,
      roles: ['admin', 'presidente_campo', 'tesoureiro_campo', 'tesoureiro_congregacao'],
    },
    {
      label: 'Relatórios',
      href: '/relatorios',
      icon: FileText,
      roles: ['admin', 'presidente_campo', 'pastor', 'tesoureiro_campo', 'tesoureiro_congregacao', 'lider_congregacao'],
    },
    {
      label: 'Congregações',
      href: '/congregacoes',
      icon: Church,
      roles: ['admin', 'presidente_campo', 'tesoureiro_campo'],
    },
    {
      label: 'Usuários',
      href: '/usuarios',
      icon: Users,
      roles: ['admin', 'presidente_campo'],
    },
    {
      label: 'Configurações',
      href: '/configuracoes',
      icon: Settings,
      roles: ['admin', 'presidente_campo'],
    },
  ].filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-church-dark text-white p-2 rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        h-screen w-64 bg-church-dark text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-church-gold rounded-lg p-2">
            <Church className="w-6 h-6 text-church-dark" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AD Barroso</h1>
            <p className="text-xs text-gray-400">Sistema Financeiro</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-church-blue text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 mb-4 px-4 py-2">
          <div className="w-8 h-8 bg-church-gold rounded-full flex items-center justify-center">
            <span className="text-church-dark font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate">
              {userRole.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
    </>
  );
}

