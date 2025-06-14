import { motion } from 'framer-motion';

export function TaskCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg shadow-lg bg-slate-800 animate-pulse aspect-square"
    />
  );
} 