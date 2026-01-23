import React, { useState } from 'react';
import { Target, Link as LinkIcon, Plus, ChevronRight, TrendingUp, Users, Calendar, Send } from 'lucide-react';
import { useCampaigns } from "../hooks/useCampaigns";

const Campaigns: React.FC = () => {
  const { campaigns, loading, addCampaign } = useCampaigns();
  const [nameInput, setNameInput] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold text-sm animate-pulse">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Campaign Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aggregate metrics for global marketing operations.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <input 
            type="text" 
            placeholder="Campaign Name..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="bg-transparent border-none px-4 py-2 focus:outline-none text-sm font-medium text-slate-900 dark:text-white w-48 md:w-64"
          />
          <button 
            onClick={() => {
              if (nameInput.trim() !== "") {
                addCampaign(nameInput);
                setNameInput("");
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-white dark:bg-[#0f141b] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-blue-500/30 transition-all cursor-pointer group shadow-lg dark:shadow-none">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500 rounded-2xl bg-opacity-10 shadow-sm">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-green-600 dark:text-green-400 bg-green-500/10 uppercase tracking-tighter">
                ACTIVE
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.name}</h3>
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase mb-4">
              <Calendar className="w-3 h-3" />
              Created {new Date(c.createdAt).toLocaleDateString()}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-1">Links</p>
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                  <LinkIcon className="w-3 h-3 text-slate-400" /> {c.totalLinks}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-1">Volume</p>
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                  <TrendingUp className="w-3 h-3 text-green-500" /> {c.totalClicks.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0f141b] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl dark:shadow-none">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white">Active Campaign Summary</h3>
          <div className="flex gap-2">
            <span className="text-[10px] bg-blue-600/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-600/20 font-black uppercase tracking-tighter">Real-time Stats</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">
                <th className="px-8 py-4">Campaign Name</th>
                <th className="px-8 py-4">Total Links</th>
                <th className="px-8 py-4">Total Clicks</th>
                <th className="px-8 py-4">Created Date</th>
                <th className="px-8 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors text-sm">
                  <td className="px-8 py-6 font-bold text-slate-900 dark:text-slate-200">{c.name}</td>
                  <td className="px-8 py-6 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">{c.totalLinks}</td>
                  <td className="px-8 py-6 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">{c.totalClicks.toLocaleString()}</td>
                  <td className="px-8 py-6 text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 transition-all"><ChevronRight className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;