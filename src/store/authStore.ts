import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load initial state from localStorage (client-side only)
  let initialUser = null;
  let initialToken = null;

  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser) initialUser = JSON.parse(storedUser);
      if (storedToken) initialToken = storedToken;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,

    login: (user: User, token: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
      }
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (updatedFields) => {
      set((state) => {
        if (!state.user) return state;
        const newUser = { ...state.user, ...updatedFields };
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(newUser));
        }
        return { user: newUser };
      });
    },
  };
});
