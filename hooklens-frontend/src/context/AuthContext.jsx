import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';
import { connectSocket, disconnectSocket } from '../socket/socketClient.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('hooklens_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hooklens_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Helper to validate JWT expiration on client-side
  const isJwtExpired = (jwtToken) => {
    if (!jwtToken) return true;
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return true;
      }
      return false;
    } catch {
      return true;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hooklens_token');
    localStorage.removeItem('hooklens_user');
    disconnectSocket();
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hooklens_token');
      if (storedToken) {
        if (isJwtExpired(storedToken)) {
          logout();
          setLoading(false);
          return;
        }
        connectSocket(storedToken);
        if (!user) {
          try {
            const userData = await authApi.getCurrentUser();
            setUser(userData);
            localStorage.setItem('hooklens_user', JSON.stringify(userData));
          } catch {
            logout();
          }
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('hooklens_token', res.token);
      localStorage.setItem('hooklens_user', JSON.stringify(res.user));
      connectSocket(res.token);
    }
    return res;
  };

  const signup = async (userData) => {
    const res = await authApi.signup(userData);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('hooklens_token', res.token);
      localStorage.setItem('hooklens_user', JSON.stringify(res.user));
      connectSocket(res.token);
    }
    return res;
  };

  const loginWithGoogle = async (credential) => {
    const res = await authApi.loginWithGoogle(credential);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('hooklens_token', res.token);
      localStorage.setItem('hooklens_user', JSON.stringify(res.user));
      connectSocket(res.token);
    }
    return res;
  };

  const isAuthenticated = !!token && !isJwtExpired(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
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

export default AuthContext;
