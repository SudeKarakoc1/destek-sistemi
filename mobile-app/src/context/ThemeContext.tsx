import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Renk paleti tipleri ───────────────────────────────────────────────────

export interface ThemeColors {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

const DARK_COLORS: ThemeColors = {
  background: '#161616',
  card: '#1C1C1C',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  accent: '#5c642a',
};

const LIGHT_COLORS: ThemeColors = {
  background: '#FAF9F6',
  card: '#F0EEE8',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  accent: '#5c642a',
};

const STORAGE_KEY = 'theme_preference';

// ─── Context tipi ─────────────────────────────────────────────────────────

interface ThemeContextType {
  isLightMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

// ─── Context ──────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isLightMode, setIsLightMode] = useState(false); // varsayılan: koyu

  // Uygulama açılışında kayıtlı tercihi yükle
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'light') setIsLightMode(true);
      else if (value === 'dark') setIsLightMode(false);
      // null/undefined → varsayılan koyu kalır
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsLightMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'light' : 'dark');
      return next;
    });
  }, []);

  // Aktif temaya göre renk paleti — isLightMode değişince yeniden hesaplanır
  const colors = useMemo<ThemeColors>(
    () => (isLightMode ? LIGHT_COLORS : DARK_COLORS),
    [isLightMode],
  );

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── useTheme hook ────────────────────────────────────────────────────────

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme, bir <ThemeProvider> içinde kullanılmalıdır.');
  }
  return context;
}
