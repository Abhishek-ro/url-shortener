import React from 'react';
import { Globe, Users, Shield, CreditCard, CheckCircle2, AlertCircle, RefreshCw, User } from 'lucide-react';
import { useSettings } from "../hooks/useSettings";

const Settings: React.FC = () => {
  const { settings, loading } = useSettings();

  if (loading) return <div className="p-8 text-slate-500 font-bold animate-pulse text-center">Loading settings...</div>;
  if (!settings) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Organization Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Control governance, domains, and global traffic routing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="space-y-1">
          {['User Profile', 'General Settings', 'Custom Domains', 'Team Members', 'Billing & Plans', 'Security Ops'].map((tab, i) => (
            <button key={i} className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          {/* User Account Card */}
          <div className="bg-white dark:bg-[#0f141b] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-none space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Username</p>
                <p className="text-slate-900 dark:text-white font-bold text-lg">{settings.username}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</p>
                <p className="text-slate-900 dark:text-white font-bold text-lg">{settings.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Theme</p>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${settings.theme === 'dark' ? 'bg-slate-800' : 'bg-blue-400'} border border-slate-700`} />
                   <p className="text-slate-900 dark:text-white font-bold capitalize">{settings.theme}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Member Since</p>
                <p className="text-slate-900 dark:text-white font-bold">
                  {new Date(settings.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f141b] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-none space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Domain Clusters
              </h3>
              <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-xs font-black transition-all border border-slate-200 dark:border-slate-700 uppercase tracking-tighter">Register New</button>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl shadow-inner">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">go.enterprise-brand.io</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Status: Global Edge Active</p>
                  </div>
                </div>
                <button className="p-2 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
              </div>

              <div className="p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">links.dev-cluster.sh</h4>
                    <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-tight">Pending TXT Record Match</p>
                  </div>
                </div>
                <button className="text-xs font-black text-amber-600 dark:text-amber-500 hover:underline uppercase tracking-tighter">Verify Engine</button>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Default Redirect Logic</h3>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Root Cluster Redirect</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Routing for top-level domain hits.</p>
                  </div>
                  <input type="text" placeholder="https://main-brand.com" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono transition-all" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">HTTPS Enforced SSL</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Strict-Transport-Security globally.</p>
                  </div>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f141b] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-none space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" /> Security Operations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Deactivating your organization cluster will flush the distributed cache and disable all link routing. This is destructive and requires Level-1 credentials.</p>
            <button className="px-6 py-3 rounded-2xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-500 font-black text-[10px] hover:bg-red-50 dark:hover:bg-red-950/30 transition-all uppercase tracking-widest">Terminate Cluster Instance</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;