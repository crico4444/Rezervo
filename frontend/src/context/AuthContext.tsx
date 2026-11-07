import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  email: string;
  nume: string;
  prenume: string;
  rol: 'CLIENT' | 'ADMIN' | 'PROPRIETAR';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User, token?: string) => void;
  isAdmin: () => boolean;
  isProprietar: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Componenta care furnizeaza contextul de autentificare intregii aplicatii
export function AuthProvider({ children }: { children: ReactNode }) {
  // Citim tokenul salvat din localStorage la prima incarcare
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Citim datele utilizatorului salvate in localStorage la prima incarcare
  const [user, setUser] = useState<User | null>(() => {
    const stocat = localStorage.getItem('user');
    return stocat ? JSON.parse(stocat) : null;
  });

  // Salveaza tokenul si datele utilizatorului dupa autentificare reusita
  const login = (tokenNou: string, utilizatorNou: User) => {
    localStorage.setItem('token', tokenNou);
    localStorage.setItem('user', JSON.stringify(utilizatorNou));
    setToken(tokenNou);
    setUser(utilizatorNou);
  };

  // Sterge datele de sesiune si reseteaza starea la deconectare
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Actualizeaza datele utilizatorului in context si localStorage (ex: dupa upgrade la PROPRIETAR)
  const updateUser = (utilizatorActualizat: User, tokenNou?: string) => {
    localStorage.setItem('user', JSON.stringify(utilizatorActualizat));
    setUser(utilizatorActualizat);
    if (tokenNou) {
      localStorage.setItem('token', tokenNou);
      setToken(tokenNou);
    }
  };

  // Returneaza true daca utilizatorul curent are rolul ADMIN
  const isAdmin = () => user?.rol === 'ADMIN';

  // Returneaza true daca utilizatorul curent are rolul PROPRIETAR
  const isProprietar = () => user?.rol === 'PROPRIETAR';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAdmin, isProprietar }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook reutilizabil pentru a accesa contextul de autentificare din orice componenta
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
