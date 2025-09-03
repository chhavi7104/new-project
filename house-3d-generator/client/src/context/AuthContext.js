// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // For default users, check if token is expired
      try {
        // Try to parse as JWT first
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp > Date.now() / 1000) {
          setUser(JSON.parse(userData));
        } else {
          // Token expired, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        // If it's not a standard JWT, it might be our mock token
        try {
          const mockPayload = JSON.parse(atob(token));
          if (mockPayload.exp > Date.now()) {
            setUser(mockPayload.user);
          } else {
            // Mock token expired, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (e2) {
          // Invalid token format, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
  // userData should have {_id, username, email}
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  setUser(userData);
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}