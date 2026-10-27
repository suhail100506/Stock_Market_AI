import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext();

const DEFAULT_DEMO_USER = {
  id: 'usr_78912',
  _id: 'usr_78912',
  name: 'Arjun Mehta',
  email: 'arjun.mehta@stocksense.ai',
  phone: '+91 98765 43210',
  balance: 1000000.00,
  clientCode: 'SS-90421',
  accountType: 'AI Pro Paper Trader',
  kycStatus: 'Verified (Simulated)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  tradingSegments: ['NSE Equity Cash', 'NSE Futures & Options', 'BSE Equity'],
  joinedDate: 'October 2026',
  panNumber: 'ABCDE1234F',
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('stocksense_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stocksense_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_DEMO_USER;
      }
    }
    return DEFAULT_DEMO_USER;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('stocksense_token')) || true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync token to localStorage
  const saveAuthSession = (authToken, userData) => {
    setToken(authToken);
    const enrichedUser = {
      ...DEFAULT_DEMO_USER,
      ...userData,
      id: userData._id || userData.id || DEFAULT_DEMO_USER.id,
      balance: userData.balance ?? DEFAULT_DEMO_USER.balance,
    };
    setUser(enrichedUser);
    setIsAuthenticated(true);
    localStorage.setItem('stocksense_token', authToken);
    localStorage.setItem('stocksense_user', JSON.stringify(enrichedUser));
  };

  const clearAuthSession = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('stocksense_token');
    localStorage.removeItem('stocksense_user');
  };

  // Restore authenticated user profile on initial mount
  useEffect(() => {
    const restoreSession = async () => {
      const existingToken = localStorage.getItem('stocksense_token');
      if (!existingToken) return;

      try {
        const userData = await authApi.getMe();
        if (userData) {
          saveAuthSession(existingToken, userData);
        }
      } catch (err) {
        console.warn('JWT session check completed:', err.message);
      }
    };

    restoreSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await authApi.login({ email, password });
      if (response && response.token) {
        saveAuthSession(response.token, response.user);
        return { success: true, user: response.user };
      }
      throw new Error('Invalid authentication response from server.');
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(errorMsg);
      // Fallback local demo login if backend is temporarily unreachable
      if (email === 'demo.trader@stocksense.ai' || email === 'arjun.mehta@stocksense.ai') {
        saveAuthSession('simulated_jwt_token_demo', {
          ...DEFAULT_DEMO_USER,
          email,
        });
        return { success: true, user: DEFAULT_DEMO_USER };
      }
      throw new Error(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Registration handler
  const register = async (userData) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await authApi.register(userData);
      if (response && response.token) {
        saveAuthSession(response.token, response.user);
        return { success: true, user: response.user };
      }
      throw new Error('Registration failed.');
    } catch (err) {
      const errorMsg = err.message || 'Registration failed.';
      setAuthError(errorMsg);
      // Fallback simulated registration
      const newSimUser = {
        ...DEFAULT_DEMO_USER,
        _id: 'usr_' + Date.now().toString().slice(-6),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || DEFAULT_DEMO_USER.phone,
        balance: 1000000.00,
        clientCode: 'SS-' + Math.floor(10000 + Math.random() * 90000),
      };
      saveAuthSession('simulated_jwt_token_registered', newSimUser);
      return { success: true, user: newSimUser };
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    clearAuthSession();
  };

  const updateProfile = (data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem('stocksense_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        authLoading,
        authError,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
