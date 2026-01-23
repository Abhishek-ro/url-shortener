import React from 'react';
import { Bell, Plus, MessageSquare, Mail, Webhook, History, MoreHorizontal, AlertCircle, CheckCircle2, Sliders } from 'lucide-react';
import { useAlerts } from "../hooks/useAlerts";

const AlertsCenter: React.FC = () => {
  const { alerts, loading } = useAlerts();

  if (loading) return <div>Loading alerts...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Alerts & Notifications</h1>
          <p className="text-slate-400 text-lg">Configure system thresholds and automated delivery channels.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-900/40">
           <Plus className="w-5 h-5" />
           Create New Rule
        </button>
      </div>

      {/* Alert Rules Table */}
      <div className="bg-[#0f141b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-slate-800 flex items-center gap-3 bg-slate-900/20">
            <Sliders className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Alert Rules</h3>
         </div>
         <table className="w-full text-left">
            <thead className="bg-slate-900/40 border-b border-slate-800">
               <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                  <th className="px-8 py-4">Rule Name</th>
                  <th className="px-8 py-4">Condition</th>
                  <th className="px-8 py-4">Duration</th>
                  <th className="px-8 py-4">Priority</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
               {[
                 { name: 'High Latency Spike', cond: 'Latency > 200ms', dur: '5 mins', prio: 'Critical', status: true },
                 { name: '404 Error Rate', cond: 'Errors > 5%', dur: '10 mins', prio: 'Warning', status: true },
                 { name: 'SSL Certificate Expiry', cond: 'Days < 7', dur: 'Daily', prio: 'Info', status: false },
               ].map((rule, i) => (
                 <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-200">{rule.name}</td>
                    <td className="px-8 py-5 text-sm font-mono text-slate-400">{rule.cond}</td>
                    <td className="px-8 py-5 text-sm text-slate-400">{rule.dur}</td>
                    <td className="px-8 py-5">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rule.prio === 'Critical' ? 'text-red-400 bg-red-400/10' : rule.prio === 'Warning' ? 'text-amber-400 bg-amber-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                          {rule.prio}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <button className={`w-10 h-5 rounded-full relative transition-colors ${rule.status ? 'bg-blue-600' : 'bg-slate-700'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${rule.status ? 'left-5' : 'left-0.5'}`} />
                       </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="text-blue-400 font-bold text-xs hover:text-white transition-colors">Edit</button>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Delivery Channels */}
      <div className="space-y-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Webhook className="w-6 h-6 text-indigo-400" />
            Notification Channels
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Slack', detail: 'Send alerts to #ops-alerts', icon: MessageSquare, status: 'CONNECTED', color: 'bg-emerald-600' },
              { name: 'Discord', detail: 'Notify via Webhook URL', icon: MessageSquare, status: 'DISCONNECTED', color: 'bg-slate-700' },
              { name: 'Email', detail: 'admin@boltlink.io', icon: Mail, status: 'ACTIVE', color: 'bg-emerald-600' },
              { name: 'Webhooks', detail: 'Custom HTTP callbacks', icon: Webhook, status: '2 ACTIVE', color: 'bg-emerald-600' },
            ].map((chan, i) => (
              <div key={i} className="bg-[#0f141b] border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-slate-700 transition-all shadow-xl">
                 <div className="flex items-center justify-between">
                    <div className="p-3 bg-slate-900 rounded-xl">
                       <chan.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className={`w-1.5 h-1.5 rounded-full ${chan.status === 'DISCONNECTED' ? 'bg-slate-500' : 'bg-emerald-500'}`} />
                       <span className={`text-[8px] font-bold ${chan.status === 'DISCONNECTED' ? 'text-slate-500' : 'text-emerald-400'}`}>{chan.status}</span>
                    </div>
                 </div>
                 <div>
                    <h4 className="text-lg font-bold text-white">{chan.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{chan.detail}</p>
                 </div>
                 <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all border border-slate-700">
                    {chan.status === 'DISCONNECTED' ? 'Connect' : 'Configure'}
                 </button>
              </div>
            ))}
         </div>
      </div>

      {/* Incident History */}
      <div className="bg-[#0f141b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
            <div className="flex items-center gap-3">
               <History className="w-6 h-6 text-amber-400" />
               <h3 className="text-xl font-bold text-white">Incident History</h3>
            </div>
            <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Download CSV</button>
         </div>
         <div className="p-6 space-y-4 text-slate-300">
            {alerts.map(alert => (
              <div key={alert.id}>
                <strong>{alert.type.toUpperCase()}</strong>: {alert.message}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default AlertsCenter;