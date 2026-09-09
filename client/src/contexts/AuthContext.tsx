import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import type { User } from "../types/auth-props";
import { loginUser } from "../services/auth.service";
import {
  getAccessToken,
  getStoredUser,
  removeAccessToken,
  removeStoredUser,
  setAccessToken,
  setStoredUser,
  clearLS,
} from "../utils/auth-storage";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());

  const [accessToken, setAccessTokenState] = useState<string | null>(() =>
    getAccessToken(),
  );
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    setIsLoading(true);

    try {
      const result = await loginUser({ email, password });

      setUser(result.user);
      setAccessTokenState(result.accessToken);

      setAccessToken(result.accessToken);
      setStoredUser(result.user);
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setAccessTokenState(null);

    removeAccessToken();
    removeStoredUser();
    clearLS();
    navigate("/", { replace: true });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
