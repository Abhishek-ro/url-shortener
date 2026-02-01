import React, { useState } from 'react';
import {
  MousePointer2,
  Link as LinkIcon,
  Globe2,
  ArrowUpRight,
  ChevronRight,
  Zap,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { View } from '../../types';
import { useTopLinks } from '../hooks/useTopLinks';

const statStyles = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
};

const Dashboard: React.FC<{ onNavigate: (v: View) => void }> = ({
  onNavigate,
}) => {
  const { topLinks, loading, error } = useTopLinks(10);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin' />
          <p className='text-slate-500 font-bold text-sm animate-pulse'>
            Synchronizing Engine...
          </p>
        </div>
      </div>
    );
  }

  const totalClicks = topLinks.reduce(
    (sum, link) => sum + (link.clicks || 0),
    0,
  );
  const activeLinks = topLinks.length;

  const stats = [
    {
      icon: MousePointer2,
      label: 'Total Clicks',
      val: totalClicks.toLocaleString(),
      change: '+12%',
      color: 'blue' as const,
    },
    {
      icon: LinkIcon,
      label: 'Active Links',
      val: activeLinks.toLocaleString(),
      change: '+2',
      color: 'indigo' as const,
    },
    {
      icon: Globe2,
      label: 'Top Domain',
      val: topLinks[0]?.originalUrl?.split('/')[2]?.substring(0, 15) || 'N/A',
      change: 'Primary',
      color: 'cyan' as const,
    },
  ];

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {stats.map((stat, i) => (
          <div
            key={i}
            className='bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:border-blue-500/30 transition-all shadow-lg dark:shadow-none group'
          >
            <div className='flex justify-between items-start mb-4'>
              <div className={`p-3 rounded-2xl ${statStyles[stat.color].bg}`}>
                <stat.icon
                  className={`w-6 h-6 ${statStyles[stat.color].text}`}
                />
              </div>
              <div className='flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold bg-green-500/10 px-2 py-0.5 rounded-full'>
                <ArrowUpRight className='w-3 h-3' />
                {stat.change}
              </div>
            </div>
            <p className='text-slate-500 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1'>
              {stat.label}
            </p>
            <h2 className='text-3xl font-black text-slate-900 dark:text-white tracking-tighter truncate'>
              {stat.val}
            </h2>
          </div>
        ))}
      </div>

      <div className='bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-lg dark:shadow-none'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
            <Zap className='w-5 h-5 text-blue-600 dark:text-blue-400' />
            Top Performing Links
          </h3>
        </div>

        {error ? (
          <div className='text-center py-8'>
            <AlertCircle className='w-8 h-8 text-slate-400 mx-auto mb-2' />
            <p className='text-slate-500'>{error}</p>
          </div>
        ) : topLinks.length === 0 ? (
          <div className='text-center py-8'>
            <LinkIcon className='w-8 h-8 text-slate-400 mx-auto mb-2' />
            <p className='text-slate-500'>No links created yet</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-200 dark:border-slate-700'>
                  <th className='text-left py-3 px-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]'>
                    Short Code
                  </th>
                  <th className='text-left py-3 px-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]'>
                    Destination
                  </th>
                  <th className='text-right py-3 px-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]'>
                    Clicks
                  </th>
                  <th className='text-right py-3 px-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]'>
                    Created
                  </th>
                  <th className='text-center py-3 px-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {topLinks.map((link) => (
                  <tr
                    key={link.id}
                    className='border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors'
                  >
                    <td className='py-3 px-4'>
                      <code className='bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-mono font-bold'>
                        {link.shortCode}
                      </code>
                    </td>
                    <td className='py-3 px-4'>
                      <p className='text-slate-700 dark:text-slate-300 truncate max-w-xs'>
                        {link.originalUrl}
                      </p>
                    </td>
                    <td className='py-3 px-4 text-right'>
                      <span className='font-bold text-slate-900 dark:text-white'>
                        {link.clicks?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className='py-3 px-4 text-right text-slate-500 dark:text-slate-400'>
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <a
                        href={`https://url-shortener-1-9268.onrender.com/api/${link.shortCode}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors'
                      >
                        <ExternalLink className='w-4 h-4' />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
