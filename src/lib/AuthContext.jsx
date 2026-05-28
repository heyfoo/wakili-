import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Initialize auth state
    const token = localStorage.getItem('token') || localStorage.getItem('base44_access_token');
    if (token) {
      setAuth({ token, isAuthenticated: true });
    }
    setIsLoadingAuth(false);
    setIsLoadingPublicSettings(false);
  }, []);

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('base44_access_token');
    setAuth(null);
    navigateToLogin();
  };

  const value = {
    auth,
    setAuth,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    setAuthError,
    navigateToLogin,
    logout,
    isAuthenticated: !!auth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
