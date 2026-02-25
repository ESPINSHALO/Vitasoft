import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, ArrowRight, ListTodo, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post<{ token: string }>('/api/auth/login', { email, password });
      login({ token: res.data.token, user: { id: null, email } });
      toast.success('Welcome back');
      navigate('/tasks');
    } catch (err) {
      setError('Invalid credentials');
      console.error(err);
      toast.error('Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: ListTodo, text: 'Manage tasks with priorities and due dates' },
    { icon: Zap, text: 'Real-time sync across all your devices' },
    { icon: Shield, text: 'Your data is secure and private' },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      {/* Left: branding + features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-sky-600 via-indigo-600 to-slate-900 p-10 xl:p-16">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
              <ListTodo className="h-7 w-7" />
            </div>
            <span className="text-xl font-bold text-white">Vitasoft</span>
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight text-white">
              Welcome back. Sign in to continue to your tasks.
            </h1>
            <p className="mt-4 text-lg text-sky-100/90">
              Pick up where you left off with your task list and priorities.
            </p>
          </div>
          <ul className="space-y-4">
            {features.map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-white/95">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-base font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/70">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-semibold text-white underline underline-offset-2 hover:no-underline"
          >
            Create one
          </button>
        </p>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10 lg:px-12 lg:py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
              <LogIn className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sign in to your account</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 sm:p-8 shadow-xl dark:shadow-2xl"
          >
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Use your email and password to continue.</p>
            </div>

            <motion.form onSubmit={handleSubmit} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-600 hover:to-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400 lg:hidden">
                New here?{' '}
                <button type="button" onClick={() => navigate('/register')} className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                  Create an account
                </button>
              </p>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
