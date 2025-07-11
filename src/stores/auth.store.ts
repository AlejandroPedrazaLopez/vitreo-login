// src/stores/auth.store.ts (Alternative Login Frontend)
import { create } from "zustand";
import Cookies from 'js-cookie';
import { TwoFactorService } from "@/src/services/auth/2fa.service";


interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  has2faVerified: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, persist: boolean, redirectUrl?: string) => Promise<{
    user: any;
    token?: string;
    is2faEnabled: boolean;
    source?: string;
    redirectUrl?: string;
  }>;
  logout: () => void;
  clearError: () => void;
  set2faVerified: (value: boolean) => void;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
}

// Cookie configuration - shorter expiration for alternative login
const COOKIE_OPTIONS = {
  expires: 1, // 1 day (shorter for alternative login)
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

// Cookie keys
const COOKIE_KEYS = {
  USER: 'auth.user',
  TOKEN: 'auth.token',
  IS_AUTHENTICATED: 'auth.isAuthenticated',
  HAS_2FA_VERIFIED: 'auth.has2faVerified'
};

// Initialize state from cookies
const getInitialState = () => ({
  user: Cookies.get(COOKIE_KEYS.USER) ? JSON.parse(Cookies.get(COOKIE_KEYS.USER)!) : null,
  token: Cookies.get(COOKIE_KEYS.TOKEN) || null,
  isAuthenticated: Cookies.get(COOKIE_KEYS.IS_AUTHENTICATED) === 'true',
  has2faVerified: Cookies.get(COOKIE_KEYS.HAS_2FA_VERIFIED) === 'true',
  isLoading: false,
  error: null,
});

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...getInitialState(),

  login: async (email: string, password: string, persist: boolean = true, redirectUrl?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Use the alternative login service for cross-domain
      const response = await TwoFactorService.alternativeLogin(email, password, redirectUrl);
      const { user, token, is2faEnabled, source, redirectUrl: responseRedirectUrl } = response;

      // Set minimal cookies for alternative login (since we're redirecting)
      if (persist) {
        Cookies.set(COOKIE_KEYS.USER, JSON.stringify(user), COOKIE_OPTIONS);
        Cookies.set(COOKIE_KEYS.IS_AUTHENTICATED, 'true', COOKIE_OPTIONS);
        
        // Only set token if not 2FA enabled (for immediate redirect)
        if (!is2faEnabled && token) {
          Cookies.set(COOKIE_KEYS.TOKEN, token, COOKIE_OPTIONS);
          Cookies.set(COOKIE_KEYS.HAS_2FA_VERIFIED, 'true', COOKIE_OPTIONS);
        } else {
          // Reset 2FA verification status for new login
          Cookies.set(COOKIE_KEYS.HAS_2FA_VERIFIED, 'false', COOKIE_OPTIONS);
        }
      }

      set({
        user,
        token: token || null,
        isAuthenticated: true,
        has2faVerified: !is2faEnabled, // If 2FA disabled, mark as verified
        isLoading: false,
        error: null,
      });

      return { user, token, is2faEnabled, source, redirectUrl: responseRedirectUrl };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Credenciales inválidas";
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        has2faVerified: false,
      });
      throw error;
    }
  },

  logout: () => {
    // Remove cookies
    Cookies.remove(COOKIE_KEYS.USER, { path: '/' });
    Cookies.remove(COOKIE_KEYS.TOKEN, { path: '/' });
    Cookies.remove(COOKIE_KEYS.IS_AUTHENTICATED, { path: '/' });
    Cookies.remove(COOKIE_KEYS.HAS_2FA_VERIFIED, { path: '/' });

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      has2faVerified: false,
      error: null,
    });
  },

  set2faVerified: (value: boolean) => {
    Cookies.set(COOKIE_KEYS.HAS_2FA_VERIFIED, value.toString(), COOKIE_OPTIONS);
    set({ has2faVerified: value });
  },

  setUser: (user: any) => {
    Cookies.set(COOKIE_KEYS.USER, JSON.stringify(user), COOKIE_OPTIONS);
    set({ user, isAuthenticated: true });
  },

  setToken: (token: string) => {
    Cookies.set(COOKIE_KEYS.TOKEN, token, COOKIE_OPTIONS);
    set({ token });
  },

  clearError: () => {
    set({ error: null });
  },
}));