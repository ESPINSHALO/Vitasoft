import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Key, Eye, EyeOff, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password))
    return 'Password must contain at least 1 special character';
  return null;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export const ProfilePage = () => {
  const { user: storeUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  useEffect(() => {
    api
      .get<UserProfile>('/api/auth/me')
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const displayUser = profile ?? (storeUser ? { username: storeUser.username ?? '', email: storeUser.email ?? '' } : null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!displayUser) {
    return (
      <p className="text-slate-600 dark:text-slate-400">Could not load profile.</p>
    );
  }

  const initials = (displayUser.username || displayUser.email || '?')
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="mx-auto w-full max-w-2xl flex flex-col gap-8 pb-8">
      {/* Profile header with avatar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-slate-700 p-8 shadow-xl dark:shadow-slate-900/50"
      >
        <div className="relative z-10 flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white backdrop-blur-sm ring-2 ring-white/30">
            {initials}
          </div>
          <div className="mt-4 sm:mt-0">
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              {displayUser.username || 'User'}
            </h1>
            <p className="mt-1 text-sm text-sky-100/90">{displayUser.email || '—'}</p>
          </div>
        </div>
      </motion.div>

      {/* Account details card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-sm"
      >
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <User className="h-4 w-4" />
          Account details
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex items-center justify-between py-4 first:pt-0">
            <span className="text-sm text-slate-500 dark:text-slate-400">Username</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {displayUser.username || '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
            <span className="font-medium text-slate-900 dark:text-slate-100 break-all">
              {displayUser.email || '—'}
            </span>
          </div>
        </div>
      </motion.div>

      <UpdatePasswordSection />

      {/* Log out */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.3 }}
      >
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-4 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800/80 transition"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </motion.div>
    </section>
  );
};

function UpdatePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await api.put('/api/auth/change-password', payload);
      return res.data;
    },
    onSuccess: () => {
      setError(null);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNew('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to update password');
      toast.error(msg === 'Current password is incorrect' ? 'Current password is incorrect' : (msg ?? 'Failed to update password'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentPassword.trim()) {
      setError('Current password is required');
      return;
    }
    if (!newPassword.trim()) {
      setError('New password must not be empty');
      return;
    }
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      toast.error(pwdError);
      return;
    }
    if (newPassword !== confirmNew) {
      setError('New passwords do not match');
      toast.error('New passwords do not match');
      return;
    }
    if (currentPassword.trim() === newPassword) {
      setError('New password must differ from current password');
      toast.error('New password must differ from current password');
      return;
    }
    mutation.mutate({ currentPassword: currentPassword.trim(), newPassword });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-sm"
    >
      <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Key className="h-4 w-4" />
        Update password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Current password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setError(null);
              }}
              placeholder="••••••••"
              required
              className={`w-full rounded-xl border pl-10 pr-10 py-3 text-sm transition ${
                error
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            New password (8+ chars, 1 uppercase, 1 number, 1 special char)
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-10 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-10 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:from-sky-600 hover:to-indigo-600 disabled:opacity-70 transition"
        >
          {mutation.isPending ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </motion.div>
  );
}
