import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
  variant: 'neutral' | 'completed' | 'pending' | 'overdue';
}

const variantStyles = {
  neutral:
    'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  completed:
    'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
  pending:
    'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
  overdue:
    'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
};

const iconStyles = {
  neutral: 'text-slate-500 dark:text-slate-400',
  completed: 'text-emerald-600 dark:text-emerald-400',
  pending: 'text-amber-600 dark:text-amber-400',
  overdue: 'text-red-600 dark:text-red-400',
};

export function SummaryCard({ label, count, icon: Icon, variant }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`
        flex flex-col gap-2 rounded-xl border p-4 shadow-sm
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        ${variantStyles[variant]}
      `}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconStyles[variant]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium opacity-90">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{count}</p>
    </motion.div>
  );
}
