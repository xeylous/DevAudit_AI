'use client';

import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  animated?: boolean;
}

export default function ScoreGauge({ score, size = 140, animated = true }: ScoreGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 70) return '#3fb950';
    if (score >= 40) return '#d29922';
    return '#f85149';
  };

  const getLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Critical';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
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
            stroke="#30363d"
            strokeWidth="8"
            fill="none"
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            className={animated ? 'score-circle' : ''}
            style={animated ? {
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 1.5s ease-out',
            } : { strokeDashoffset: offset }}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gh-muted">/100</span>
        </div>
      </div>
      <span
        className="text-sm font-medium"
        style={{ color }}
      >
        {getLabel(score)}
      </span>
    </div>
  );
}
