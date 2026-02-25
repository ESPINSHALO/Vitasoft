import { create } from 'zustand';

export interface AuthUser {
  id: number | null;
  email: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (params: { token: string; user?: AuthUser | null }) => void;
  logout: () => void;
}

const TOKEN_KEY = 'vitasoft_token';
const USER_KEY = 'vitasoft_user';

export const useAuthStore = create<AuthState>((set) => {
  let initialToken: string | null = null;
  let initialUser: AuthUser | null = null;

  if (typeof window !== 'undefined') {
    initialToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        initialUser = JSON.parse(storedUser) as AuthUser;
      } catch {
        initialUser = null;
      }
    }
  }

  const persist = (token: string | null, user: AuthUser | null) => {
    if (typeof window === 'undefined') return;

    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  };

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: Boolean(initialToken),
    login: ({ token, user = null }) => {
      persist(token, user);
      set({
        token,
        user,
        isAuthenticated: true,
      });
    },
    logout: () => {
      persist(null, null);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    },
  };
});



