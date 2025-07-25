import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import './index.css'; // Убедимся, что наши Tailwind стили подключены
import { VoiceButton } from './components/VoiceButton'; // Импортируем нашу кнопку
import { TaskCard } from './components/TaskCard'; // Импортируем карточку задачи
import { TaskCardSkeleton } from './components/TaskCardSkeleton'; // Импортируем скелетную карточку
import { AnimatePresence } from 'framer-motion'; // Импортируем AnimatePresence для анимации
import type { Task } from './types'; // <-- Импортируем из правильного места!
import { addDays, addMinutes, addHours } from 'date-fns';
import { Calendar } from './components/Calendar';
import { WeatherWidget } from './components/WeatherWidget';

// URL нашего сервера
// const API_URL = '/api';

const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

function parseDateFromText(text: string): { cleanText: string, date: Date } {
  let cleanText = text;
  let date = new Date();
  const lower = text.toLowerCase();

  // через X минут/часов
  const inMinutes = lower.match(/через (\d{1,2}) ?мин(ут[аы]?|\.)?/);
  if (inMinutes) {
    date = addMinutes(new Date(), parseInt(inMinutes[1], 10));
    cleanText = cleanText.replace(inMinutes[0], '').trim();
    return { cleanText, date };
  }
  const inHours = lower.match(/через (\d{1,2}) ?час(а|ов)?/);
  if (inHours) {
    date = addHours(new Date(), parseInt(inHours[1], 10));
    cleanText = cleanText.replace(inHours[0], '').trim();
    return { cleanText, date };
  }

  // сегодня/завтра в HH:MM
  const todayAt = lower.match(/сегодня в (\d{1,2}):(\d{2})/);
  if (todayAt) {
    date.setHours(parseInt(todayAt[1], 10), parseInt(todayAt[2], 10), 0, 0);
    cleanText = cleanText.replace(todayAt[0], '').trim();
    return { cleanText, date };
  }
  const tomorrowAt = lower.match(/завтра в (\d{1,2}):(\d{2})/);
  if (tomorrowAt) {
    date = addDays(new Date(), 1);
    date.setHours(parseInt(tomorrowAt[1], 10), parseInt(tomorrowAt[2], 10), 0, 0);
    cleanText = cleanText.replace(tomorrowAt[0], '').trim();
    return { cleanText, date };
  }

  // 14 июня в 18:00, 20-го в 12:00
  const fullDateTime = lower.match(/(\d{1,2}) (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?: в (\d{1,2}):(\d{2}))?/);
  if (fullDateTime) {
    const day = parseInt(fullDateTime[1], 10);
    const month = MONTHS_RU.indexOf(fullDateTime[2]);
    let year = new Date().getFullYear();
    if (month < new Date().getMonth() || (month === new Date().getMonth() && day < new Date().getDate())) {
      year++;
    }
    date = new Date(year, month, day);
    if (fullDateTime[3] && fullDateTime[4]) {
      date.setHours(parseInt(fullDateTime[3], 10), parseInt(fullDateTime[4], 10), 0, 0);
    }
    cleanText = cleanText.replace(fullDateTime[0], '').trim();
    return { cleanText, date };
  }

  // 20-го в 12:00
  const dayTime = lower.match(/(\d{1,2})[-\s]?(го|е|я)? в (\d{1,2}):(\d{2})/);
  if (dayTime) {
    const day = parseInt(dayTime[1], 10);
    const now = new Date();
    let month = now.getMonth();
    let year = now.getFullYear();
    if (day < now.getDate()) {
      month++;
      if (month > 11) { month = 0; year++; }
    }
    date = new Date(year, month, day);
    date.setHours(parseInt(dayTime[3], 10), parseInt(dayTime[4], 10), 0, 0);
    cleanText = cleanText.replace(dayTime[0], '').trim();
    return { cleanText, date };
  }

  // просто "в 18:00" (сегодня или завтра)
  const onlyTime = lower.match(/в (\d{1,2}):(\d{2})/);
  if (onlyTime) {
    const h = parseInt(onlyTime[1], 10);
    const m = parseInt(onlyTime[2], 10);
    const now = new Date();
    date.setHours(h, m, 0, 0);
    if (date < now) {
      date = addDays(date, 1); // если время уже прошло — завтра
    }
    cleanText = cleanText.replace(onlyTime[0], '').trim();
    return { cleanText, date };
  }

  // послезавтра, завтра, сегодня
  if (lower.includes('послезавтра')) {
    cleanText = cleanText.replace(/послезавтра/gi, '').trim();
    date = addDays(new Date(), 2);
    return { cleanText, date };
  }
  if (lower.includes('завтра')) {
    cleanText = cleanText.replace(/завтра/gi, '').trim();
    date = addDays(new Date(), 1);
    return { cleanText, date };
  }
  if (lower.includes('сегодня')) {
    cleanText = cleanText.replace(/сегодня/gi, '').trim();
    date = new Date();
    return { cleanText, date };
  }

  // 20-го, 5-го и т.д.
  const dayMatch = lower.match(/(\d{1,2})[-\s]?(го|е|я)?/);
  if (dayMatch && !lower.match(/\d{1,2} (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/)) {
    const day = parseInt(dayMatch[1], 10);
    const now = new Date();
    let month = now.getMonth();
    let year = now.getFullYear();
    if (day < now.getDate()) {
      month++;
      if (month > 11) { month = 0; year++; }
    }
    date = new Date(year, month, day);
    cleanText = cleanText.replace(dayMatch[0], '').trim();
    return { cleanText, date };
  }

  // 15 июня, 5 мая и т.д.
  const fullDateMatch = lower.match(/(\d{1,2}) (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/);
  if (fullDateMatch) {
    const day = parseInt(fullDateMatch[1], 10);
    const month = MONTHS_RU.indexOf(fullDateMatch[2]);
    let year = new Date().getFullYear();
    if (month < new Date().getMonth() || (month === new Date().getMonth() && day < new Date().getDate())) {
      year++;
    }
    date = new Date(year, month, day);
    cleanText = cleanText.replace(fullDateMatch[0], '').trim();
    return { cleanText, date };
  }

  return { cleanText, date };
}

function App() {
  // Состояние для хранения списка задач
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('visionboard-tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  });
  // Состояние для индикации загрузки (когда генерируется картинка)
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Сохраняем задачи в localStorage при каждом изменении
  useEffect(() => {
    try {
      localStorage.setItem('visionboard-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  // Запрос разрешения на уведомления при загрузке
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Напоминание о задачах на сегодня
  useEffect(() => {
    const today = new Date();
    const todayTasks = tasks.filter(task => isToday(new Date(task.createdAt)));
    if (todayTasks.length > 0) {
      // Push-уведомление
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Задачи на сегодня', {
          body: todayTasks.map(t => t.text).join('\n'),
        });
      }
      // Звук
      const audio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4c3e.mp3');
      audio.play().catch(() => {});
    }
  }, []);

  // Виджет времени (Бишкек)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Для адаптива: определяем мобильное устройство
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Функция, которая создает задачу
  const handleNewTaskFromVoice = async (text: string) => {
    const { cleanText: taskText, date: taskDate } = parseDateFromText(text);

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      console.log(`Отправляю на сервер промпт: "${taskText}"`);
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: taskText }),
      });

      if (!response.ok) {
        throw new Error('Сервер вернул ошибку при генерации изображения');
      }

      const { imageUrl } = await response.json();
      console.log(`Получен URL картинки: ${imageUrl}`);

      const newTask: Task = {
        id: Date.now(),
        text: taskText,
        imageUrl: imageUrl,
        isDone: false,
        rotation: Math.random() * 10 - 5,
        scale: Math.random() * 0.1 + 0.95,
        createdAt: taskDate.toISOString(),
        completedAt: null,
      };

      setTasks(prevTasks => [newTask, ...prevTasks]);

      // Показываем уведомление
      if (Notification.permission === 'granted') {
        new Notification('Новая задача в VisionBoard!', {
          body: taskText,
          icon: imageUrl,
        });
      }

    } catch (error) {
      console.error("Произошла ошибка:", error);
      setErrorMessage("Не удалось создать заметку. Попробуйте ещё раз.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Функция для отметки задачи как выполненной
  const handleToggleDone = (id: number) => {
    setTasks(currentTasks => 
      currentTasks.map(task => {
        if (task.id === id) {
          return { 
            ...task, 
            isDone: !task.isDone,
            completedAt: !task.isDone ? new Date().toISOString() : null
          };
        }
        return task;
      })
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== id));
  };

  // Фильтруем задачи для отображения
  const visibleTasks = tasks.filter(task => {
    if (selectedDate) {
      // Фильтрация по выбранной дате (только день, месяц, год)
      const tDate = new Date(task.createdAt);
      return tDate.getDate() === selectedDate.getDate() &&
        tDate.getMonth() === selectedDate.getMonth() &&
        tDate.getFullYear() === selectedDate.getFullYear();
    }
    if (!task.isDone) return true;
    if (task.completedAt && isToday(new Date(task.completedAt))) return true;
    return false;
  });

  // Обработка добавления задачи через текстовое поле
  const handleAddTask = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    await handleNewTaskFromVoice(text);
  };

  return (
    <div 
      className="min-h-screen text-slate-200 font-sans bg-cover bg-center" 
      style={{ backgroundImage: "url(/cork-board.jpg)" }}
    >
      {/* Loader поверх всего */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
          {/* Анимация кирпичиков */}
          <div className="flex space-x-2 mb-6">
            <div className="w-4 h-8 bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-12 bg-blue-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-6 bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-10 bg-blue-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-4 h-8 bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-white text-xl font-semibold text-center">Генерация заметки...<br/>Пожалуйста, подождите</p>
          {errorMessage && (
            <p className="text-red-400 mt-4 text-center">{errorMessage}</p>
          )}
        </div>
      )}
      <header className={isMobile ? "absolute top-20 left-4 z-50" : "absolute top-6 left-8 z-50"}>
        {isMobile ? (
          <span className="text-base font-bold tracking-tight text-[#b0b0b0] select-none lowercase leading-tight block" style={{letterSpacing: '0.04em', fontFamily: 'Inter, Arial, sans-serif', lineHeight: '1.1'}}>
            vision<br/>board
          </span>
        ) : (
          <span className="text-base font-bold tracking-tight text-[#b0b0b0] select-none lowercase" style={{letterSpacing: '0.04em', fontFamily: 'Inter, Arial, sans-serif'}}>visionboard</span>
        )}
      </header>
      
      {/* Основная часть */}
      <main className="relative min-h-screen flex flex-col justify-center items-center overflow-x-hidden bg-[#f5f6fa] pb-32">
        {/* Маленький виджет погоды и времени справа сверху */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <WeatherWidget />
          <div className="bg-white rounded-lg px-4 py-2 shadow text-slate-800 font-mono text-base font-semibold flex items-center min-w-[90px] justify-center" style={{fontSize: '1.25rem', height: '40px'}}>
            <span>{now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span className="ml-2 text-xs text-[#b0b0b0]">Бишкек</span>
          </div>
        </div>
        <div className="max-w-7xl w-full px-2 sm:px-8 mx-auto flex flex-col sm:flex-row gap-8 mt-20">
          {/* Календарь как отдельная карточка */}
          <div className="flex-shrink-0 w-full sm:w-[340px]">
            <Calendar tasks={tasks} onDayClick={date => setSelectedDate(date)} />
            {selectedDate && (
              <button
                className="mt-2 px-4 py-2 rounded-lg bg-[#ff4c00] text-white font-bold w-full"
                onClick={() => setSelectedDate(null)}
              >
                Показать все задачи
              </button>
            )}
          </div>
          {/* Задачи — карточки, скроллируемый блок */}
          <div className="flex-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTasks.map((task) => (
                <TaskCard key={task.id} task={task} onToggleDone={handleToggleDone} onDelete={handleDeleteTask} />
              ))}
              {isProcessing && <TaskCardSkeleton />}
              {visibleTasks.length === 0 && !isProcessing && (
                <div className="text-center text-[#222] col-span-full py-10 text-lg">Нет задач на выбранный день</div>
              )}
            </div>
          </div>
        </div>
        {/* Микрофон — всегда по центру внизу, над формой */}
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 flex justify-center w-full pointer-events-none">
          <div className="pointer-events-auto">
            <VoiceButton onResult={handleNewTaskFromVoice} isProcessing={isProcessing} />
          </div>
        </div>
        {/* Форма ввода задачи — всегда в самом низу */}
        <div className="fixed bottom-0 left-0 w-full px-2 z-50 bg-[#f5f6fa] pb-2 pt-2 flex justify-center">
          <form onSubmit={handleAddTask} className="flex gap-2 bg-white rounded-2xl shadow-lg border border-[#ececec] px-4 py-3 w-full max-w-xl">
            <input
              type="text"
              className="flex-1 rounded-xl px-4 py-2 border border-[#ececec] focus:outline-none focus:ring-2 focus:ring-[#b0b0b0] text-black bg-[#f8f8fa] placeholder:text-[#b0b0b0] text-base font-medium"
              placeholder="Введите задачу или желание..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isProcessing}
            />
            <button
              type="submit"
              className="bg-[#222] hover:bg-[#ff4c00] text-white px-5 py-2 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-50"
              disabled={isProcessing || !inputValue.trim()}
            >
              Добавить
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
