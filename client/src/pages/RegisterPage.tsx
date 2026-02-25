import { useState } from 'react';
import { motion } from 'framer-motion';
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
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Try a different email.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-500 via-indigo-500 to-slate-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl border border-slate-100/10 bg-slate-900/40 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-50">Create an account</h2>
          <p className="mt-2 text-sm text-slate-300">
            Sign up to start managing your tasks.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-200" htmlFor="email">
              Email
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-200" htmlFor="password">
              Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-200" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/50"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-300"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </motion.button>

          <p className="pt-2 text-center text-xs text-slate-300">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-sky-300 hover:text-sky-200"
            >
              Sign in
            </button>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
};

