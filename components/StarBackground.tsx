import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  tint: 'white' | 'cyan';
}

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let stars: Star[] = [];

    const createStars = () => {
      const count = Math.min(180, Math.max(80, Math.round((width * height) / 11000)));
      stars = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: index % 23 === 0 ? Math.random() * 1.1 + 1 : Math.random() * 0.75 + 0.25,
        opacity: Math.random() * 0.46 + 0.18,
        tint: index % 11 === 0 ? 'cyan' : 'white'
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createStars();
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      stars.forEach(star => {
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = star.tint === 'cyan'
          ? `rgba(165, 243, 252, ${star.opacity})`
          : `rgba(226, 232, 240, ${star.opacity})`;
        context.fill();
      });
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="night-atlas fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="night-atlas__grid" />

      <svg className="night-atlas__contours" viewBox="0 0 900 560" fill="none" preserveAspectRatio="xMaxYMax slice">
        <path d="M926 93C786 24 649 45 568 126c-74 74-51 164-139 216-98 58-210-7-319 63-63 41-91 103-101 177" />
        <path d="M944 145c-124-64-245-45-315 22-63 61-45 137-123 184-92 54-195 4-288 61-53 32-85 82-102 148" />
        <path d="M949 205c-104-56-204-42-263 12-56 51-43 115-107 156-79 50-168 14-249 59-42 24-75 65-96 119" />
        <path d="M952 266c-84-48-167-38-217 6-48 42-40 94-91 130-65 44-138 20-205 55-34 18-63 49-84 91" />
        <path d="M957 328c-66-41-132-34-173 0-39 33-36 76-76 106-51 38-110 24-164 50-27 13-51 35-71 64" />
      </svg>

      <div className="night-atlas__meridian" />
    </div>
  );
};

export default StarBackground;
