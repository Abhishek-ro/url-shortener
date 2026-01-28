import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

const RateLimitError: React.FC = () => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm space-y-6 text-center'>
          <div className='flex justify-center'>
            <div className='bg-red-500/20 border border-red-500/30 rounded-full p-4'>
              <AlertTriangle className='w-8 h-8 text-red-400' />
            </div>
          </div>

          <div className='space-y-2'>
            <h1 className='text-3xl font-extrabold text-white'>
              Rate Limit Exceeded
            </h1>
            <p className='text-slate-400'>
              You've clicked this link too many times in a short period.
            </p>
          </div>

          <div className='flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-4'>
            <Clock className='w-6 h-6 text-red-400 animate-spin' />
            <div className='text-left'>
              <p className='text-sm text-slate-400'>Try again in</p>
              <p className='text-2xl font-bold text-red-400'>{countdown}s</p>
            </div>
          </div>

          <p className='text-sm text-slate-500'>
            This link has a rate limit to prevent abuse. Please wait before
            accessing it again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RateLimitError;
