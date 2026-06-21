import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const safeStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* ignore quota errors */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'nxtbiz-auth', storage: createJSONStorage(() => safeStorage) }
  )
);

export const useThemeStore = create(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const dark = !get().dark;
        document.documentElement.classList.toggle('dark', dark);
        set({ dark });
      },
      init: () => {
        document.documentElement.classList.toggle('dark', get().dark);
      },
    }),
    { name: 'nxtbiz-theme', storage: createJSONStorage(() => safeStorage) }
  )
);
