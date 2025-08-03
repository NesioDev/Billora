import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { memo } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  getCurrencySymbol: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          fullName: data.full_name || '',
          companyName: data.company_name || '',
          address: data.address || '',
          contact: data.contact || '',
          paymentInstructions: data.payment_instructions || '',
          currency: data.currency || 'EUR'
        });
      } else {
        // Créer le profil utilisateur s'il n'existe pas
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            currency: 'EUR'
          });

        if (!insertError) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            fullName: '',
            companyName: '',
            address: '',
            contact: '',
            paymentInstructions: '',
            currency: 'EUR'
          });
        }
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (): string => {
    switch (user?.currency) {
      case 'XAF':
      case 'XOF':
        return 'FCFA';
      case 'EUR':
        return '€';
      case 'USD':
        return '$';
      default:
        return '€';
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        console.error('Registration error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profile: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.fullName,
          company_name: profile.companyName,
          address: profile.address,
          contact: profile.contact,
          payment_instructions: profile.paymentInstructions,
          currency: profile.currency
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setUser({ ...user, ...profile });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      getCurrencySymbol
    }}>
      {children}
    </AuthContext.Provider>
  );
};