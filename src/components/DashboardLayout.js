import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ScrollText, 
  LayoutGrid, 
  Calendar, 
  Settings,
  LogOut
} from 'lucide-react';

const DashboardLayout = ({ onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/directives', label: 'Daftar Arahan', icon: ScrollText },
    { path: '/kanban', label: 'Papan Kanban', icon: LayoutGrid },
    { path: '/timeline', label: 'Timeline', icon: Calendar },
    { path: '/admin', label: 'Admin Panel', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-container flex">
      <aside className="sidebar">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2.5 rounded-lg">
              <span className="text-lg font-bold text-slate-800">T</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Kementerian Transmigrasi</h2>
              <p className="text-xs text-slate-400">Dashboard Directives Management</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <div
                  data-testid={`nav-${item.path.substring(1) || 'dashboard'}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <Button
            data-testid="logout-button"
            onClick={onLogout}
            variant="outline"
            className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-600"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      <main className="main-content p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
