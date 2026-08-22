import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'authToken';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- Request Interceptor ----------
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // AsyncStorage'dan token oku ve Authorization header'ına ekle
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ---------- Response Interceptor ----------
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Sunucudan hata yanıtı geldi (4xx, 5xx)
      console.error(
        `[API Error] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.data,
      );

      if (error.response.status === 401) {
        // TODO: Oturum süresi dolmuş → AuthContext üzerinden logout tetiklenecek
        console.warn('[API] 401 Unauthorized — oturum geçersiz veya süresi dolmuş.');
      }
    } else if (error.request) {
      // İstek gönderildi fakat yanıt alınamadı (network hatası, timeout)
      console.error('[API Error] Sunucuya ulaşılamadı — ağ bağlantısını kontrol edin.', error.message);
    } else {
      // İstek oluşturulurken beklenmedik bir hata oluştu
      console.error('[API Error] İstek oluşturulurken hata:', error.message);
    }

    // TODO: Kullanıcıya hata mesajı göstermek için (Toast / Snackbar vb.)
    //       context veya global state hazır olduğunda burada tetiklenecek.
    return Promise.reject(error);
  },
);

export default api;
