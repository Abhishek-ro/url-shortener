import React, { useState } from 'react';
import { Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Verify: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      setError('Invalid link');
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log('🔐 Submitting password for code:', code);

      const response = await fetch(`http://localhost:5000/api/verify/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      console.log('Response status:', response.status);

      if (response.status === 200) {
        const data = await response.json();
        console.log('✅ Password correct! Redirecting to:', data.redirect);
        window.location.href = data.redirect;
        return;
      } else if (response.status === 403) {
        const data = await response.json();
        setError('❌ ' + data.error);
        setPassword('');
      } else if (response.status === 404) {
        const data = await response.json();
        setError('🔍 ' + data.error);
      } else if (response.status === 410) {
        const data = await response.json();
        setError('⏰ ' + data.error);
      } else if (response.status === 429) {
        console.log('Rate limit hit');
        window.location.href = 'http://localhost:3000/rate-limit?code=' + code;
        return;
      } else {
        const data = await response.json();
        console.error('Error:', data);
        setError('Error: ' + (data.error || response.status));
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm space-y-6'>
          {/* Icon */}
          <div className='flex justify-center'>
            <div className='bg-blue-500/20 border border-blue-500/30 rounded-full p-4'>
              <Lock className='w-8 h-8 text-blue-400' />
            </div>
          </div>

          {/* Title */}
          <div className='text-center space-y-2'>
            <h1 className='text-3xl font-extrabold text-white'>
              Password Required
            </h1>
            <p className='text-slate-400'>Enter the password to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className='bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
              <p className='text-sm font-semibold'>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter password'
                disabled={loading}
                className='w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                autoFocus
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors'
              >
                {showPassword ? (
                  <EyeOff className='w-5 h-5' />
                ) : (
                  <Eye className='w-5 h-5' />
                )}
              </button>
            </div>

            <button
              type='submit'
              disabled={loading || !password.trim()}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className='w-5 h-5' />
                  Unlock
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verify;
