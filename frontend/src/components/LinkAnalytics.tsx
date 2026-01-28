import React, { useState } from 'react';
import {
  MousePointer2,
  Timer,
  Target,
  Globe,
  ChevronDown,
  Download,
  Monitor,
  Sparkles,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { GoogleGenAI } from '@google/genai';
import { useAnalytics } from '../hooks/useAnalytics';

const LinkAnalytics: React.FC = () => {
  const { data, loading } = useAnalytics();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const getAiInsight = async () => {
    if (!data) return;
    setIsLoadingInsight(true);
    try {
      const ai = new (GoogleGenAI as any)({
        apiKey: import.meta.env.VITE_GEMINI_KEY,
      });
      const model = (ai as any).getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const topRegionStats = data.topRegions?.[0] || null;
      const statsContext = `
        Total Clicks: ${data.summary.totalClicks}, 
        Total Links: ${data.summary.totalLinks || 0},
        Top Region: ${data.summary.topRegion}, 
        Top Device: ${data.summary.topDevice || 'UNKNOWN'}, 
        Conversion Rate: ${data.summary.conversionRate}%.
      `;

      const prompt = `Analyze this link traffic: ${statsContext}. Suggest 2 specific optimization strategies in a concise paragraph.`;
      const result = await model.generateContent(prompt);
      setAiInsight(result.response.text());
    } catch (e) {
      setAiInsight(
        'Unable to generate insights. Please check your API configuration.',
      );
    } finally {
      setIsLoadingInsight(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin' />
          <p className='text-slate-500 font-bold text-sm animate-pulse'>
            Loading Analytics Engine...
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.summary.totalClicks === 0) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <div className='p-4 bg-slate-900/50 rounded-full'>
            <MousePointer2 className='w-8 h-8 text-slate-600' />
          </div>
          <div>
            <h3 className='text-xl font-bold text-white mb-2'>
              No Analytics Data Yet
            </h3>
            <p className='text-slate-500 text-sm'>
              Create some short links and click on them to see analytics data
              appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Convert device/userAgent data into pie chart format for display
  const deviceStats = data.summary.topDevice
    ? [
        {
          name: data.summary.topDevice.split('/')[0] || 'Browser',
          value: 65,
          color: '#3b82f6',
        },
        { name: 'Other', value: 35, color: '#1e293b' },
      ]
    : [
        { name: 'Browser', value: 65, color: '#3b82f6' },
        { name: 'Other', value: 35, color: '#1e293b' },
      ];

  const summaryStats = [
    {
      label: 'Total Clicks',
      val: data.summary.totalClicks.toLocaleString(),
      change: '+12.5%',
      icon: MousePointer2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Top Region',
      val: data.summary.topRegion || 'UNKNOWN',
      change: 'Primary',
      icon: Globe,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Avg. Latency',
      val: `${data.summary.avgLatency || 14}ms`,
      change: '+2%',
      icon: Timer,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      down: true,
    },
    {
      label: 'Conversion Rate',
      val: `${data.summary.conversionRate}%`,
      change: '+0.4%',
      icon: Target,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className='space-y-8 animate-in fade-in duration-700'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-slate-500 text-xs font-medium'>
            <span>Dashboard</span>{' '}
            <ChevronDown className='w-3 h-3 -rotate-90' />{' '}
            <span>Platform Analytics</span>
          </div>
          <h1 className='text-4xl font-black text-white tracking-tight'>
            Global Traffic Controller
          </h1>
          <div className='flex items-center gap-2 text-slate-500 font-mono text-xs'>
            <LinkIcon className='w-3 h-3' />
            Instance:{' '}
            <span className='text-slate-400'>boltlink-cluster-v4-main</span>
          </div>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={getAiInsight}
            disabled={isLoadingInsight}
            className='bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50'
          >
            {isLoadingInsight ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Sparkles className='w-4 h-4' />
            )}
            Get AI Analysis
          </button>
          <button className='bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-all'>
            <Download className='w-4 h-4' /> Export
          </button>
        </div>
      </div>

      {/* AI Insight Panel */}
      {aiInsight && (
        <div className='bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-6 rounded-3xl animate-in zoom-in-95'>
          <h4 className='text-indigo-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2'>
            <Sparkles className='w-4 h-4' /> Gemini AI Performance Insight
          </h4>
          <p className='text-white text-sm leading-relaxed max-w-4xl'>
            {aiInsight}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {summaryStats.map((m, i) => (
          <div
            key={i}
            className='bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all'
          >
            <div className='flex justify-between items-start mb-4'>
              <div className={`p-3 ${m.bg} rounded-2xl`}>
                <m.icon className={`w-6 h-6 ${m.color}`} />
              </div>
              <span
                className={`text-xs font-bold ${m.down ? 'text-amber-400' : 'text-green-400'}`}
              >
                {m.change}
              </span>
            </div>
            <p className='text-slate-500 text-sm font-bold uppercase tracking-widest mb-1'>
              {m.label}
            </p>
            <h4 className='text-2xl font-black text-white'>{m.val}</h4>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className='bg-[#0f141b] border border-slate-800 rounded-3xl p-8 shadow-2xl'>
        <h3 className='text-xl font-bold text-white mb-8'>
          Global Click Pulse
        </h3>
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data.points}>
              <defs>
                <linearGradient id='colorClicks' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f141b',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
              />
              <Area
                type='monotone'
                dataKey='clicks'
                stroke='#3b82f6'
                fillOpacity={1}
                fill='url(#colorClicks)'
                strokeWidth={4}
              />
              <XAxis dataKey='timestamp' hide={true} />
              <YAxis hide={true} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geodata & Platform Distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 bg-[#0f141b] border border-slate-800 rounded-3xl p-8 shadow-2xl'>
          <h3 className='text-xl font-bold text-white mb-8 flex items-center gap-3'>
            <Globe className='w-6 h-6 text-blue-400' /> Geodata
          </h3>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='flex-1 bg-slate-900/50 rounded-2xl min-h-[200px] border border-slate-800 flex items-center justify-center relative overflow-hidden'>
              <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-center bg-no-repeat invert" />
              <div className='relative text-blue-500 font-mono text-xs'>
                {data.topRegions && data.topRegions.length > 0
                  ? 'Real-time Map Data'
                  : 'Awaiting Data...'}
              </div>
            </div>
            <div className='w-full md:w-64 space-y-4'>
              {(data.topRegions || []).slice(0, 5).map((item, idx) => (
                <div key={idx}>
                  <div className='flex justify-between text-xs font-bold text-slate-400 mb-1'>
                    <span>{item.region}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className='h-1 bg-slate-800 rounded-full'>
                    <div
                      className='h-full bg-blue-500'
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='lg:col-span-4 bg-[#0f141b] border border-slate-800 rounded-3xl p-8 shadow-2xl'>
          <h3 className='text-xl font-bold text-white mb-8 flex items-center gap-3'>
            <Monitor className='w-6 h-6 text-indigo-400' /> Device
          </h3>
          <div className='h-48'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={deviceStats}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey='value'
                >
                  {deviceStats.map((e, i) => (
                    <Cell key={i} fill={e.color} stroke='none' />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className='flex justify-center gap-4 mt-4 text-[10px] font-bold text-slate-500 uppercase'>
            {deviceStats.map((stat, idx) => (
              <span key={idx} className='flex items-center gap-1'>
                <div
                  className='w-2 h-2 rounded-full'
                  style={{ backgroundColor: stat.color }}
                />{' '}
                {stat.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkAnalytics;
