import { useState, useEffect } from 'react';

interface WeatherData {
  temp: string;
  description: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://wttr.in/Bishkek?format=%t|%C&lang=ru');
        if (!response.ok) throw new Error('Failed to fetch weather');
        const text = await response.text();
        const [temp, description] = text.split('|');
        setWeather({ temp: temp.trim(), description: description.trim() });
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 1800000); // Обновляем каждые 30 минут
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/80 rounded-lg px-4 py-2 shadow text-slate-800 animate-pulse">
        Загрузка...
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-white/80 rounded-lg px-4 py-2 shadow text-slate-800 flex items-center gap-2">
      <div className="text-lg font-semibold">{weather.temp}</div>
      <div className="text-sm capitalize">{weather.description}</div>
    </div>
  );
} 