import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCircle, Mail, Calendar, FileText,
  Ticket, BarChart3, GitBranch, Bot, Settings, LogOut, Moon, Sun, Bell, Activity,
} from 'lucide-react';
import { useAuthStore, useThemeStore } from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users', roles: ['Admin', 'Manager'] },
  { to: '/customers', icon: UserCircle, label: 'Customers' },
  { to: '/emails', icon: Mail, label: 'Emails' },
  { to: '/meetings', icon: Calendar, label: 'Meetings' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/crm', icon: Activity, label: 'CRM' },
  { to: '/workflows', icon: GitBranch, label: 'Workflows' },
  { to: '/ai-control', icon: Bot, label: 'AI Control' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    logout();
    toast.success('Logged out');
  };

  const filteredNav = nav.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-brand-600">NxtBiz</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Operations Platform</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-600/20 text-brand-700 dark:text-brand-400 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
            {user?.name} · {user?.role}
          </div>
          <button onClick={toggle} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
