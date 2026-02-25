import { motion } from 'framer-motion';

export const HomePage = () => (
  <motion.section
    className="space-y-4"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Welcome to Vitasoft</h2>
    <p className="text-slate-600 dark:text-slate-300 max-w-xl">
      A full-stack task management app with React, Express, Prisma, and SQLite. Sign in or create an account to manage your tasks with priorities, descriptions, and real-time updates.
    </p>
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Use the sidebar to go to Tasks, or switch between light and dark theme with the toggle in the header.
    </p>
  </motion.section>
);

