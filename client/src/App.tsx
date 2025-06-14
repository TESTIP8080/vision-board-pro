import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import './index.css'; // Убедимся, что наши Tailwind стили подключены
import { VoiceButton } from './components/VoiceButton'; // Импортируем нашу кнопку
import { TaskCard } from './components/TaskCard'; // Импортируем карточку задачи
import { TaskCardSkeleton } from './components/TaskCardSkeleton'; // Импортируем скелетную карточку
import { AnimatePresence } from 'framer-motion'; // Импортируем AnimatePresence для анимации
import type { Task } from './types'; // <-- Импортируем из правильного места!
import { addDays, isToday } from 'date-fns';
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

  // Виджет времени
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
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
      <header className="absolute top-4 left-6 z-50">
        <span className="text-xl font-extrabold tracking-tight text-white/80 drop-shadow-lg select-none" style={{letterSpacing: '0.04em'}}>VisionBoard</span>
      </header>
      
      {/* Основная часть, где будут задачи */}
      <main className="relative min-h-screen flex flex-col justify-center items-center overflow-x-hidden">
        {/* Animated gradient background */}
        <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-tr from-blue-400 via-fuchsia-300 to-cyan-400 opacity-90" style={{backgroundSize:'200% 200%'}} />
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-2xl" />
        <div className="max-w-7xl w-full px-2 sm:px-8 mx-auto">
          {/* Календарь: сверху на мобильных, сбоку на десктопе */}
          <div className="block sm:hidden mb-4">
            <Calendar tasks={tasks} />
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="hidden sm:block mr-8 min-w-[340px]">
              <Calendar tasks={tasks} />
            </div>
            <div className="flex-1">
              {/* Форма для текстового ввода задачи */}
              <form onSubmit={handleAddTask} className="flex gap-2 mb-4 max-w-xl mx-auto bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 px-4 py-3 transition-all duration-300">
                <input
                  type="text"
                  className="flex-1 rounded-lg px-4 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black bg-white/70 backdrop-blur placeholder:text-slate-400"
                  placeholder="Введите задачу или желание..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  className="bg-gradient-to-tr from-blue-500 to-fuchsia-400 hover:from-fuchsia-400 hover:to-cyan-400 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
                  disabled={isProcessing || !inputValue.trim()}
                >
                  Добавить
                </button>
              </form>
              {/* Адаптивная сетка карточек */}
              <div>
                {/* Мобильная версия: горизонтальный скролл */}
                <div className="block sm:hidden overflow-x-auto pb-4 -mx-4 px-4">
                  <div className="flex space-x-4 min-w-[320px]">
                    <AnimatePresence>
                      {isProcessing && <TaskCardSkeleton />}
                      {visibleTasks.slice(0, 3).map((task) => (
                        <TaskCard key={task.id} task={task} onToggleDone={handleToggleDone} onDelete={handleDeleteTask} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
                {/* Мобильная версия: остальные карточки — ниже */}
                <div className="block sm:hidden mt-2">
                  <div className="flex flex-wrap gap-4">
                    <AnimatePresence>
                      {visibleTasks.slice(3).map((task) => (
                        <TaskCard key={task.id} task={task} onToggleDone={handleToggleDone} onDelete={handleDeleteTask} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
                {/* Десктопная версия: обычная сетка */}
                <div className="hidden sm:flex flex-wrap justify-center items-start gap-8 p-4">
                  <AnimatePresence>
                    {isProcessing && <TaskCardSkeleton />}
                    {visibleTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onToggleDone={handleToggleDone} onDelete={handleDeleteTask} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {tasks.length === 0 && !isProcessing && (
                <div className="text-center py-20 col-span-full">
                  <h2 className="text-2xl text-white drop-shadow-lg">Нажмите на микрофон, чтобы добавить первую задачу!</h2>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Виджет погоды */}
        <div className="fixed top-4 right-4 z-50">
          <WeatherWidget />
        </div>
      </main>

      {/* Рендерим нашу кнопку и передаем ей нужные пропсы */}
      <VoiceButton onResult={handleNewTaskFromVoice} isProcessing={isProcessing} />

    </div>
  );
}

export default App;
