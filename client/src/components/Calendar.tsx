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
    <div className="bg-[#fff] rounded-2xl border-4 border-[#ff4c00] p-6 w-80 max-w-full mx-auto mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-5xl font-extrabold text-[#ff4c00] uppercase tracking-tight leading-none" style={{fontFamily: 'Arial Black, Arial, sans-serif'}}>
          {format(today, 'LLLL', { locale: ru })}
        </span>
        <span className="text-2xl font-bold text-[#222] ml-2 mt-4">{format(today, 'yyyy')}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-base font-bold text-[#222] mb-1">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === today.getMonth();
          const isTaskDay = taskDates.includes(format(day, 'yyyy-MM-dd'));
          return (
            <button
              key={idx}
              className={`aspect-square rounded-none flex items-center justify-center font-extrabold text-lg border-2 border-[#ff4c00] transition-all duration-150
                ${isToday(day) ? 'bg-[#ff4c00] text-white scale-105' : ''}
                ${isTaskDay ? 'bg-[#ffe5d0] text-[#ff4c00] border-4' : ''}
                ${!isCurrentMonth ? 'opacity-30' : 'hover:bg-[#fff0e6]'}
                hover:scale-110 focus:outline-none
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