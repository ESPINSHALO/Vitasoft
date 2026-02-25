import { useState } from 'react';
import { createBrowserRouter, Outlet, Link } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TasksPage } from '../pages/TasksPage';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { RedirectIfAuth, RequireAuth } from './guards';

const RootLayout = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col sm:flex-row">
      {/* Sidebar navigation */}
      <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950/80 px-4 py-6 sm:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-lg bg-sky-500" />
          <span className="text-sm font-semibold">Vitasoft Tasks</span>
        </div>
        <nav className="space-y-2 text-sm">
          <Link
            to="/"
            className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Overview
          </Link>
          <Link
            to="/tasks"
            className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Tasks
          </Link>
        </nav>
        <div className="mt-auto space-y-2 px-2 text-xs text-slate-400">
          {token ? (
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg px-3 py-2 text-left text-slate-300 hover:bg-slate-800"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Main content with top header and profile */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm text-slate-200 shadow-sm transition hover:border-sky-500 hover:bg-slate-800 sm:hidden"
            >
              ☰
            </button>
            <h1 className="text-base font-semibold text-slate-50">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs text-slate-300 shadow-sm transition hover:border-sky-500 hover:bg-slate-800 sm:flex"
            >
              {theme === 'dark' ? '☾' : '☼'}
            </button>
            <div className="text-right text-xs">
              <p className="font-medium">{user?.email ?? 'Guest'}</p>
              <p className="text-slate-400">{token ? 'Online' : 'Offline'}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
              {(user?.email ?? 'G').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile nav drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-x-0 top-0 z-40 flex flex-col border-b border-slate-800 bg-slate-950/95 px-4 py-4 shadow-lg sm:hidden">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold">Vitasoft Tasks</span>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="h-8 w-8 rounded-full border border-slate-700 bg-slate-900 text-xs text-slate-300 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
          <nav className="space-y-2 text-sm">
            <Link
              to="/"
              onClick={() => setIsMobileNavOpen(false)}
              className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              Overview
            </Link>
            <Link
              to="/tasks"
              onClick={() => setIsMobileNavOpen(false)}
              className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              Tasks
            </Link>
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs text-slate-300 shadow-sm transition hover:border-sky-500 hover:bg-slate-800"
            >
              {theme === 'dark' ? '☾' : '☼'}
            </button>
            {token ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsMobileNavOpen(false);
                }}
                className="rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-full bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-400"
                >
                  Sign up
                </Link>
              </div>
            )}
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

