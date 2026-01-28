import React, { useEffect, useState } from 'react';
import { View } from '../../types';

interface AuthGuardProps {
  children: React.ReactNode;
  onNavigate: (v: View) => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, onNavigate }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const apiKey = localStorage.getItem('bolt_api_key');

    if (!apiKey) {
      setIsAuthorized(false);
      onNavigate(View.LOGIN);
    } else {
      setIsAuthorized(true);
    }
  }, [onNavigate]);

  if (isAuthorized === null || isAuthorized === false) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
