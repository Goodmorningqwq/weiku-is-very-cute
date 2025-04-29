'use client';

import React, { useEffect, useState, useRef } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  brightness: number;
  trail: { x: number; y: number; opacity: number; size: number }[];
}

export const StarField = ({ maxStars = 5 }: { maxStars?: number }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const lastStarTime = useRef(0);
  const starCount = useRef(0);

  const generateShootingStar = (id: number): Star => {
    const speed = Math.random() * 2 + 6; // 6–8 px/frame
    const brightness = Math.min(1, speed / 8); // Faster stars look brighter
    const angle = Math.random() * Math.PI/3; // ~36°–108°

    return {
      id,
      x: Math.random() * window.innerWidth,
      y: -10,
      size: Math.random() * 3 + 2, // 2–5px
      speed,
      angle,
      brightness,
      trail: [],
    };
  };

  useEffect(() => {
    const handleResize = () => {
      setStars(prev =>
        prev.map(star => ({
          ...star,
          x: Math.min(star.x, window.innerWidth),
          y: star.y > window.innerHeight ? -10 : star.y,
        }))
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const spawnDelay = 1000;

    const updateStars = (time: number) => {
      if (starCount.current < maxStars && time - lastStarTime.current > spawnDelay) {
        setStars(prev => [...prev, generateShootingStar(Date.now())]);
        starCount.current += 1;
        lastStarTime.current = time;
      }

      setStars(prevStars =>
        prevStars.map(star => {
          const dx = Math.cos(star.angle) * star.speed;
          const dy = Math.sin(star.angle) * star.speed;

          const newX = star.x + dx;
          const newY = star.y + dy;

          const newTrail = [
            {
              x: star.x,
              y: star.y,
              opacity: star.brightness,
              size: star.size * 1.2,
            },
            ...star.trail.map(pos => ({
              ...pos,
              opacity: pos.opacity * 0.9,
              size: pos.size * 0.97,
            })),
          ].slice(0, 20);

          if (
            newY > window.innerHeight * 1.2 ||
            newX > window.innerWidth * 1.2 ||
            newX < -window.innerWidth * 0.2
          ) {
            return generateShootingStar(star.id);
          }

          return {
            ...star,
            x: newX,
            y: newY,
            trail: newTrail,
          };
        })
      );

      animationFrameId = requestAnimationFrame(updateStars);
    };

    animationFrameId = requestAnimationFrame(updateStars);
    return () => cancelAnimationFrame(animationFrameId);
  }, [maxStars]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <React.Fragment key={star.id}>
          {/* Trail */}
          {star.trail.map((pos, i) => (
            <div
              key={`${star.id}-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                opacity: pos.opacity,
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                filter: 'blur(1px)',
                willChange: 'transform, opacity',
              }}
            />
          ))}
          {/* Head */}
          <div
            className="absolute rounded-full"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.brightness,
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              filter: 'blur(1px)',
              boxShadow: `0 0 ${star.size * 5}px ${star.size}px rgba(255,255,255,${star.brightness})`,
              willChange: 'transform, opacity',
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
