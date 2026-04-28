
import React, { useEffect, useRef } from 'react';

interface StarBackgroundProps {
  starCount?: number;
  speedFactor?: number;
  starSize?: number;
  connectionDistance?: number;
  connectionOpacity?: number;
  showSolarSystem?: boolean; 
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

interface Planet {
  orbitRadius: number; 
  angle: number;       
  speed: number;       
  size: number;
  color: string;
}

const StarBackground: React.FC<StarBackgroundProps> = ({
  starCount = 150, // Tăng số lượng sao
  speedFactor = 0.3,
  starSize = 2.5, // Tăng kích thước sao
  connectionDistance = 100,
  connectionOpacity = 0.15,
  showSolarSystem = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const stars: Star[] = [];
    const planets: Planet[] = [];

    // Brighter planet colors
    const planetColors = ['#38bdf8', '#a855f7', '#22d3ee', '#f0f9ff'];

    // Initialize stars
    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speedFactor,
          vy: (Math.random() - 0.5) * speedFactor,
          size: Math.random() * starSize + 0.5,
          opacity: Math.random() * 0.7 + 0.3, // Sáng hơn (min 0.3)
          twinkleSpeed: Math.random() * 0.02 + 0.005
        });
      }
    };

    // Initialize planets
    const initPlanets = () => {
      planets.length = 0;
      if (!showSolarSystem) return;

      const baseRadius = Math.min(width, height) * 0.15;
      const numPlanets = 4;

      for (let i = 0; i < numPlanets; i++) {
        planets.push({
          orbitRadius: baseRadius + (i * 60), 
          angle: Math.random() * Math.PI * 2,
          speed: (0.002 - (i * 0.0003)) * (Math.random() > 0.5 ? 1 : -1), 
          size: Math.random() * 3 + 3, // Planet to hơn chút
          color: planetColors[i % planetColors.length]
        });
      }
    };

    initStars();
    initPlanets();

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;
      
      const centerX = width / 2;
      const centerY = height / 2;

      // --- 1. Draw Solar System & Center Glow ---
      if (showSolarSystem) {
        // Central Bright Glow (Galaxy Core)
        const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
        sunGradient.addColorStop(0, 'rgba(56, 189, 248, 0.15)'); 
        sunGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
        sunGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 300, 0, Math.PI * 2);
        ctx.fill();

        // Draw Orbits and Planets
        planets.forEach(planet => {
          planet.angle += planet.speed;

          // Orbit Line
          ctx.beginPath();
          ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'; // Line sáng hơn
          ctx.lineWidth = 1;
          ctx.stroke();

          // Planet Position
          const px = centerX + Math.cos(planet.angle) * planet.orbitRadius;
          const py = centerY + Math.sin(planet.angle) * planet.orbitRadius;

          // Planet Body
          ctx.beginPath();
          ctx.arc(px, py, planet.size, 0, Math.PI * 2);
          ctx.fillStyle = planet.color;
          ctx.fill();
          
          // Planet Glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = planet.color;
          ctx.fill();
          ctx.shadowBlur = 0; 
        });
      }

      // --- 2. Draw Stars ---
      ctx.fillStyle = '#ffffff';
      
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle
        star.opacity += Math.sin(time * 10 + i) * star.twinkleSpeed;
        // Clamp opacity
        const displayOpacity = Math.max(0.2, Math.min(1, star.opacity));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${displayOpacity})`;
        ctx.fill();
      }

      // --- 3. Draw Connections (Constellations) ---
      // Use simpler brighter lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          
          if (Math.abs(dx) > connectionDistance || Math.abs(dy) > connectionDistance) continue;
          
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * connectionOpacity;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`; // Blue connection
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      initStars();
      initPlanets(); 
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starCount, speedFactor, starSize, connectionDistance, connectionOpacity, showSolarSystem]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      // Remove opacity restriction on canvas to let full brightness through
    />
  );
};

export default StarBackground;
