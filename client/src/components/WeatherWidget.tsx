import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

export function WeatherWidget() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Даем время на загрузку iframe
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bg-white/80 rounded-lg shadow overflow-hidden transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <iframe
        src="https://www.gismeteo.ru/informers/iframe/simple/?city=5205&lang=ru&domid=GismeteoWidget&params=white"
        width="180"
        height="120"
        style={{ border: 0 }}
        title="Погода"
        loading="lazy"
        className="w-[180px] h-[120px]"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
} 