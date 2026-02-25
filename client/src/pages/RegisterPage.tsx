import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  UserPlus,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  ListTodo,
  Zap,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/api/auth/register', { email, password });
      toast.success('Account created. Sign in to continue.');
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Try a different email.');
      toast.error('Registration failed');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: ListTodo, text: 'Tasks with priorities and descriptions' },
    { icon: Zap, text: 'Real-time updates and optimistic UI' },
    { icon: Shield, text: 'Secure auth with JWT and bcrypt' },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      {/* Left: branding + features — full height, visible on desktop */}
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
              Create your account and start managing tasks in one place.
            </h1>
            <p className="mt-4 text-lg text-sky-100/90">
              Join and get access to priorities, real-time sync, and a clean dashboard.
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
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-semibold text-white underline underline-offset-2 hover:no-underline"
          >
            Sign in
          </button>
        </p>
      </div>

      {/* Right: form — full height, scrollable on small screens */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10 lg:px-12 lg:py-16">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create account</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Start managing tasks in seconds</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 sm:p-8 shadow-xl dark:shadow-2xl"
          >
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Enter your details to get started.</p>
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
                  Password (min 6 characters)
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isSubmitting ? 'Creating account...' : 'Create account'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400 lg:hidden">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
