import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
}

interface Empresa {
  id: number;
  cnpj: string;
  razao_social: string;
}

interface AuthContextData {
  user: User | null;
  empresa: Empresa | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, empresaId: number) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Carregar dados do localStorage
    const storedToken = localStorage.getItem('@eZion:token');
    const storedUser = localStorage.getItem('@eZion:user');
    const storedEmpresa = localStorage.getItem('@eZion:empresa');

    if (storedToken && storedUser && storedEmpresa) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setEmpresa(JSON.parse(storedEmpresa));
    }
  }, []);

  const login = async (username: string, password: string, empresaId: number) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        empresa_id: empresaId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao fazer login');
    }

    const data = await response.json();

    localStorage.setItem('@eZion:token', data.token);
    localStorage.setItem('@eZion:user', JSON.stringify(data.user));
    localStorage.setItem('@eZion:empresa', JSON.stringify(data.empresa));

    setToken(data.token);
    setUser(data.user);
    setEmpresa(data.empresa);
  };

  const logout = () => {
    localStorage.removeItem('@eZion:token');
    localStorage.removeItem('@eZion:user');
    localStorage.removeItem('@eZion:empresa');

    setToken(null);
    setUser(null);
    setEmpresa(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        empresa,
        token,
        isAuthenticated: !!token,
        login,
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
