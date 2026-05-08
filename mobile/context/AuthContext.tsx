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
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not logged in and not in auth pages
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if logged in and trying to access auth pages
      router.replace('/(tabs)');
    }
  }, [user, segments, loading]);

  const checkLogin = async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token) {
        const userData = await getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Session expired or error:', error);
      await SecureStore.deleteItemAsync('user_token');
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (token, userData) => {
    await SecureStore.setItemAsync('user_token', token);
    setUser(userData);
  };

  const onLogout = async () => {
    await SecureStore.deleteItemAsync('user_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, onLogin, onLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
