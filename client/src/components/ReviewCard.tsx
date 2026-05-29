'use client';

import React from 'react';
import Link from 'next/link';
import { Review } from '@/types';
import { ExternalLink, Clock, GitPullRequest } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-severity-low';
    if (score >= 40) return 'text-severity-high';
    return 'text-severity-critical';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-severity-low/10';
    if (score >= 40) return 'bg-severity-high/10';
    return 'bg-severity-critical/10';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-xs px-2.5 py-1 rounded-full bg-severity-low/15 text-severity-low font-medium badge-pop">Completed</span>;
      case 'processing':
        return (
          <span className="text-xs px-2.5 py-1 rounded-full bg-severity-medium/15 text-severity-medium font-medium badge-pop flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-severity-medium animate-pulse" />
            Processing
          </span>
        );
      case 'failed':
        return <span className="text-xs px-2.5 py-1 rounded-full bg-severity-critical/15 text-severity-critical font-medium badge-pop">Failed</span>;
      default:
        return <span className="text-xs px-2.5 py-1 rounded-full bg-gh-muted/15 text-gh-muted font-medium badge-pop">Pending</span>;
    }
  };

  const severityCounts = {
    critical: review.issues?.filter(i => i.severity === 'critical').length || 0,
    high: review.issues?.filter(i => i.severity === 'high').length || 0,
    medium: review.issues?.filter(i => i.severity === 'medium').length || 0,
    low: review.issues?.filter(i => i.severity === 'low').length || 0,
  };

  return (
    <Link href={`/review/${review._id}`}>
      <div className="bg-gh-surface border border-gh-border rounded-xl p-5 card-hover cursor-pointer group hover:border-gh-accent/30">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <GitPullRequest size={14} className="text-gh-accent flex-shrink-0" />
              <span className="text-sm font-semibold text-gh-text truncate group-hover:text-gh-accent transition-colors">
                {review.prTitle || `PR #${review.prNumber}`}
              </span>
            </div>
            <p className="text-xs text-gh-muted truncate font-mono">{review.repoFullName}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {getStatusBadge(review.status)}
            {review.status === 'completed' && (
              <span className={`text-lg font-bold ${getScoreColor(review.score)} ${getScoreBg(review.score)} px-2 py-0.5 rounded-lg`}>
                {review.score}
              </span>
            )}
          </div>
        </div>

        {review.status === 'completed' && (review.issues?.length > 0) && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {severityCounts.critical > 0 && (
              <span className="text-xs text-severity-critical bg-severity-critical/10 px-2 py-0.5 rounded-full font-medium">
                {severityCounts.critical} critical
              </span>
            )}
            {severityCounts.high > 0 && (
              <span className="text-xs text-severity-high bg-severity-high/10 px-2 py-0.5 rounded-full font-medium">
                {severityCounts.high} high
              </span>
            )}
            {severityCounts.medium > 0 && (
              <span className="text-xs text-severity-medium bg-severity-medium/10 px-2 py-0.5 rounded-full font-medium">
                {severityCounts.medium} medium
              </span>
            )}
            {severityCounts.low > 0 && (
              <span className="text-xs text-severity-low bg-severity-low/10 px-2 py-0.5 rounded-full font-medium">
                {severityCounts.low} low
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gh-border/50">
          <div className="flex items-center gap-1.5 text-xs text-gh-muted">
            <Clock size={12} />
            {new Date(review.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <ExternalLink
            size={14}
            className="text-gh-muted group-hover:text-gh-accent transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </Link>
  );
}
