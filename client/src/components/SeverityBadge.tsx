'use client';

import React from 'react';

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
  size?: 'sm' | 'md';
}

const severityConfig = {
  critical: {
    bg: 'bg-severity-critical/12',
    text: 'text-severity-critical',
    dot: 'bg-severity-critical',
    label: 'Critical',
    ring: 'ring-severity-critical/20',
  },
  high: {
    bg: 'bg-severity-high/12',
    text: 'text-severity-high',
    dot: 'bg-severity-high',
    label: 'High',
    ring: 'ring-severity-high/20',
  },
  medium: {
    bg: 'bg-severity-medium/12',
    text: 'text-severity-medium',
    dot: 'bg-severity-medium',
    label: 'Medium',
    ring: 'ring-severity-medium/20',
  },
  low: {
    bg: 'bg-severity-low/12',
    text: 'text-severity-low',
    dot: 'bg-severity-low',
    label: 'Low',
    ring: 'ring-severity-low/20',
  },
};

export default function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const config = severityConfig[severity] || severityConfig.medium;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium badge-pop ring-1 ${config.bg} ${config.text} ${config.ring} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${severity === 'critical' ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  );
}
