import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiRequest from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.log('Failed to load user from storage');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await apiRequest('/auth/login', 'POST', { email, password });
    await AsyncStorage.setItem('userToken', res.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(res.data));
    setUser(res.data);
  };

  const register = async (userData) => {
    const res = await apiRequest('/auth/register', 'POST', userData);
    await AsyncStorage.setItem('userToken', res.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(res.data));
    setUser(res.data);
  };

  const updateUser = async (updatedData) => {
    const merged = { ...user, ...updatedData };
    await AsyncStorage.setItem('userData', JSON.stringify(merged));
    setUser(merged);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
