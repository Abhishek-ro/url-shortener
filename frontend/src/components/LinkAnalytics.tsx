import React, { useState } from 'react';
import { MousePointer2, Users, Timer, Target, Copy, Settings, Globe, ChevronDown, Download, Monitor, Smartphone, Chrome, Shield, Sparkles, Loader2, Link as LinkIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from '@google/genai';
import { useAnalytics } from "../hooks/useAnalytics";

const platformData = [
  { name: 'Mobile', value: 75, color: '#3b82f6' },
  { name: 'Desktop', value: 25, color: '#1e293b' }
];

const LinkAnalytics: React.FC = () => {
  const { data, loading } = useAnalytics();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const getAiInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this link traffic summary: 128k clicks, 75% mobile, peak traffic from UK, 3.8% conversion. Suggest 2-3 specific optimization strategies in a concise paragraph.`
      });
      setAiInsight(response.text);
    } catch (e) {
      setAiInsight("Unable to generate insights at this time. Please check your system connectivity.");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold text-sm animate-pulse">Loading Analytics Engine...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const summaryStats = [
    { label: 'Total Clicks', val: data.summary.totalClicks.toLocaleString(), change: '+12.5%', icon: MousePointer2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Top Region', val: data.summary.topRegion, change: 'Primary', icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Avg. Latency', val: '14ms', change: '+2%', icon: Timer, color: 'text-cyan-400', bg: 'bg-cyan-500/10', down: true },
    { label: 'Conversion Rate', val: '3.8%', change: '+0.4%', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
             <span>Dashboard</span> <ChevronDown className="w-3 h-3 -rotate-90" /> <span>Platform Analytics</span>
           </div>
           <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black text-white tracking-tight">Global Traffic Controller</h1>
             <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all text-slate-400 hover:text-white">
                <Target className="w-5 h-5" />
             </button>
           </div>
           <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
              <LinkIcon className="w-3 h-3" />
              Instance: <span className="text-slate-400 truncate max-w-md">boltlink-cluster-v4-main</span>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={getAiInsight} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/20 transition-all">
            {isLoadingInsight ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Get AI Analysis
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-all shadow-xl">
            <Download className="w-4 h-4" /> Export Data
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="w-24 h-24 text-indigo-400" />
          </div>
          <h4 className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Gemini AI Performance Insight
          </h4>
          <p className="text-white text-sm leading-relaxed max-w-4xl relative z-10">{aiInsight}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((m, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className={`p-3 ${m.bg} rounded-2xl`}>
                   <m.icon className={`w-6 h-6 ${m.color}`} />
                </div>
                <div className="flex items-center gap-1">
                   <span className={`text-xs font-bold ${m.down ? 'text-amber-400' : 'text-green-400'}`}>{m.change}</span>
                </div>
             </div>
             <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">{m.label}</p>
             <h4 className="text-2xl font-black text-white truncate">{m.val}</h4>
          </div>
        ))}
      </div>

      <div className="bg-[#0f141b] border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
         <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
               <h3 className="text-xl font-bold text-white mb-1">Global Click Pulse</h3>
               <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Platform-wide Stream</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-[10px] font-bold border border-blue-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               LIVE MONITOR
            </div>
         </div>
         <div className="h-[300px] w-full relative z-10">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data.points}>
               <defs>
                 <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Tooltip 
                  contentStyle={{ backgroundColor: '#0f141b', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
               />
               <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                  strokeWidth={4} 
                  animationDuration={1500}
               />
               <XAxis 
                  dataKey="timestamp" 
                  hide={true}
               />
               <YAxis hide={true} />
             </AreaChart>
           </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 bg-[#0f141b] border border-slate-800 rounded-3xl p-8 flex flex-col shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-400" /> Geographical Distribution
            </h3>
            <div className="flex-1 flex flex-col md:flex-row gap-8">
               <div className="flex-1 bg-slate-900/50 rounded-2xl relative min-h-[250px] border border-slate-800 p-4 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-no-repeat bg-contain bg-center invert scale-125" />
                  <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                  <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-blue-400 rounded-full" />
               </div>
               <div className="w-full md:w-64 space-y-6">
                  {[
                    { country: 'USA', val: 42 },
                    { country: 'UK', val: 18 },
                    { country: 'DE', val: 12 },
                  ].map((c, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                          <span>{c.country}</span>
                          <span>{c.val}%</span>
                       </div>
                       <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${c.val}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 bg-[#0f141b] border border-slate-800 rounded-3xl p-8 flex flex-col shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
               <Monitor className="w-6 h-6 text-indigo-400" /> Platform
            </h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={platformData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                         {platformData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                      </Pie>
                   </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Mobile
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-slate-800" /> Desktop
                </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LinkAnalytics;