import { useState, useEffect } from 'react';
import './index.css'; // Убедимся, что наши Tailwind стили подключены
import { VoiceButton } from './components/VoiceButton'; // Импортируем нашу кнопку
import { TaskCard } from './components/TaskCard'; // Импортируем карточку задачи
import { TaskCardSkeleton } from './components/TaskCardSkeleton'; // Импортируем скелетную карточку
import { AnimatePresence } from 'framer-motion'; // Импортируем AnimatePresence для анимации
import type { Task } from './types'; // <-- Импортируем из правильного места!
import { addDays, isToday } from 'date-fns';

// URL нашего сервера
// const API_URL = '/api';

// Определяем, как будет выглядеть объект задачи
export interface Task {
  id: number;
  text: string;
  imageUrl: string;
  isDone: boolean;
  rotation: number;
  scale: number;
  createdAt: string;
  completedAt: string | null;
}

function App() {
  // Состояние для хранения списка задач
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('visionboard-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  // Состояние для индикации загрузки (когда генерируется картинка)
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Сохраняем задачи в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('visionboard-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Запрос разрешения на уведомления при загрузке
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Функция, которая создает задачу
  const handleNewTaskFromVoice = async (text: string) => {
    let taskText = text;
    let taskDate = new Date(); // По умолчанию - сегодня

    // Простой парсер даты
    if (text.toLowerCase().includes('завтра')) {
      taskText = text.replace(/завтра/i, '').trim();
      taskDate = addDays(new Date(), 1);
    }
    if (text.toLowerCase().includes('послезавтра')) {
      taskText = text.replace(/послезавтра/i, '').trim();
      taskDate = addDays(new Date(), 2);
    }

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
      <header className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700 sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-center text-white">
          VisionBoard
        </h1>
      </header>
      
      {/* Основная часть, где будут задачи */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Грид-сетка для задач */}
          <div className="flex flex-wrap justify-center items-start gap-8 p-4">
            <AnimatePresence>
              {isProcessing && <TaskCardSkeleton />}
              
              {visibleTasks.map((task) => (
                <TaskCard key={task.id} task={task} onToggleDone={handleToggleDone} onDelete={handleDeleteTask} />
              ))}
            </AnimatePresence>
          </div>

          {tasks.length === 0 && !isProcessing && (
            <div className="text-center py-20 col-span-full">
              <h2 className="text-2xl text-slate-400">Нажмите на микрофон, чтобы добавить первую задачу!</h2>
            </div>
          )}
        </div>
      </main>

      {/* Рендерим нашу кнопку и передаем ей нужные пропсы */}
      <VoiceButton onResult={handleNewTaskFromVoice} isProcessing={isProcessing} />

    </div>
  );
}

export default App;
