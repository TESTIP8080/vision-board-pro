import { useState, useEffect } from 'react';

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
        src="https://wttr.in/Bishkek?format=%l:+%c+%t&lang=ru"
        width="140"
        height="32"
        style={{ border: 0 }}
        title="Погода"
        loading="lazy"
        className="w-[140px] h-[32px]"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
} 