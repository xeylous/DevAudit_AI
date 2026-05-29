'use client';

import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  animated?: boolean;
}

export default function ScoreGauge({ score, size = 150, animated = true }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return '#3fb950';
    if (s >= 40) return '#d29922';
    return '#f85149';
  };

  const getGlow = (s: number) => {
    if (s >= 70) return 'rgba(63, 185, 80, 0.3)';
    if (s >= 40) return 'rgba(210, 153, 34, 0.3)';
    return 'rgba(248, 81, 73, 0.3)';
  };

  const getLabel = (s: number) => {
    if (s >= 90) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 40) return 'Needs Work';
    return 'Critical';
  };

  const getEmoji = (s: number) => {
    if (s >= 90) return '🎉';
    if (s >= 70) return '✅';
    if (s >= 40) return '⚠️';
    return '🔴';
  };

  const color = getColor(score);

  // Animate the score number counting up
  useEffect(() => {
    setMounted(true);
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    const duration = 1800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // quartic ease-out
      setDisplayScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, animated]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          filter: mounted ? `drop-shadow(0 0 12px ${getGlow(score)})` : 'none',
          transition: 'filter 1s ease',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#21262d"
            strokeWidth="10"
            fill="none"
          />
          {/* Track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#30363d"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${circumference * 0.02} ${circumference * 0.04}`}
            opacity="0.3"
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted && animated ? offset : circumference}
            className="score-circle"
            style={{
              transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold tabular-nums tracking-tight"
            style={{ color }}
          >
            {displayScore}
          </span>
          <span className="text-xs text-gh-muted font-medium">/100</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{getEmoji(score)}</span>
        <span
          className="text-sm font-semibold"
          style={{ color }}
        >
          {getLabel(score)}
        </span>
      </div>
    </div>
  );
}
