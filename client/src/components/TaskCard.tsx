import { motion } from 'framer-motion';
import { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(task.id);
    }, 300);
  };

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
      className={`relative rounded-xl overflow-hidden shadow-2xl group cursor-pointer w-[280px] h-[280px] sm:w-60 sm:h-60 bg-white border border-[#ececec] transition-all duration-200 hover:scale-105`}
      onClick={() => onToggleDone(task.id)}
    >
      {/* Гвоздик */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-7 h-7 bg-[#ff4c00] rounded-full border-4 border-white z-10 shadow"></div>
      {/* Кнопка удаления */}
      <button
        className="absolute top-2 right-2 z-20 w-8 h-8 bg-[#ff4c00] rounded-full flex items-center justify-center hover:bg-[#ff7f50] text-white font-bold text-xl transition border-2 border-white"
        onClick={e => { e.stopPropagation(); onDelete(task.id); }}
        aria-label="Удалить задачу"
      >
        ×
      </button>
      {/* Картинка задачи */}
      <img
        src={task.imageUrl}
        alt={task.text}
        className="w-full h-full object-cover absolute inset-0 z-0"
        draggable={false}
      />
      {/* Затемнение для читаемости текста */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
      {/* Текст задачи и дата */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex flex-col justify-end">
        <div className={`text-white font-bold text-lg drop-shadow-md mb-1 ${task.isDone ? 'line-through opacity-60' : ''}`}>{task.text}</div>
        <div className={`text-xs text-slate-200 ${task.isDone ? 'line-through opacity-60' : ''}`}>{formattedDate}</div>
      </div>
      {/* Статус */}
      {task.isDone && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </motion.div>
  );
} 