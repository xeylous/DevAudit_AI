'use client';

import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'gauge' | 'rect';
  width?: string;
  height?: string;
  className?: string;
  lines?: number;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  lines = 1,
}: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`bg-gh-surface border border-gh-border rounded-lg p-5 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-8 h-8 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
        </div>
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    );
  }

  if (variant === 'gauge') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <div className="skeleton w-[140px] h-[140px] rounded-full" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={`skeleton rounded-full ${className}`}
        style={{ width: width || '40px', height: height || '40px' }}
      />
    );
  }

  if (variant === 'rect') {
    return (
      <div
        className={`skeleton ${className}`}
        style={{ width: width || '100%', height: height || '40px' }}
      />
    );
  }

  // Text variant — supports multiple lines
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton rounded"
          style={{
            width: width || (i === lines - 1 ? '60%' : '100%'),
            height: height || '14px',
          }}
        />
      ))}
    </div>
  );
}

// Pre-built skeleton layouts
export function StatCardSkeleton() {
  return (
    <div className="bg-gh-surface border border-gh-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton w-10 h-10 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-16 rounded mb-2" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="bg-gh-surface border border-gh-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="skeleton w-4 h-4 rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
          </div>
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-4 w-4 rounded" />
      </div>
    </div>
  );
}

export function RepoCardSkeleton() {
  return (
    <div className="bg-gh-surface border border-gh-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        <div className="skeleton w-4 h-4 rounded" />
      </div>
      <div className="skeleton h-3 w-full rounded mb-4" />
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="skeleton w-2.5 h-2.5 rounded-full" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
        <div className="skeleton h-3 w-8 rounded" />
      </div>
      <div className="skeleton h-9 w-full rounded-lg" />
    </div>
  );
}
