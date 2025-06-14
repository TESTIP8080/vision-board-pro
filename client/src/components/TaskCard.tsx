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
      className={`relative rounded-xl overflow-hidden group cursor-pointer w-[280px] h-[280px] sm:w-60 sm:h-60 bg-white border-4 border-[#ff4c00] transition-all duration-200 hover:scale-105`}
      onClick={() => onToggleDone(task.id)}
    >
      {/* Кнопка-гвоздик */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-7 h-7 bg-[#ff4c00] rounded-full border-4 border-white z-10"></div>
      {/* Кнопка удаления */}
      <button
        className="absolute top-2 right-2 z-20 w-8 h-8 bg-[#ff4c00] rounded-full flex items-center justify-center hover:bg-[#ff7f50] text-white font-bold text-xl transition border-2 border-white"
        onClick={e => { e.stopPropagation(); onDelete(task.id); }}
        aria-label="Удалить задачу"
      >
        ×
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