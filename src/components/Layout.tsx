import React, { ReactNode, useState, memo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, FileText, Users, Settings, PlusCircle, Menu, X, FileCheck, HelpCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'new-invoice', label: 'Nouvelle facture', icon: PlusCircle },
    { id: 'help', label: 'Aide', icon: HelpCircle },
    { id: 'profile', label: 'Profil', icon: Settings },
  ];

  const handleNavigate = useCallback((page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  }, [onNavigate]);

  // Composant Logo Billora amélioré pour l'en-tête
  const BilloraLogo = memo(({ className = "text-xl sm:text-2xl" }: { className?: string }) => (
    <div className="flex items-center group cursor-pointer" onClick={() => onNavigate('dashboard')}>
      <div className="relative mr-3 transition-transform group-hover:scale-105">
        {/* Icône de document avec effet de profondeur */}
        <div className="relative">
          <FileCheck className="h-10 w-10 text-blue-600 drop-shadow-sm" />
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-transparent opacity-20 rounded-sm"></div>
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className={`font-bold text-blue-600 leading-tight transition-colors group-hover:text-blue-700 ${className}`}>
          Billora
        </h1>
        <span className="text-xs text-blue-400 font-medium tracking-wide hidden sm:block">
          Facturation Pro
        </span>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BilloraLogo />
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          currentPage === item.id
                            ? 'bg-blue-100 text-blue-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Desktop user menu */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <div className="flex items-center text-xs lg:text-sm text-gray-600 bg-gray-50 px-2 lg:px-3 py-1 lg:py-2 rounded-lg">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate max-w-20 lg:max-w-32 font-medium">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-2 lg:px-3 py-1 lg:py-2 rounded-md text-xs lg:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">Déconnexion</span>
                <span className="lg:hidden">Sortir</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
              
              {/* Mobile user info and logout */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-md mb-2">
                  <User className="h-4 w-4 mr-2" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-6 xl:px-8">
        {children}
      </main>
    </div>
  );
};

export default memo(Layout);