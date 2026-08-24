import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { User, AuthContextType } from '../types/auth';

const AUTH_TOKEN_KEY = 'authToken';

const AuthContext = createContext<AuthContextType | null>(null);

// ---------- AuthProvider ----------

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama açılışında kayıtlı token'ı kontrol et
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

        if (savedToken) {
          // Token varsa /auth/me ile doğrula
          const response = await api.get<User>('/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          setToken(savedToken);
          setUser(response.data);
        }
      } catch (error: unknown) {
        // 401 veya ağ hatası → token geçersiz, temizle
        console.error('[AuthContext] Token doğrulama başarısız, oturum sıfırlandı:', error);
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  // ---------- login ----------
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', {
        email,
        password,
      });

      const { access_token } = response.data;

      // Token'ı hem state'e hem kalıcı depolamaya kaydet
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, access_token);
      setToken(access_token);

      // Kullanıcı bilgilerini çek
      const meResponse = await api.get<User>('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setUser(meResponse.data);
    } catch (error: unknown) {
      console.error('[AuthContext] Login başarısız:', error);
      throw error;
    }
  };

  // ---------- register ----------
  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      await api.post('/auth/register', { name, email, password });
      // Kayıt başarılıysa otomatik giriş yap
      await login(email, password);
    } catch (error: unknown) {
      console.error('[AuthContext] Kayıt başarısız:', error);
      throw error;
    }
  };

  // ---------- updateProfile ----------
  const updateProfile = async (data: { name?: string; email?: string }): Promise<void> => {
    try {
      const response = await api.patch<User>('/auth/me', data);
      setUser(response.data);
    } catch (error: unknown) {
      console.error('[AuthContext] Profil güncelleme başarısız:', error);
      throw error;
    }
  };

  // ---------- changePassword ----------
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.patch('/auth/me/password', { currentPassword, newPassword });
      // Backend, şifre değişince eski token'ı geçersiz kılıyor — bu yüzden
      // kullanıcıyı otomatik çıkış yaptırıp yeniden giriş yapmaya yönlendiriyoruz.
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      setUser(null);
    } catch (error: unknown) {
      console.error('[AuthContext] Şifre değiştirme başarısız:', error);
      throw error;
    }
  };

  // ---------- logout ----------
  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error: unknown) {
      console.error('[AuthContext] Logout sırasında AsyncStorage hatası:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------- useAuth hook ----------

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth, bir <AuthProvider> içinde kullanılmalıdır.');
  }

  return context;
}
