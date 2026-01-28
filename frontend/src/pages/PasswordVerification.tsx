import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PasswordVerification: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    if (!code) {
      setError('❌ No link code provided. Invalid access.');
    }
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      setError('❌ No link code provided.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/${code}?password=${encodeURIComponent(
          password,
        )}`,
        { method: 'POST' },
      );

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data?.redirect) {
          window.location.href = data.redirect;
          return;
        }
      }

      if (response.status === 403) {
        setError('❌ Incorrect password. Please try again.');
        setPassword('');
      } else if (response.status === 410) {
        setError('⏰ This link has expired.');
      } else if (response.status === 429) {
        navigate('/rate-limit');
      } else if (response.status === 404) {
        setError('🔍 Link not found.');
      } else {
        setError(
          `Failed to verify password (${response.status}). Please try again.`,
        );
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm space-y-6'>
          <div className='flex justify-center'>
            <div className='bg-blue-500/20 border border-blue-500/30 rounded-full p-4'>
              <Lock className='w-8 h-8 text-blue-400' />
            </div>
          </div>

          <div className='text-center space-y-2'>
            <h1 className='text-3xl font-extrabold text-white'>
              Password Required
            </h1>
            <p className='text-slate-400'>
              This link is password protected. Enter the password to continue.
            </p>
          </div>

          {error && (
            <div className='bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
              <p className='text-sm font-semibold'>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-semibold text-slate-300 mb-2'>
                Enter Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                disabled={loading}
                className='w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50'
                autoFocus
              />
            </div>

            <button
              type='submit'
              disabled={loading || !password.trim()}
              className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className='w-5 h-5' />
                  Unlock Link
                </>
              )}
            </button>
          </form>

          <p className='text-center text-xs text-slate-500'>
            This link requires a password to access. Please enter it above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordVerification;
