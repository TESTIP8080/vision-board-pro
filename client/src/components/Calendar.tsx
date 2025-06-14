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
    <div className="bg-white rounded-2xl shadow-lg border border-[#ececec] p-6 w-full max-w-full mb-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-3xl font-extrabold text-[#222] tracking-tight lowercase" style={{fontFamily: 'Inter, Arial, sans-serif'}}>
          {format(today, 'LLLL', { locale: ru })}
        </span>
        <span className="text-lg font-bold text-[#b0b0b0] ml-2 mt-2">{format(today, 'yyyy')}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-base font-bold text-[#b0b0b0] mb-2">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === today.getMonth();
          const isTaskDay = taskDates.includes(format(day, 'yyyy-MM-dd'));
          return (
            <button
              key={idx}
              className={`aspect-square rounded-xl flex items-center justify-center font-extrabold text-lg border transition-all duration-150
                ${isToday(day) ? 'bg-[#ff4c00] text-white border-[#ff4c00] scale-110' : 'bg-[#f8f8fa] text-[#222] border-[#ececec]'}
                ${isTaskDay ? 'ring-2 ring-[#ff4c00]' : ''}
                ${!isCurrentMonth ? 'opacity-30' : 'hover:bg-[#f3f3f3]'}
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