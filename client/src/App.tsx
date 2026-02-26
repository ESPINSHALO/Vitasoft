import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/react-query';
import { router } from './routes/appRouter';
import { useThemeStore } from './store/themeStore';

function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors theme={theme} position="top-right" />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
