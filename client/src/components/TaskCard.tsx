import { motion } from 'framer-motion';
import type { Task } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onToggleDone, onDelete }: TaskCardProps) {
  const formattedDate = format(new Date(task.createdAt), "d MMMM 'в' HH:mm", { locale: ru });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      style={{ 
        rotate: 0,
        scale: 1,
      }}
      className={`relative rounded-2xl bg-white shadow-lg group cursor-pointer w-full h-56 flex flex-col justify-between p-5 transition-all duration-200 hover:shadow-2xl border border-[#ececec]`}
      onClick={() => onToggleDone(task.id)}
    >
      {/* Акцентный круг статуса */}
      <div className={`absolute top-5 right-5 w-6 h-6 rounded-full ${task.isDone ? 'bg-green-400' : 'bg-[#ff4c00]'} flex items-center justify-center`}>
        {task.isDone ? (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : null}
      </div>
      {/* Кнопка удаления */}
      <button
        className="absolute top-5 left-5 z-20 w-7 h-7 bg-[#ececec] rounded-full flex items-center justify-center hover:bg-[#ff4c00] hover:text-white text-[#b0b0b0] font-bold text-lg transition border border-[#ececec]"
        onClick={e => { e.stopPropagation(); onDelete(task.id); }}
        aria-label="Удалить задачу"
      >
        ×
      </button>
      {/* Дата */}
      <div className="text-3xl font-extrabold text-[#222] mb-2">
        {new Date(task.createdAt).getDate()}
        <span className="text-base font-medium ml-1">{new Date(task.createdAt).toLocaleString('ru', { month: 'short' })}</span>
      </div>
      {/* Текст задачи */}
      <div className={`text-lg font-semibold text-[#222] mb-1 truncate ${task.isDone ? 'line-through text-[#b0b0b0]' : ''}`}>{task.text}</div>
      {/* Время */}
      <div className="text-xs text-[#b0b0b0] font-mono">{new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    </motion.div>
  );
} 