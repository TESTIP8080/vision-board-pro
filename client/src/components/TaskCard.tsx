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
        rotate: task.rotation,
        scale: task.scale,
      }}
      className={`relative rounded-lg overflow-hidden shadow-2xl group cursor-pointer w-[280px] h-[280px] sm:w-60 sm:h-60`}
      onClick={() => onToggleDone(task.id)}
    >
      {/* Кнопка-гвоздик */}
      <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full shadow-md border-2 border-white z-10"></div>
      {/* Кнопка удаления */}
      <button
        className="absolute top-2 right-2 z-20 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 text-white shadow-lg transition"
        onClick={e => { e.stopPropagation(); onDelete(task.id); }}
        aria-label="Удалить задачу"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img 
        src={task.imageUrl} 
        alt={task.text}
        className="w-full h-full object-cover"
      />
      
      {task.isDone && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
        <p className={`text-white font-bold text-lg drop-shadow-md ${task.isDone ? 'line-through' : ''}`}>
          {task.text}
        </p>
        <p className={`text-xs text-slate-300 ${task.isDone ? 'line-through' : ''}`}>
          {formattedDate}
        </p>
      </div>
    </motion.div>
  );
} 