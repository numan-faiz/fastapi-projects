import { create } from 'zustand';
import type { AuthTokens, ViewType } from '@/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  name: string | null;
  username: string | null;
  isStaff: boolean;
  view: ViewType;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
  setView: (view: ViewType) => void;
  setName: (name: string) => void;
  setUsername: (username: string) => void;
  setIsStaff: (isStaff: boolean) => void;
  getAccessToken: () => string | null;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  name: null,
  username: null,
  isStaff: false,
  view: 'auth',

  setTokens: (tokens: AuthTokens) => {
    set({ accessToken: tokens.access, refreshToken: tokens.refresh });
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
    }
  },

  clearTokens: () => {
    set({ accessToken: null, refreshToken: null, name: null, username: null, isStaff: false, view: 'auth' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('name');
      localStorage.removeItem('username');
      localStorage.removeItem('is_staff');
    }
  },

  setView: (view: ViewType) => set({ view }),

  setName: (name: string) => {
    set({ name });
    if (typeof window !== 'undefined') {
      localStorage.setItem('name', name);
    }
  },

  setUsername: (username: string) => {
    set({ username });
    if (typeof window !== 'undefined') {
      localStorage.setItem('username', username);
    }
  },

  setIsStaff: (isStaff: boolean) => {
    set({ isStaff });
    if (typeof window !== 'undefined') {
      localStorage.setItem('is_staff', String(isStaff));
    }
  },

  getAccessToken: () => get().accessToken,

  isAuthenticated: () => !!get().accessToken,
}));

export function hydrateAuth() {
  if (typeof window === 'undefined') return;
  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  const name = localStorage.getItem('name');
  const username = localStorage.getItem('username');
  const isStaff = localStorage.getItem('is_staff') === 'true';
  if (access) {
    useAuthStore.getState().setTokens({ access, refresh: refresh || '' });
    if (name) useAuthStore.getState().setName(name);
    if (username) useAuthStore.getState().setUsername(username);
    useAuthStore.getState().setIsStaff(isStaff);
    useAuthStore.getState().setView(isStaff ? 'admin' : 'dashboard');
  }
}