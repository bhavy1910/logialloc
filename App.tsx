
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { DB } from './store';
import Login from './views/Login';
import Signup from './views/Signup';
import DashboardLayout from './components/DashboardLayout';
import TrackingDashboard from './views/TrackingDashboard';
import RequirementCreation from './views/RequirementCreation';
import ModeAllocation from './views/ModeAllocation';
import DriversManagement from './views/DriversManagement';
import OrdersManagement from './views/OrdersManagement';
import ProfileManagement from './views/ProfileManagement';
import OptimizationEngine from './views/OptimizationEngine';
import BinPackingAI from './views/BinPackingAI';
import SuppliersPortal from './views/SuppliersPortal';
import GroundControlBot from './views/GroundControlBot';

type View = 'LOGIN' | 'SIGNUP' | 'DASHBOARD' | 'CREATE_REQ' | 'ALLOCATE' | 'DRIVERS' | 'ORDERS' | 'PROFILE' | 'OPTIMIZE' | 'BIN_PACKING' | 'SUPPLIERS' | 'BOT';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('LOGIN');
  const [draftRequirement, setDraftRequirement] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const getDefaultViewForRole = (role: UserRole): View => {
    if (role === UserRole.SITE_MANAGER) return 'DASHBOARD';
    if (role === UserRole.TRANSPORT_PROVIDER) return 'DASHBOARD';
    if (role === UserRole.MANUFACTURER) return 'OPTIMIZE';
    if (role === UserRole.SC_ANALYST) return 'PROFILE';
    return 'OPTIMIZE';
  };

  useEffect(() => {
    DB.initialize();
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      setCurrentView(getDefaultViewForRole(parsedUser.role));
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.removeItem('sourcing_order_accepted');
    setCurrentView(getDefaultViewForRole(user.role));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sourcing_order_accepted');
    setCurrentView('LOGIN');
  };

  const navigateTo = (view: View) => setCurrentView(view);

  const renderContent = () => {
    switch (currentView) {
      case 'LOGIN':
        return <Login onLogin={handleLogin} onGoToSignup={() => setCurrentView('SIGNUP')} isDarkMode={isDarkMode} />;
      case 'SIGNUP':
        return <Signup onSignup={handleLogin} onGoToLogin={() => setCurrentView('LOGIN')} />;
      case 'DASHBOARD':
        return <TrackingDashboard user={currentUser!} />;
      case 'OPTIMIZE':
        return <OptimizationEngine user={currentUser!} />;
      case 'BIN_PACKING':
        return <BinPackingAI />;
      case 'SUPPLIERS':
        return <SuppliersPortal user={currentUser!} onOrderAccepted={() => setCurrentView('CREATE_REQ')} />;
      case 'BOT':
        return <GroundControlBot user={currentUser!} />;
      case 'CREATE_REQ':
        return (
          <RequirementCreation 
            user={currentUser!} 
            onNext={(req) => {
              setDraftRequirement(req);
              setCurrentView('ALLOCATE');
            }} 
          />
        );
      case 'ALLOCATE':
        return (
          <ModeAllocation 
            requirement={draftRequirement} 
            onNext={() => setCurrentView('ORDERS')} 
          />
        );
      case 'DRIVERS':
        return <DriversManagement />;
      case 'ORDERS':
        return <OrdersManagement user={currentUser!} />;
      case 'PROFILE':
        return <ProfileManagement user={currentUser!} onUpdate={(u) => {
          setCurrentUser(u);
          localStorage.setItem('currentUser', JSON.stringify(u));
        }} />;
      default:
        return <OptimizationEngine user={currentUser!} />;
    }
  };

  if (currentView === 'LOGIN' || currentView === 'SIGNUP') {
    return renderContent();
  }

  return (
    <DashboardLayout 
      user={currentUser!} 
      onLogout={handleLogout} 
      currentView={currentView}
      onNavigate={navigateTo}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default App;
