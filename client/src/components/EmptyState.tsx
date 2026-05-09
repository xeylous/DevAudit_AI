'use client';

import React from 'react';
import { FileSearch, GitBranch, Shield } from 'lucide-react';

interface EmptyStateProps {
  type?: 'reviews' | 'repos' | 'default';
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ type = 'default', title, description, action }: EmptyStateProps) {
  const configs = {
    reviews: {
      icon: FileSearch,
      defaultTitle: 'No reviews yet',
      defaultDescription: 'Start by reviewing a Pull Request from one of your repositories.',
    },
    repos: {
      icon: GitBranch,
      defaultTitle: 'No repositories found',
      defaultDescription: 'Connect your GitHub account to see your repositories.',
    },
    default: {
      icon: Shield,
      defaultTitle: 'Nothing here yet',
      defaultDescription: 'Get started by exploring the platform.',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gh-border/30 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gh-muted" />
      </div>
      <h3 className="text-lg font-medium text-gh-text mb-1">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-gh-muted text-center max-w-sm mb-6">
        {description || config.defaultDescription}
      </p>
      {action}
    </div>
  );
}
