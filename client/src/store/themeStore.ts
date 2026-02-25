import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const THEME_KEY = 'vitasoft_theme';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
  const theme: Theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
  document.documentElement.classList.toggle('dark', theme === 'dark');
  return theme;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_KEY, next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      return { theme: next };
    }),
}));

