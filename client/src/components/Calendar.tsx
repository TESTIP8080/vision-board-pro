import { useMemo } from 'react';
import { isToday, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
  onDayClick?: (date: Date) => void;
}

export function Calendar({ tasks, onDayClick }: CalendarProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Собираем все даты месяца
  const days = useMemo(() => {
    const daysArr = [];
    let day = startDate;
    while (day <= endDate) {
      daysArr.push(day);
      day = addDays(day, 1);
    }
    return daysArr;
  }, [monthStart, monthEnd]);

  // Массив дат с задачами
  const taskDates = useMemo(() => tasks.map(t => format(new Date(t.createdAt), 'yyyy-MM-dd')), [tasks]);

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-80 max-w-full mx-auto mb-6 border border-white/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg text-slate-700 drop-shadow">{format(today, 'LLLL yyyy', { locale: ru })}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-1">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === today.getMonth();
          const isTaskDay = taskDates.includes(format(day, 'yyyy-MM-dd'));
          return (
            <button
              key={idx}
              className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 font-semibold
                ${isToday(day) ? 'bg-blue-500 text-white shadow-lg scale-110' : ''}
                ${isTaskDay ? 'ring-2 ring-fuchsia-400' : ''}
                ${!isCurrentMonth ? 'opacity-30' : 'hover:bg-blue-100'}
                hover:scale-110 hover:bg-blue-100/60 focus:outline-none focus:ring-2 focus:ring-cyan-400
              `}
              onClick={() => onDayClick?.(day)}
              disabled={!isCurrentMonth}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
} 