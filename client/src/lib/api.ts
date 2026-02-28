import axios, { AxiosHeaders } from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    const headers = new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

let isHandlingUnauthorized = false;

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // change-password 401 = wrong current password: do not logout, let component handle it
      const config = error.config;
      const isChangePassword = config?.url?.includes('change-password');
      const msg = (error.response?.data as { message?: string })?.message;
      if (isChangePassword && msg === 'Current password is incorrect') {
        return Promise.reject(error);
      }

      // Token missing/invalid/expired: clear auth and redirect to login
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        useAuthStore.getState().logout();

        const path = window.location.pathname;
        const isAuthPage = path.startsWith('/login') || path.startsWith('/register');
        if (!isAuthPage) {
          window.location.href = '/login';
        }

        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 500);
      }
    }

    return Promise.reject(error);
  },
);

