import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: number;
  name: string;
  ime: string;
  prezime: string;
  email: string;
  telefon?: string;
  datum_rodjenja?: string;
  adresa?: string;
  grad?: string;
  role: string;
  permissions?: string[];
}

type RegistrationType = 'patient' | 'doctor' | 'clinic';

interface RegistrationData {
  telefon?: string;
  grad?: string;
  lokacija?: string;
  adresa?: string;
  specijalnost?: string;
  opis?: string;
  naziv?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, ime: string, prezime: string, type?: RegistrationType, data?: RegistrationData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user from localStorage and validate token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Validate token by fetching current user
          const response = await authAPI.getUser();
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    ime: string,
    prezime: string,
    type: RegistrationType = 'patient',
    data?: RegistrationData
  ) => {
    try {
      const response = await authAPI.register({
        email,
        password,
        password_confirmation: password,
        ime,
        prezime,
        telefon: data?.telefon,
        grad: data?.grad,
      });

      const { user, token } = response.data;

      // Save token and user
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      toast({
        title: 'Registracija uspješna',
        description: 'Dobrodošli!',
      });

      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri registraciji';
      
      toast({
        title: 'Greška pri registraciji',
        description: message,
        variant: 'destructive',
      });

      return { error: { message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;

      // Save token and user
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      toast({
        title: 'Prijava uspješna',
        description: `Dobrodošli, ${user.ime}!`,
      });

      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Greška pri prijavi';
      
      toast({
        title: 'Greška pri prijavi',
        description: message,
        variant: 'destructive',
      });

      return { error: { message } };
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage and state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);

      toast({
        title: 'Odjava uspješna',
        description: 'Doviđenja!',
      });
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getUser();
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
