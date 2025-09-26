import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { memo } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Timeout pour les requêtes Supabase (5 minutes)
const SUPABASE_TIMEOUT = 300000;

// Fonction utilitaire pour ajouter un timeout aux requêtes
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Requête trop longue')), timeoutMs)
    )
  ]);
};

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initAuth = async () => {
      try {
        // Timeout de sécurité global
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Timeout d\'initialisation auth - passage en mode offline');
            setError('Connexion lente - mode offline activé');
            setLoading(false);
          }
        }, SUPABASE_TIMEOUT);

        // Vérifier la session existante avec timeout
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error: sessionError } = await withTimeout(sessionPromise, SUPABASE_TIMEOUT);
        
        if (!mounted) return;
        
        clearTimeout(timeoutId);
        
        if (sessionError) {
          console.error('Erreur session:', sessionError);
          setError(sessionError.message || 'Erreur de connexion');
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          console.error('Erreur initialisation auth:', error);
          setError(error instanceof Error ? error.message : 'Erreur de connexion');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setError(null); // Reset error on auth change
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    if (!authUser?.id) {
      console.error('AuthUser invalide');
      setLoading(false);
      return;
    }

    try {
      // Requête avec timeout
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
        
      const { data, error } = await withTimeout(profilePromise, SUPABASE_TIMEOUT);

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        setError(error.message || 'Erreur de chargement du profil');
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
        const insertPromise = supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            currency: 'EUR'
          });
          
        const { error: insertError } = await withTimeout(insertPromise, SUPABASE_TIMEOUT);

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
      setLoading(false);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setError(error instanceof Error ? error.message : 'Erreur de chargement du profil');
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
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password
      });
      
      const { error } = await withTimeout(loginPromise, SUPABASE_TIMEOUT);

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
      const registerPromise = supabase.auth.signUp({
        email,
        password
      });
      
      const { error } = await withTimeout(registerPromise, SUPABASE_TIMEOUT);

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
      const updatePromise = supabase
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
        
      const { error } = await withTimeout(updatePromise, SUPABASE_TIMEOUT);

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
          <p className="mt-2 text-gray-600 text-sm">
            {error ? 'Connexion en cours...' : 'Chargement...'}
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md max-w-sm mx-auto">
              <p className="text-yellow-800 text-xs">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-yellow-600 hover:text-yellow-800 underline"
              >
                Réessayer
              </button>
            </div>
          )}
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