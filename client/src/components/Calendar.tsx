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
    <div className="bg-white rounded-xl shadow-lg p-4 w-80 max-w-full mx-auto mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg text-slate-700">{format(today, 'LLLL yyyy', { locale: ru })}</span>
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
              className={`aspect-square rounded-lg flex items-center justify-center transition
                ${isToday(day) ? 'bg-blue-500 text-white font-bold shadow' : ''}
                ${isTaskDay ? 'ring-2 ring-green-400' : ''}
                ${!isCurrentMonth ? 'opacity-30' : 'hover:bg-blue-100'}
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