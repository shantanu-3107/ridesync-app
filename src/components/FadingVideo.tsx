import React, { useEffect, useRef, useState } from 'react';

interface FadingVideoProps {
  src: string | string[];
  className?: string;
  style?: React.CSSProperties;
}

export function FadingVideo({ src, className, style }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const currentOpacityRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const isFadingOut = useRef(false);

  const sources = Array.isArray(src) ? src : [src];
  const currentSrc = sources[currentIndex % sources.length];

  const startFadeIn = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    isFadingOut.current = false;
    const startTime = performance.now();
    const startOpacity = currentOpacityRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / 500, 1);
      const nextOpacity = startOpacity + (1 - startOpacity) * progress;
      currentOpacityRef.current = nextOpacity;
      setOpacity(nextOpacity);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
  };

  const handleLoadedData = () => {
    startFadeIn();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration || isFadingOut.current) return;

    const remainingTime = video.duration - video.currentTime;
    if (remainingTime <= 0.55 && remainingTime > 0) {
      isFadingOut.current = true;
      if (rafId.current) cancelAnimationFrame(rafId.current);

      const startTime = performance.now();
      const startOpacity = currentOpacityRef.current;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / 550, 1);
        const nextOpacity = Math.max(startOpacity * (1 - progress), 0);
        currentOpacityRef.current = nextOpacity;
        setOpacity(nextOpacity);

        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate);
        }
      };

      rafId.current = requestAnimationFrame(animate);
    }
  };

  const handleEnded = () => {
    const isMultiSource = Array.isArray(src) && src.length > 1;
    if (isMultiSource) {
      isFadingOut.current = false;
      currentOpacityRef.current = 0;
      setOpacity(0);
      setCurrentIndex((prev) => (prev + 1) % src.length);
    } else {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
        startFadeIn();
      }
    }
  };

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Ambient glowing backdrop gradient for smooth loading & offline fallback */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black via-[#081210] to-black opacity-90"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 80% 60%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 20% 70%, rgba(245, 158, 11, 0.06) 0%, transparent 50%)
          `
        }}
      />

      {!hasError && (
        <video
          ref={videoRef}
          key={currentSrc}
          src={currentSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          onLoadedData={handleLoadedData}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={() => setHasError(true)}
          className={className}
          style={{
            ...style,
            opacity,
            transition: 'opacity 0.6s ease',
          }}
        />
      )}
    </div>
  );
}
