import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';
import { MOCK_USER } from '../utils/mockData.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hooklens_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch {
          setUser(MOCK_USER);
        }
      } else {
        // Default demo session for smooth developer exploration
        setUser(MOCK_USER);
        setToken('mock_demo_token');
        localStorage.setItem('hooklens_token', 'mock_demo_token');
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.token) {
      setToken(res.token);
      localStorage.setItem('hooklens_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const signup = async (userData) => {
    const res = await authApi.signup(userData);
    if (res.token) {
      setToken(res.token);
      localStorage.setItem('hooklens_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const loginWithGoogle = async () => {
    const res = await authApi.loginWithGoogle();
    if (res.token) {
      setToken(res.token);
      localStorage.setItem('hooklens_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hooklens_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
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
