import React, { useState } from 'react';
import { MousePointer2, Link as LinkIcon, Globe2, ArrowUpRight, ChevronRight, Zap } from 'lucide-react';
import { View } from '../../types';
import { useDashboard } from "../hooks/useDashboard";
import { useLinks } from "../hooks/useLinks";

const Dashboard: React.FC<{ onNavigate: (v: View) => void }> = ({ onNavigate }) => {
  const { links, addLink } = useLinks();
  const lastCreatedLink = links[0] || null;
  const { data, loading } = useDashboard(lastCreatedLink);
  const [urlInput, setUrlInput] = useState("");

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold text-sm animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Performance Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring real-time link traffic across 18 edge regions.</p>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl dark:shadow-none backdrop-blur-md">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Fast Shorten</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="https://long-destination.com/path..." 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-all font-medium"
            />
          </div>
          <button 
            onClick={() => {
              if (urlInput.trim() !== "") {
                addLink(urlInput);
                setUrlInput("");
              }
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/20 group active:scale-95"
          >
            <Zap className="w-5 h-5 fill-current group-hover:scale-125 transition-transform" />
            Shorten
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: MousePointer2, label: 'Total Clicks', val: data.totalClicks.toLocaleString(), change: `+${data.trend.clicks}%`, color: 'blue' },
          { icon: LinkIcon, label: 'Active Links', val: data.activeLinks.toLocaleString(), change: `+${data.trend.active}%`, color: 'indigo' },
          { icon: Globe2, label: 'Top Region', val: data.topRegion, change: 'Primary', color: 'cyan' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:border-blue-500/30 transition-all shadow-lg dark:shadow-none group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-${stat.color}-500/10 rounded-2xl`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold bg-green-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-white dark:to-indigo-900/20 border border-blue-200 dark:border-blue-500/20 p-8 rounded-3xl relative overflow-hidden group shadow-lg dark:shadow-none">
          <Globe2 className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-6" />
          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Global Analytics</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">Trace your traffic origins across 240+ countries in real-time.</p>
          <button 
            onClick={() => onNavigate(View.ANALYTICS)}
            className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-2 group/btn"
          >
            Explore Map <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900/40 border border-slate-800 p-8 rounded-3xl text-white flex flex-col justify-center">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instance Usage</h4>
            <span className="text-[10px] font-mono text-slate-400">65% Capacity</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }} />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
            Upgrade Instance
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;