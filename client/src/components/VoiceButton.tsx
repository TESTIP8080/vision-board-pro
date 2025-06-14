import { useState, useEffect, useRef } from 'react';

// Эта строчка @ts-ignore нужна, чтобы TypeScript не ругался на window.SpeechRecognition
// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

interface VoiceButtonProps {
  onResult: (transcript: string) => void; // Функция, которая будет вызываться с распознанным текстом
  isProcessing: boolean; // Флаг, который показывает, что идет генерация картинки
}

export function VoiceButton({ onResult, isProcessing }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  
  // Используем useRef для хранения объекта recognition.
  // Это гарантирует, что он будет создан только один раз и не будет вызывать перерисовку.
  const recognitionRef = useRef<any>(null);

  // Этот useEffect сработает только один раз, когда компонент появится на экране.
  // Это правильное место для инициализации API браузера.
  useEffect(() => {
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'ru-RU';
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript); // Вызываем функцию из App.tsx с результатом
        setIsListening(false); // Выключаем прослушивание
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
          setIsListening(false);
      }

      recognitionRef.current = recognitionInstance; // Сохраняем готовый объект
    } else {
      console.error("Извините, ваш браузер не поддерживает распознавание речи.");
    }
  }, [onResult]); // Добавляем onResult в зависимости

  const handleMouseDown = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isProcessing || isListening) return;
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.log("Recognition start error (likely safe to ignore):", error);
    }
  };

  const handleMouseUp = () => {
    const recognition = recognitionRef.current;
    if (!recognition || !isListening) return;

    setTimeout(() => {
      recognition.stop();
      setIsListening(false);
    }, 250);
  };

  // Определяем стиль кнопки в зависимости от состояния
  const getButtonClass = () => {
    if (isProcessing) {
      return 'bg-yellow-500 cursor-not-allowed animate-spin'; // Желтый спиннер
    }
    if (isListening) {
      return 'bg-red-500 scale-110'; // Красный с масштабом
    }
    return 'bg-blue-600 hover:bg-blue-700'; // Обычный синий
  }

  return (
    <div className="fixed bottom-10 right-10">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        disabled={isProcessing}
        className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transform transition-all duration-200 ${getButtonClass()}`}
      >
        {/* SVG иконка микрофона */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm1 10.33A2.33 2.33 0 015.33 12H5a5 5 0 004.472 4.972V19H8a1 1 0 100 2h4a1 1 0 100-2h-1.472v-2.028A5 5 0 0015 12h-.33a2.33 2.33 0 01-2.34 2.33V14.33z" />
        </svg>
      </button>
    </div>
  );
} 