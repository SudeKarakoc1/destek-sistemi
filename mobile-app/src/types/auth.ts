export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  /** Uygulama açılışında AsyncStorage'dan token kontrol edilirken true */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}
