import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Link as LinkIcon,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  Zap,
  Plus,
  Search,
  Target,
  Sun,
  Moon,
} from 'lucide-react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import LinkCreationPage from './pages/LinkCreation';
import AnalyticsPage from './pages/Analytics';
import CampaignsPage from './pages/Campaigns';
import AlertsPage from './pages/Alerts';
import SettingsPage from './pages/Settings';
import PasswordVerificationPage from './pages/PasswordVerification';
import RateLimitErrorPage from './pages/RateLimitError';
import VerifyPage from './pages/Verify';

const AppContent: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof globalThis !== 'undefined' && globalThis.window) {
      const saved = globalThis.localStorage.getItem('boltlink-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return globalThis.window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
    }
    return 'dark';
  });

  const location = useLocation();

  useEffect(() => {
    const root = globalThis.document?.documentElement;
    if (root) {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      globalThis.localStorage?.setItem('boltlink-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutGrid },
    { path: '/linkCreation', label: 'Link Creator', icon: LinkIcon },
    { path: '/campaigns', label: 'Campaigns', icon: Target },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className='flex min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-200 transition-colors duration-300 flex-col'>
      {/* Navbar - Only show if authenticated */}

      <div className='flex flex-1'>
        {/* Sidebar */}
        <aside
          className={`border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141b] flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} z-50`}
        >
          <div className='p-6 flex items-center gap-3'>
            <button
              className='bg-blue-600 p-2 rounded-lg cursor-pointer shadow-lg shadow-blue-500/20'
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label='Toggle sidebar'
            >
              <Zap className='w-6 h-6 text-white fill-current' />
            </button>
            {!sidebarCollapsed && (
              <span className='text-xl font-bold tracking-tight text-slate-900 dark:text-white'>
                BoltLink
              </span>
            )}
          </div>

          <nav className='flex-1 px-4 py-4 space-y-1 overflow-y-auto'>
            <div className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2'>
              Main Navigation
            </div>
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <item.icon className='w-5 h-5' />
                {!sidebarCollapsed && (
                  <span className='font-semibold text-sm'>{item.label}</span>
                )}
              </Link>
            ))}

            <div className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-10 mb-4 px-2'>
              Maintenance
            </div>
            {navItems.slice(5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <item.icon className='w-5 h-5' />
                {!sidebarCollapsed && (
                  <span className='font-semibold text-sm'>{item.label}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Card */}
          <div className='p-4 border-t border-slate-200 dark:border-slate-800'>
            <div
              className={`bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <div className='w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0'>
                AR
              </div>
              {!sidebarCollapsed && (
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold truncate text-slate-900 dark:text-white'>
                    Abhishek
                  </p>
                  <p className='text-[10px] text-slate-500 uppercase font-bold truncate'>
                    System Admin
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className='flex-1 flex flex-col min-w-0 overflow-hidden relative'>
          {/* Top Header */}
          <header className='h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/70 dark:bg-[#0b0e14]/50 backdrop-blur-md sticky top-0 z-30'>
            <div className='flex items-center gap-4 flex-1'>
              <div className='relative w-full max-w-md'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500' />
                <input
                  type='text'
                  placeholder='Search resources...'
                  className='w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-slate-200 placeholder-slate-400 transition-all'
                />
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <button
                onClick={toggleTheme}
                className='p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              >
                {theme === 'dark' ? (
                  <Sun className='w-5 h-5' />
                ) : (
                  <Moon className='w-5 h-5' />
                )}
              </button>
              <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold border border-green-500/20'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />{' '}
                OPERATIONAL
              </div>
              <Link
                to='/linkCreation'
                className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95'
              >
                <Plus className='w-4 h-4' />
                Create
              </Link>
              <button className='p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative'>
                <Bell className='w-5 h-5' />
                <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0b0e14]' />
              </button>
            </div>
          </header>

          {/* View Content */}
          <div className='flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar'>
            <Routes>
              <Route path='/' element={<DashboardPage />} />
              <Route path='/linkCreation' element={<LinkCreationPage />} />
              <Route path='/campaigns' element={<CampaignsPage />} />
              <Route path='/analytics' element={<AnalyticsPage />} />
              <Route path='/alerts' element={<AlertsPage />} />
              <Route path='/settings' element={<SettingsPage />} />
            </Routes>
          </div>

          {/* Footer Info */}
          <footer className='h-12 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 text-[10px] text-slate-500 bg-white/50 dark:bg-[#0f141b]/50'>
            <div className='flex items-center gap-4 font-mono uppercase tracking-widest'>
              <span className='flex items-center gap-1 font-bold'>
                <Zap className='w-3 h-3 text-blue-600 dark:text-blue-500' />
                BOLTLINK ENGINE V4.2
              </span>
            </div>
            <div className='hidden md:block italic text-slate-400'>
              Ready to create short links
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path='/login' element={<LoginPage />} /> */}
        <Route path='/verify' element={<VerifyPage />} />
        <Route path='/verify-password' element={<PasswordVerificationPage />} />
        <Route path='/rate-limit' element={<RateLimitErrorPage />} />
        <Route path='/*' element={<AppContent />} />
      </Routes>
    </Router>
  );
};

export default App;
