import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const RequireAuth = ({ children }: { children: ReactElement }) => {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export const RedirectIfAuth = ({ children }: { children: ReactElement }) => {
  const token = useAuthStore((s) => s.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

