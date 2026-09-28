import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const LiveClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass border border-white/10 text-xs font-mono text-white/90 shadow-sm">
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
      <Clock className="w-3.5 h-3.5 text-white/70" />
      <span className="font-semibold tracking-wider">{timeString}</span>
    </div>
  );
};
