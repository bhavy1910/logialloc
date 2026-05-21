
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  FileText, 
  UserCircle, 
  LogOut,
  Package,
  Sun,
  Moon,
  Cpu,
  BarChart3,
  Award,
  Layers,
  Bot
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

interface Props {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: any) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ user, onLogout, currentView, onNavigate, isDarkMode, toggleDarkMode, children }) => {
  const [sourcingOrderAccepted, setSourcingOrderAccepted] = useState(false);

  useEffect(() => {
    const checkState = () => {
      setSourcingOrderAccepted(localStorage.getItem('sourcing_order_accepted') === 'true');
    };
    checkState();
    window.addEventListener('storage', checkState);
    return () => window.removeEventListener('storage', checkState);
  }, [currentView]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
            <Cpu size={24} />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">LogiAlloc</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {/* SITE MANAGER MENUS */}
          {user.role === UserRole.SITE_MANAGER && (
            <>
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Site Monitoring</p>
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Tracking Dashboard" 
                active={currentView === 'DASHBOARD'} 
                onClick={() => onNavigate('DASHBOARD')}
              />
              <SidebarItem 
                icon={FileText} 
                label="Order Registry" 
                active={currentView === 'ORDERS'} 
                onClick={() => onNavigate('ORDERS')}
              />
              {sourcingOrderAccepted && (
                <SidebarItem 
                  icon={PlusCircle} 
                  label="New Requirement" 
                  active={currentView === 'CREATE_REQ' || currentView === 'ALLOCATE'} 
                  onClick={() => onNavigate('CREATE_REQ')}
                />
              )}
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2 font-mono">Sourcing & AI</p>
              <SidebarItem 
                icon={Award} 
                label="Sourcing & RFQ" 
                active={currentView === 'SUPPLIERS'} 
                onClick={() => onNavigate('SUPPLIERS')}
              />
              <SidebarItem 
                icon={Bot} 
                label="AI Ground Control" 
                active={currentView === 'BOT'} 
                onClick={() => onNavigate('BOT')}
              />
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2 font-mono">Account</p>
              <SidebarItem 
                icon={UserCircle} 
                label="Profile" 
                active={currentView === 'PROFILE'} 
                onClick={() => onNavigate('PROFILE')}
              />
            </>
          )}

          {/* TRANSPORT PROVIDER MENUS */}
          {user.role === UserRole.TRANSPORT_PROVIDER && (
            <>
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Fleet Logistics</p>
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Tracking Dashboard" 
                active={currentView === 'DASHBOARD'} 
                onClick={() => onNavigate('DASHBOARD')}
              />
              <SidebarItem 
                icon={Users} 
                label="Add Driver" 
                active={currentView === 'DRIVERS'} 
                onClick={() => onNavigate('DRIVERS')}
              />
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2 font-mono font-mono">Intelligent Packing</p>
              <SidebarItem 
                icon={Bot} 
                label="AI Ground Control" 
                active={currentView === 'BOT'} 
                onClick={() => onNavigate('BOT')}
              />
              <SidebarItem 
                icon={Layers} 
                label="3D Bin Packing" 
                active={currentView === 'BIN_PACKING'} 
                onClick={() => onNavigate('BIN_PACKING')}
              />
            </>
          )}

          {/* MANUFACTURER MENUS */}
          {user.role === UserRole.MANUFACTURER && (
            <>
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Operations</p>
              <SidebarItem 
                icon={Cpu} 
                label="Optimization Engine" 
                active={currentView === 'OPTIMIZE'} 
                onClick={() => onNavigate('OPTIMIZE')}
              />
              <SidebarItem 
                icon={FileText} 
                label="Order Registry" 
                active={currentView === 'ORDERS'} 
                onClick={() => onNavigate('ORDERS')}
              />
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2 font-mono">Bidding Portal</p>
              <SidebarItem 
                icon={Award} 
                label="Sourcing & RFQ" 
                active={currentView === 'SUPPLIERS'} 
                onClick={() => onNavigate('SUPPLIERS')}
              />
              <SidebarItem 
                icon={Bot} 
                label="AI Ground Control" 
                active={currentView === 'BOT'} 
                onClick={() => onNavigate('BOT')}
              />
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2 font-mono">Account</p>
              <SidebarItem 
                icon={UserCircle} 
                label="Profile" 
                active={currentView === 'PROFILE'} 
                onClick={() => onNavigate('PROFILE')}
              />
            </>
          )}

          {/* SUPPLY CHAIN ANALYST MENUS */}
          {user.role === UserRole.SC_ANALYST && (
            <>
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono font-mono">Security & Hub</p>
              <SidebarItem 
                icon={UserCircle} 
                label="Profile" 
                active={currentView === 'PROFILE'} 
                onClick={() => onNavigate('PROFILE')}
              />
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2 font-mono">Allocation</p>
              <SidebarItem 
                icon={Cpu} 
                label="Optimization Engine" 
                active={currentView === 'OPTIMIZE'} 
                onClick={() => onNavigate('OPTIMIZE')}
              />
            </>
          )}
        </nav>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
           <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Industrial Supply Engine</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">Period: Jan 2026 • Live Network</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{user.fullName}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                <img src={`https://picsum.photos/seed/${user.id}/100`} alt="Avatar" />
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
