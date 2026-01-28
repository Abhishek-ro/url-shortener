import React from 'react';
import DashboardComponent from '../components/Dashboard';
import { View } from '../../types';

const DashboardPage: React.FC = () => {
  const handleNavigate = (view: View) => {};

  return <DashboardComponent onNavigate={handleNavigate} />;
};

export default DashboardPage;
