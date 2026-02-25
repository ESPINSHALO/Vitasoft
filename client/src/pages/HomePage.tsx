import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListTodo, Zap, Palette, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
const stagger = { transition: { staggerChildren: 0.08, delayChildren: 0.1 } };

const features = [
  {
    icon: ListTodo,
    title: 'Smart task management',
    description: 'Create, edit, and organize tasks with priorities and descriptions. Mark them done with one tap.',
    color: 'from-sky-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'Real-time updates',
    description: 'Optimistic UI and React Query keep your list in sync instantly across the app.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Palette,
    title: 'Light & dark theme',
    description: 'Switch between themes. Your preference is saved and applied everywhere.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Shield,
    title: 'Secure & simple',
    description: 'JWT auth, bcrypt passwords, and protected routes. No clutter, just what you need.',
    color: 'from-emerald-500 to-teal-600',
  },
];

const bullets = [
  'Priority levels: low, medium, high',
  'Descriptions and timestamps',
  'Empty states and loading skeletons',
  'Toast notifications',
];

export const HomePage = () => (
  <div className="space-y-16 pb-12">
    {/* Hero */}
    <motion.section
      className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-sky-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-8 sm:p-12 shadow-xl"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.08),transparent)]" />
      <div className="relative">
        <motion.h1
          className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          variants={fadeUp}
        >
          Manage tasks,{' '}
          <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
            stay in flow
          </span>
        </motion.h1>
        <motion.p
          className="mt-4 max-w-xl text-slate-600 dark:text-slate-300 text-lg"
          variants={fadeUp}
        >
          Vitasoft is a full-stack task manager with React, Express, Prisma, and SQLite. Sign in to create tasks, set priorities, and track progress with a clean, responsive UI.
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-4" variants={fadeUp}>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-600 hover:to-indigo-600 hover:shadow-sky-500/40"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </motion.section>

    {/* Feature cards */}
    <section>
      <motion.h2
        className="text-xl font-semibold text-slate-900 dark:text-white mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        What you get
      </motion.h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" {...stagger}>
        {features.map((item, i) => (
          <motion.div
            key={item.title}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm transition hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Bullet list + CTA */}
    <motion.section
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Included out of the box</h3>
          <ul className="space-y-2">
            {bullets.map((text) => (
              <li key={text} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-600 shrink-0"
        >
          Go to Tasks
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.section>
  </div>
);
