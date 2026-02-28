import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lock, Key, X, LogOut } from 'lucide-react';
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

interface ProfileMenuProps {
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export function ProfileMenu({ onClose, anchorRef }: ProfileMenuProps) {
  const user = useAuthStore((s) => s.user);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      )
        return;
      onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorRef]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl"
    >
      <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {user?.username ?? user?.email ?? 'User'}
        </p>
        {user?.email && user.username && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {user.email}
          </p>
        )}
      </div>
      <div className="p-2 space-y-0.5">
        <UpdatePasswordButton onSuccess={onClose} />
        <button
          type="button"
          onClick={() => {
            useAuthStore.getState().logout();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </motion.div>
  );
}

function UpdatePasswordButton({ onSuccess }: { onSuccess: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');

  const mutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      await api.put('/api/auth/change-password', payload);
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
      setShowForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNew('');
      onSuccess();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg === 'Current password is incorrect' ? 'Current password is incorrect' : (msg ?? 'Failed to update password'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword.trim()) {
      toast.error('New password must not be empty');
      return;
    }
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }
    if (newPassword !== confirmNew) {
      toast.error('New passwords do not match');
      return;
    }
    if (currentPassword.trim() === newPassword) {
      toast.error('New password must differ from current password');
      return;
    }
    mutation.mutate({ currentPassword: currentPassword.trim(), newPassword });
  };

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <Key className="h-4 w-4 text-slate-500" />
        Update password
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Update password
        </span>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Current password
        </label>
        <div className="relative">
          <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-2.5 py-1.5 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          New password (at least 8 chars, 1 uppercase, 1 number, 1 special)
        </label>
        <div className="relative">
          <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-2.5 py-1.5 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Confirm new password
        </label>
        <div className="relative">
          <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            value={confirmNew}
            onChange={(e) => setConfirmNew(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-2.5 py-1.5 text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-lg bg-sky-500 py-1.5 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-70"
      >
        {mutation.isPending ? 'Updating...' : 'Update password'}
      </button>
    </form>
  );
}
