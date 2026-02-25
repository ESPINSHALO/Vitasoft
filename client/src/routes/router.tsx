import { useState } from 'react';
import { createBrowserRouter, Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TasksPage } from '../pages/TasksPage';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { RedirectIfAuth, RequireAuth } from './guards';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
    isActive
      ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 dark:bg-sky-500/20'
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
  }`;

const RootLayout = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex flex-col sm:flex-row transition-colors">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4 py-6 sm:flex shadow-sm">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30">
            <ListTodo className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight">Vitasoft</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Task Manager</p>
          </div>
        </div>
        <nav className="space-y-1">
          <NavLink to="/" className={navLinkClass} end>
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Overview
            <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
          </NavLink>
          <NavLink to="/tasks" className={navLinkClass}>
            <ListTodo className="h-4 w-4 shrink-0" />
            Tasks
            <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
          </NavLink>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 space-y-1">
          {token ? (
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${location.pathname === '/login' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 transition-all shadow-md shadow-sky-500/25"
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-4 py-3 sm:px-6 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700 sm:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <span className="hidden sm:inline">Dashboard</span>
              <ChevronRight className="h-4 w-4 hidden sm:inline" />
              <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
                {location.pathname === '/' ? 'Overview' : location.pathname.slice(1) || 'Home'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">{user?.email ?? 'Guest'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{token ? 'Signed in' : 'Guest'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-bold text-white shadow-md">
              {(user?.email ?? 'G').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main
          className={
            location.pathname === '/login' || location.pathname === '/register'
              ? 'flex flex-1 flex-col min-h-0'
              : 'mx-auto flex w-full max-w-6xl flex-1 px-4 py-6 sm:px-6'
          }
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile nav */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
                  <ListTodo className="h-4 w-4" />
                </div>
                <span className="font-semibold">Vitasoft</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="space-y-1">
              <NavLink to="/" className={navLinkClass} end onClick={() => setIsMobileNavOpen(false)}>
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                Overview
              </NavLink>
              <NavLink to="/tasks" className={navLinkClass} onClick={() => setIsMobileNavOpen(false)}>
                <ListTodo className="h-4 w-4 shrink-0" />
                Tasks
              </NavLink>
            </nav>
            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button type="button" onClick={toggleTheme} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              {token ? (
                <button type="button" onClick={() => { logout(); setIsMobileNavOpen(false); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setIsMobileNavOpen(false)} className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <LogIn className="h-4 w-4" /> Login
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileNavOpen(false)} className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-500">
                    <UserPlus className="h-4 w-4" /> Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'login',
        element: (
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        ),
      },
      {
        path: 'register',
        element: (
          <RedirectIfAuth>
            <RegisterPage />
          </RedirectIfAuth>
        ),
      },
      {
        path: 'tasks',
        element: (
          <RequireAuth>
            <TasksPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);

