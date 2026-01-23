import React, { useState, useEffect } from 'react';
import { Activity, Bell, Terminal } from 'lucide-react';
import { useHealth } from "../hooks/useHealth";

const SystemHealth: React.FC = () => {
  const { health, loading } = useHealth();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Simulated live terminal logs
    const initialLogs = [
      '[2023-10-27 14:23:01] INFO: Cluster US-E-01 successfully rebalanced. Target deviation < 2%.',
      '[2023-10-27 14:23:14] HTTP: GET /v1/analytics/link_id=8831 200 OK (14ms)',
      '[2023-10-27 14:24:05] WARN: High memory pressure on Node i-04a82 (Region: EU-Central-1)',
      '[2023-10-27 14:24:12] INFO: Auto-scaling event triggered in ASG-Main-Fleet. Desired: 14 -> 16.',
      '[2023-10-27 14:24:28] ERROR: Connection timeout for Database Cluster EU-WEST-04. Retrying...',
      '[2023-10-27 14:24:35] HTTP: POST /v1/shorten/custom 201 Created (112ms)',
      '[2023-10-27 14:25:01] INFO: Health check completed for all 18 edge locations. All green.'
    ];
    setLogs(initialLogs);

    const logInterval = setInterval(() => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const messages = [
        `INFO: Node heartbeat received from ap-southeast-1-a.`,
        `HTTP: GET /v1/redirect/bolt-sale 302 Found (8ms)`,
        `INFO: Redis cache hit ratio: 98.4%.`,
        `INFO: Flushed 4,502 analytics events to sharded storage.`,
        `WARN: Latency spike detected in eu-west-2 region.`
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [...prev.slice(-15), `[${now}] ${msg}`]);
    }, 3000);

    return () => clearInterval(logInterval);
  }, []);

  if (loading) return <div className="p-8 text-slate-500 font-bold animate-pulse">Loading system health...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              System Health
              <span className="text-xs font-mono text-slate-500 mt-1">// DISTRIBUTED ENGINE</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-xl border border-green-500/20 text-sm font-bold">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
             OPERATIONAL
           </div>
           <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
             <Bell className="w-6 h-6" />
           </button>
        </div>
      </div>

      <div className="bg-[#0f141b] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4 text-slate-300">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Regional Infrastructure Telemetry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {health.map(region => (
            <div key={region.region} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <strong className="text-white group-hover:text-blue-400 transition-colors">{region.region}</strong>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  region.status === 'healthy' ? 'bg-green-500/10 text-green-400' : 
                  region.status === 'degraded' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {region.status}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-500 font-mono">
                <span>CPU: <span className="text-slate-300">{region.cpu}%</span></span>
                <span>MEM: <span className="text-slate-300">{region.memory}%</span></span>
                <span>UPTIME: <span className="text-slate-300">{region.uptime} hrs</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Live Logs */}
      <div className="bg-black border border-slate-800 rounded-2xl p-4 font-mono shadow-2xl">
         <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold mb-4 border-b border-slate-900 pb-2">
            <Terminal className="w-3 h-3" />
            System Logs
         </div>
         <div className="h-48 overflow-y-auto space-y-1 text-xs">
            {logs.map((log, i) => {
              let color = 'text-slate-400';
              if (log.includes('ERROR')) color = 'text-red-400';
              if (log.includes('WARN')) color = 'text-amber-400';
              if (log.includes('HTTP')) color = 'text-blue-400';
              if (log.includes('INFO')) color = 'text-green-400';
              return (
                <div key={i} className={`${color} leading-loose`}>
                   {log}
                </div>
              );
            })}
            <div className="animate-pulse text-white inline-block">_</div>
         </div>
      </div>
    </div>
  );
};

export default SystemHealth;