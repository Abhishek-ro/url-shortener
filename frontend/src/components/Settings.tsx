import React from 'react';
import { User } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const Settings: React.FC = () => {
  const { settings, loading } = useSettings();

  if (loading)
    return (
      <div className='p-8 text-slate-500 font-bold animate-pulse text-center'>
        Loading settings...
      </div>
    );
  if (!settings) return null;

  return (
    <div className='max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500'>
      <div>
        <h1 className='text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight'>
          Settings
        </h1>
        <p className='text-slate-500 dark:text-slate-400 font-medium'>
          Manage your account and preferences.
        </p>
      </div>

      {/* Account Information */}
      <div className='bg-white dark:bg-[#0f141b] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-none space-y-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-600 rounded-lg'>
            <User className='w-5 h-5 text-white' />
          </div>
          <h3 className='text-xl font-bold text-slate-900 dark:text-white'>
            Account Information
          </h3>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12'>
          <div>
            <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1'>
              Username
            </p>
            <p className='text-slate-900 dark:text-white font-bold text-lg'>
              {settings.username}
            </p>
          </div>
          <div>
            <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1'>
              Email Address
            </p>
            <p className='text-slate-900 dark:text-white font-bold text-lg'>
              {settings.email}
            </p>
          </div>
          <div>
            <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1'>
              Member Since
            </p>
            <p className='text-slate-900 dark:text-white font-bold'>
              {new Date(settings.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
