import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { authService } from '../services/auth.service';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsOpen(false);
    onLogout();
  };

  if (!user) return null;

  return (
    <nav className='bg-[#0f141b] border-b border-slate-800 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center gap-2'>
            <div className='bg-blue-600 p-2 rounded-lg'>
              <Zap className='w-6 h-6 text-white fill-current' />
            </div>
            <span className='text-white font-bold text-lg hidden sm:inline'>
              BoltLink
            </span>
          </div>

          {/* User Menu - Desktop */}
          <div className='hidden sm:block'>
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors'
              >
                <div className='flex flex-col items-end'>
                  <span className='text-sm font-medium text-white'>
                    {user.name || user.email}
                  </span>
                  <span className='text-xs text-slate-500'>{user.role}</span>
                </div>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className='w-8 h-8 rounded-full object-cover'
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center'>
                    <span className='text-xs font-bold text-white'>
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className='absolute right-0 mt-2 w-56 bg-[#0b0e14] border border-slate-800 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2'>
                  <div className='p-4 border-b border-slate-800'>
                    <p className='text-sm text-white font-medium'>
                      {user.name || 'User'}
                    </p>
                    <p className='text-xs text-slate-500'>{user.email}</p>
                  </div>

                  <div className='py-2'>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        // Handle profile navigation
                      }}
                      className='w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition-colors'
                    >
                      <User className='w-4 h-4' />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        // Handle settings navigation
                      }}
                      className='w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition-colors'
                    >
                      <Settings className='w-4 h-4' />
                      Settings
                    </button>
                  </div>

                  <div className='border-t border-slate-800 p-2'>
                    <button
                      onClick={handleLogout}
                      className='w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors rounded'
                    >
                      <LogOut className='w-4 h-4' />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='sm:hidden text-slate-400 hover:text-white transition-colors'
          >
            {mobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='sm:hidden border-t border-slate-800 py-4 space-y-2'>
            <div className='px-4 py-2 border-b border-slate-800 mb-2'>
              <p className='text-sm text-white font-medium'>
                {user.name || 'User'}
              </p>
              <p className='text-xs text-slate-500'>{user.email}</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className='w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition-colors text-left'
            >
              <User className='w-4 h-4' />
              Profile
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className='w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-3 transition-colors text-left'
            >
              <Settings className='w-4 h-4' />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className='w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors text-left'
            >
              <LogOut className='w-4 h-4' />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
