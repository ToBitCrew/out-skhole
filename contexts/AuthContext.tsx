import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AuthUser } from "@/types/api";
import * as authApi from "@/services/auth";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (contact: string, password: string) => Promise<void>;
  register: (body: {
    handle_nm: string;
    nick_nm: string;
    password: string;
    email: string;
    school_cd: string;
    dept_cd: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const stored = await AsyncStorage.getItem("user");
        if (token && stored) {
          setUser(JSON.parse(stored));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "login" || segments[0] === "register";
    if (!user && !inAuth) {
      router.replace("/login");
    } else if (user && inAuth) {
      router.replace("/");
    }
  }, [user, segments, loading, router]);

  const login = useCallback(async (contact: string, password: string) => {
    const result = await authApi.login({
      contact,
      password,
      device: "mobile-app",
    });
    await AsyncStorage.setItem("accessToken", result.accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (body: {
      handle_nm: string;
      nick_nm: string;
      password: string;
      email: string;
      school_cd: string;
      dept_cd: string;
    }) => {
      await authApi.register(body);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
