import { motion } from 'framer-motion';
import type { Task } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
}

function getEmoji(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('встреч')) return '🤝';
  if (lower.includes('отчёт') || lower.includes('отчет')) return '📄';
  if (lower.includes('кофе') || lower.includes('чай')) return '☕';
  if (lower.includes('позвонить') || lower.includes('звонок')) return '📞';
  if (lower.includes('доклад') || lower.includes('презентац')) return '🎤';
  if (lower.includes('спорт') || lower.includes('трениров')) return '🏃';
  if (lower.includes('подар')) return '🎁';
  if (lower.includes('покуп')) return '🛒';
  if (lower.includes('день рожден')) return '🎂';
  if (lower.includes('путешеств') || lower.includes('поездк')) return '✈️';
  if (lower.includes('работ')) return '💼';
  if (lower.includes('учеб') || lower.includes('экзамен')) return '📚';
  if (lower.includes('врач') || lower.includes('больниц')) return '🩺';
  if (lower.includes('еда') || lower.includes('ресторан')) return '🍽️';
  if (lower.includes('кино') || lower.includes('фильм')) return '🎬';
  if (lower.includes('музык')) return '🎵';
  return '📌';
}

export function TaskCard({ task, onToggleDone, onDelete }: TaskCardProps) {
  const formattedDate = format(new Date(task.createdAt), "d MMMM", { locale: ru });
  const formattedTime = format(new Date(task.createdAt), "HH:mm", { locale: ru });
  const emoji = getEmoji(task.text);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="relative rounded-2xl bg-white shadow-lg group cursor-pointer w-full min-h-[120px] flex flex-row items-stretch p-0 transition-all duration-200 hover:shadow-2xl border border-[#ececec]"
      onClick={() => onToggleDone(task.id)}
    >
      {/* Левая часть: дата и эмодзи */}
      <div className="flex flex-col items-center justify-center w-20 min-w-[70px] bg-[#f8f8fa] rounded-l-2xl py-4">
        <div className="text-3xl mb-1">{emoji}</div>
        <div className="text-xl font-extrabold text-[#222] leading-none">{format(new Date(task.createdAt), 'd')}</div>
        <div className="text-xs text-[#b0b0b0] -mt-1">{format(new Date(task.createdAt), 'MMM', { locale: ru })}</div>
      </div>
      {/* Правая часть: текст и время */}
      <div className="flex-1 flex flex-col justify-between px-4 py-3">
        <button
          className="absolute top-2 right-2 z-20 w-7 h-7 bg-[#ececec] rounded-full flex items-center justify-center hover:bg-[#ff4c00] hover:text-white text-[#b0b0b0] font-bold text-lg transition border border-[#ececec]"
          onClick={e => { e.stopPropagation(); onDelete(task.id); }}
          aria-label="Удалить задачу"
        >
          ×
        </button>
        <div className={`text-base font-semibold text-[#222] mb-2 break-words ${task.isDone ? 'line-through text-[#b0b0b0]' : ''}`}>{task.text}</div>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-[#b0b0b0] font-mono">{formattedTime}</span>
          <span className={`w-3 h-3 rounded-full ml-2 ${task.isDone ? 'bg-green-400' : 'bg-[#ff4c00]'}`}></span>
        </div>
      </div>
    </motion.div>
  );
} 