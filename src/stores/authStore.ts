import create from 'zustand';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  recoverAccount: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token } = response.data;
      
      // Set token in axios headers for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      localStorage.setItem('token', token);
      const user = jwtDecode<User>(token);
      set({ token, user, isAuthenticated: true });
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ token: null, user: null, isAuthenticated: false });
  },

  recoverAccount: async (email: string) => {
    await axios.post('/api/auth/recover', { email });
  },

  verifyCode: async (email: string, code: string) => {
    const response = await axios.post('/api/auth/verify-code', { email, code });
    return response.data.valid;
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    await axios.post('/api/auth/reset-password', { email, code, newPassword });
  },
}));