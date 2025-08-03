import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import InvoiceCreator from './components/InvoiceCreator';
import ProfileSetup from './components/ProfileSetup';
import HelpPage from './components/HelpPage';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // Check if profile is complete
  const isProfileComplete = user && user.fullName && user.companyName && user.address && user.contact && user.currency;

  if (!isProfileComplete && currentPage !== 'profile') {
    return <ProfileSetup onComplete={() => setCurrentPage('dashboard')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientManager />;
      case 'new-invoice':
        return <InvoiceCreator onComplete={() => setCurrentPage('dashboard')} />;
      case 'profile':
        return <ProfileSetup onComplete={() => setCurrentPage('dashboard')} />;
      case 'help':
        return <HelpPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </DataProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;