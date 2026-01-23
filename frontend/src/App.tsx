
import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Link as LinkIcon, 
  BarChart3, 
  Settings as SettingsIcon, 
  Bell, 
  Code2, 
  Activity, 
  Zap,
  Plus,
  Search,
  Target,
  Sun,
  Moon
} from 'lucide-react';
import { View } from './../types';
import Dashboard from './components/Dashboard';
import LinkCreator from './components/LinkCreator';
import LinkAnalytics from './components/LinkAnalytics';
import SystemHealth from './components/SystemHealth';
import DeveloperSettings from './components/DeveloperSettings';
import AlertsCenter from './components/AlertsCenter';
import Campaigns from './components/Campaigns';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boltlink-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('boltlink-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutGrid },
    { id: View.LINKS, label: 'Link Creator', icon: LinkIcon },
    { id: View.CAMPAIGNS, label: 'Campaigns', icon: Target },
    { id: View.ANALYTICS, label: 'Analytics', icon: BarChart3 },
    { id: View.ALERTS, label: 'Alerts', icon: Bell },
    { id: View.SYSTEM_HEALTH, label: 'System Health', icon: Activity },
    { id: View.DEVELOPER, label: 'Developer', icon: Code2 },
    { id: View.SETTINGS, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f141b] flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} z-50`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg cursor-pointer shadow-lg shadow-blue-500/20" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          {!sidebarCollapsed && <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">BoltLink</span>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">Main Navigation</div>
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                currentView === item.id 
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-semibold text-sm">{item.label}</span>}
            </button>
          ))}

          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-10 mb-4 px-2">Maintenance</div>
          {navItems.slice(5).map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                currentView === item.id 
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-semibold text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
              AR
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">Alex Rivera</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold truncate">System Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/70 dark:bg-[#0b0e14]/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-slate-200 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              OPERATIONAL
            </div>
            <button 
              onClick={() => setCurrentView(View.LINKS)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0b0e14]" />
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          {currentView === View.DASHBOARD && <Dashboard onNavigate={(v) => setCurrentView(v)} />}
          {currentView === View.LINKS && <LinkCreator />}
          {currentView === View.CAMPAIGNS && <Campaigns />}
          {currentView === View.ANALYTICS && <LinkAnalytics />}
          {currentView === View.ALERTS && <AlertsCenter />}
          {currentView === View.SYSTEM_HEALTH && <SystemHealth />}
          {currentView === View.DEVELOPER && <DeveloperSettings />}
          {currentView === View.SETTINGS && <Settings />}
        </div>

        {/* Footer Info */}
        <footer className="h-12 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 text-[10px] text-slate-500 bg-white/50 dark:bg-[#0f141b]/50">
          <div className="flex items-center gap-4 font-mono uppercase tracking-widest">
            <span className="flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3 text-blue-600 dark:text-blue-500" />
              BOLTLINK ENGINE V4.2
            </span>
          </div>
          <div className="hidden md:block italic text-slate-400">Distributed Engine Status: Optimal Layer-3 Synchrony</div>
          <div className="flex items-center gap-6 font-bold uppercase tracking-tighter">
             <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">API Docs</a>
             <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Enterprise</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
