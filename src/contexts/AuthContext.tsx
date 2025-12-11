import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  hasVoted: boolean;
  login: (token: string) => void;
  logout: () => void;
  setVoted: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const voted = localStorage.getItem('hasVoted');
    
    if (token) {
      setIsAuthenticated(true);
    }
    if (voted === 'true') {
      setHasVoted(true);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hasVoted');
    setIsAuthenticated(false);
    setHasVoted(false);
  };

  const setVoted = () => {
    localStorage.setItem('hasVoted', 'true');
    setHasVoted(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, hasVoted, login, logout, setVoted }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
