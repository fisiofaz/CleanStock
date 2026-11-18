import { createContext, useContext, useState, type ReactNode } from "react";

import { login as authenticate } from "@/services/authService";
import type { AuthUser } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("cleanstock_token"),
  );

  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = sessionStorage.getItem("cleanstock_user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      sessionStorage.removeItem("cleanstock_user");
      return null;
    }
  });

  async function login(email: string, password: string) {
    const response = await authenticate({ email, password });

    sessionStorage.setItem("cleanstock_token", response.token);
    sessionStorage.setItem("cleanstock_user", JSON.stringify(response.user));

    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    sessionStorage.removeItem("cleanstock_token");
    sessionStorage.removeItem("cleanstock_user");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider.");
  }

  return context;
}
