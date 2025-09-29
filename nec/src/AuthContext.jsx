import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);

        // Check if user needs to change password (first login for reviewers)
        if (payload.isFirstLogin === true) {
          setRequiresPasswordChange(true);
        } else {
          setRequiresPasswordChange(false);
        }
      } catch (error) {
        console.error('Invalid token');
        logout();
      }
    } else {
      setUser(null);
      setRequiresPasswordChange(false);
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRequiresPasswordChange(false);
    localStorage.removeItem('token');
  };

  const passwordChanged = () => {
    setRequiresPasswordChange(false);
    // Update user state to reflect password change
    if (user) {
      setUser({ ...user, passwordChanged: true });
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      requiresPasswordChange,
      passwordChanged
    }}>
      {children}
    </AuthContext.Provider>
  );
};
