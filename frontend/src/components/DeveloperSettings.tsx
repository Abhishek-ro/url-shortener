import React from 'react';
import { Key, Webhook, Copy, Plus, Trash2, Edit3, Code, CheckCircle2 } from 'lucide-react';
import { useDeveloperSettings } from "../hooks/useDeveloperSettings";

const DeveloperSettings: React.FC = () => {
  const { settings, loading } = useDeveloperSettings();

  if (loading) return <div className="p-8 text-slate-500 font-bold animate-pulse text-center">Loading developer settings...</div>;
  if (!settings) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Developer Settings</h1>
          <p className="text-slate-400 text-lg">Manage your API access, security keys, and automated webhooks.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border border-slate-700 shadow-lg">
           <Code className="w-5 h-5" />
           View API Docs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Keys */}
        <div className="bg-[#0f141b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-600 rounded-lg">
                  <Key className="w-5 h-5 text-white" />
               </div>
               <h3 className="text-xl font-bold text-white">API Keys</h3>
            </div>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> GENERATE NEW
            </button>
          </div>
          <div className="divide-y divide-slate-800">
            {settings.apiKeys.map(key => (
              <div key={key.id} className="p-6 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm text-blue-400 font-mono tracking-tighter truncate">{key.key}</code>
                      <Copy className="w-3 h-3 text-slate-600 hover:text-white cursor-pointer shrink-0" />
                   </div>
                   <p className="text-[10px] text-slate-500 uppercase font-bold">
                     {key.id} — created {new Date(key.createdAt).toLocaleDateString()}
                   </p>
                </div>
                <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                   <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-[#0f141b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-600 rounded-lg">
                  <Webhook className="w-5 h-5 text-white" />
               </div>
               <h3 className="text-xl font-bold text-white">Webhooks</h3>
            </div>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> ADD ENDPOINT
            </button>
          </div>
          <div className="p-6 space-y-4">
            {settings.webhooks.map(hook => (
              <div key={hook.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative group overflow-hidden">
                 <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-slate-200 truncate pr-4">{hook.url}</div>
                    <div className="flex items-center gap-2 shrink-0">
                       <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${hook.active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-700 text-slate-400'}`}>
                         {hook.active ? "active" : "inactive"}
                       </span>
                    </div>
                 </div>
                 <div className="text-[10px] text-slate-500 font-mono">
                   ID: {hook.id} — Added {new Date(hook.createdAt).toLocaleDateString()}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Examples Section */}
      <div className="bg-[#0f141b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-slate-800 bg-slate-900/20">
            <h3 className="text-xl font-bold text-white mb-2">Quick Start Guide</h3>
            <p className="text-slate-500 text-sm">Start integrating BoltLink into your application in seconds.</p>
         </div>
         <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col overflow-x-auto">
               {['cURL', 'Python', 'Node.js', 'PHP'].map((lang, i) => (
                 <button key={i} className={`px-8 py-4 text-left text-sm font-bold border-r md:border-r-0 md:border-b border-slate-800 last:border-0 transition-colors whitespace-nowrap ${i === 0 ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-white'}`}>
                   {lang}
                 </button>
               ))}
            </div>
            <div className="flex-1 bg-black p-8 relative overflow-x-auto">
               <button className="absolute right-4 top-4 flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-all">
                 <Copy className="w-3 h-3" /> Copy Code
               </button>
               <pre className="font-mono text-sm leading-relaxed text-slate-300 min-w-max">
                  <span className="text-blue-400">curl</span> -X POST https://api.boltlink.io/v1/shorten \<br/>
                  {"  "}-H <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span> \<br/>
                  {"  "}-H <span className="text-green-400">"Content-Type: application/json"</span> \<br/>
                  {"  "}-d <span className="text-yellow-400">{"{"}</span><br/>
                  {"    "}<span className="text-blue-300">"url"</span>: <span className="text-green-400">"https://example.com/very-long-path-to-resource"</span>,<br/>
                  {"    "}<span className="text-blue-300">"domain"</span>: <span className="text-green-400">"bolt.li"</span>,<br/>
                  {"    "}<span className="text-blue-300">"alias"</span>: <span className="text-green-400">"summer-sale"</span><br/>
                  {"  "}<span className="text-yellow-400">{"}"}</span>
               </pre>
               <div className="mt-8 flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-200">Replace <span className="font-bold text-white font-mono">YOUR_API_KEY</span> with a key from the management section above.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DeveloperSettings;