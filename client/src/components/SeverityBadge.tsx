'use client';

import React from 'react';

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
  size?: 'sm' | 'md';
}

const severityConfig = {
  critical: {
    bg: 'bg-severity-critical/15',
    text: 'text-severity-critical',
    dot: 'bg-severity-critical',
    label: 'Critical',
  },
  high: {
    bg: 'bg-severity-high/15',
    text: 'text-severity-high',
    dot: 'bg-severity-high',
    label: 'High',
  },
  medium: {
    bg: 'bg-severity-medium/15',
    text: 'text-severity-medium',
    dot: 'bg-severity-medium',
    label: 'Medium',
  },
  low: {
    bg: 'bg-severity-low/15',
    text: 'text-severity-low',
    dot: 'bg-severity-low',
    label: 'Low',
  },
};

export default function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const config = severityConfig[severity] || severityConfig.medium;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
