import React, { useState } from 'react';
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader,
  Eye,
  EyeOff,
} from 'lucide-react';
import { authService } from '../services/auth.service';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const validateForm = (): string => {
    if (!formData.name.trim()) {
      return 'Please enter your name.';
    }
    if (!formData.email.trim()) {
      return 'Please enter your email address.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address.';
    }
    if (!formData.password.trim()) {
      return 'Please enter a password.';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      onRegisterSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Registration failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#0b0e14] p-4'>
      <div className='w-full max-w-md'>
        <div className='flex flex-col items-center mb-8'>
          <div className='bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20 mb-4'>
            <Zap className='w-10 h-10 text-white fill-current' />
          </div>
          <h1 className='text-3xl font-black text-white tracking-tighter'>
            BoltLink
          </h1>
          <p className='text-slate-500 font-medium'>Create your account</p>
        </div>

        <div className='bg-[#0f141b] border border-slate-800 p-8 rounded-3xl shadow-2xl'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1'>
                Full Name
              </label>
              <div className='relative'>
                <User className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500' />
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='John Doe'
                  className='w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'
                />
              </div>
            </div>

            <div>
              <label className='block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500' />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='you@example.com'
                  className='w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'
                />
              </div>
            </div>

            <div>
              <label className='block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='At least 8 characters'
                  className='w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className='block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1'>
                Confirm Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500' />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder='Repeat your password'
                  className='w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className='flex items-center gap-2 text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-1 p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
                <AlertCircle className='w-4 h-4 flex-shrink-0' />
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20'
            >
              {loading ? (
                <>
                  <Loader className='w-5 h-5 animate-spin' />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className='w-5 h-5' />
                </>
              )}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-slate-500 text-sm'>
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className='text-blue-400 hover:text-blue-300 font-semibold transition-colors'
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <p className='text-center mt-8 text-slate-600 text-xs uppercase tracking-widest font-bold'>
          System Status: <span className='text-green-500'>Operational</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
