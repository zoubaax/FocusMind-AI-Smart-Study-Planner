import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getMe } from '../api/auth';
import { useRouter, useSegments } from 'expo-router';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkLogin();
  }, []);

  // Protect routes logic
  useEffect(() => {
    // Wait until the initial check is complete
    if (loading) return;

    const inAuthGroup = segments.some(s => s === '(auth)' || s === 'login' || s === 'register');
    
    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, segments, loading]);

  const checkLogin = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('user_token');
      if (token) {
        const userData = await getMe();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session expired or error:', error);
      await SecureStore.deleteItemAsync('user_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (token, userData) => {
    await SecureStore.setItemAsync('user_token', token);
    
    // If user data wasn't provided (backend only sent token), fetch it now
    if (!userData) {
      try {
        const profile = await getMe();
        setUser(profile);
      } catch (error) {
        console.error('Failed to fetch profile after login:', error);
      }
    } else {
      setUser(userData);
    }
  };

  const onLogout = async () => {
    await SecureStore.deleteItemAsync('user_token');
    setUser(null);
    // Let the useEffect handle the redirection
  };

  return (
    <AuthContext.Provider value={{ user, loading, onLogin, onLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
