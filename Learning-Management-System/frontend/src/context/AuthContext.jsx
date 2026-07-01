import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    
    // Get user profile
    const profile = await authService.getProfile();
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
    
    return profile;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const getRole = () => {
    if (!user || !user.roles) return null;
    return user.roles[0]?.name || null;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    getRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
