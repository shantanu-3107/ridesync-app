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

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
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
      className={className}
      style={{
        ...style,
        opacity,
      }}
    />
  );
}
