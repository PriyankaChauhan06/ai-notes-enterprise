import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AUTH_LOGOUT_EVENT } from "../utils/auth-events";
import type { User } from "../types/auth-props";
import { loginUser, logoutUser } from "../services/auth.service";
import {
  getAccessToken,
  getStoredUser,
  removeAccessToken,
  removeStoredUser,
  setAccessToken,
  setStoredUser,
  clearLS,
} from "../utils/auth-storage";
import api from "../services/api";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOAuthLogin: (accessToken: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());

  const [accessToken, setAccessTokenState] = useState<string | null>(() =>
    getAccessToken(),
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    function handleLogout() {
      setUser(null);
      setAccessTokenState(null);

      removeAccessToken();
      removeStoredUser();
    }

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    };
  }, []);

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

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setAccessTokenState(null);

      removeAccessToken();
      removeStoredUser();
      clearLS();
    }
  }

  // Google Login
  async function loginWithGoogle(credential: string) {
    setIsLoading(true);

    try {
      const response = await api.post<{
        success: boolean;
        data: {
          accessToken: string;
          user: User;
        };
      }>("/auth/google", {
        credential,
      });

      const result = response.data.data;

      setUser(result.user);
      setAccessTokenState(result.accessToken);

      setAccessToken(result.accessToken);
      setStoredUser(result.user);
    } finally {
      setIsLoading(false);
    }
  }

  // Google Login - Not needed but this is the onother way of login with google
  const completeOAuthLogin = useCallback(async (accessToken: string) => {
    setAccessTokenState(accessToken);
    setAccessToken(accessToken);

    const response = await api.get("/auth/me");

    const user = response.data.data;

    setUser(user);
    setStoredUser(user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        completeOAuthLogin,
        loginWithGoogle,
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
