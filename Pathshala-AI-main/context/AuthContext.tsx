'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  industry: string;
  skills: string[];
  image?: string;
  credits: number; // Add credits field
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, imageUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCredits: (newCredits: number) => void; // Add this function
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      const meRes = await fetch('/api/auth/me');
      const { user } = await meRes.json();
      setUser(user);
      toast.success('Logged in successfully!');
      router.push('/roadmap');
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, imageUrl?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      // Now that the user is created and logged in (cookie is set), fetch their data
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const { user } = await meRes.json();
        setUser(user);
        toast.success('Account created successfully!');
        router.push('/onboarding');
      } else {
        throw new Error('Failed to fetch user data after signup.');
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateCredits = (newCredits: number) => {
    if (user) {
      setUser({ ...user, credits: newCredits });
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, logout, updateCredits, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};