'use client';

import React from 'react';
import Link from 'next/link';
import { Review } from '@/types';
import SeverityBadge from './SeverityBadge';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-severity-low/15 text-severity-low">Completed</span>;
      case 'processing':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-severity-medium/15 text-severity-medium">Processing</span>;
      case 'failed':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-severity-critical/15 text-severity-critical">Failed</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-gh-muted/15 text-gh-muted">Pending</span>;
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
      <div className="bg-gh-surface border border-gh-border rounded-lg p-4 hover:border-gh-accent/50 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <GitPullRequest size={14} className="text-gh-accent flex-shrink-0" />
              <span className="text-sm font-medium text-gh-text truncate">
                {review.prTitle || `PR #${review.prNumber}`}
              </span>
            </div>
            <p className="text-xs text-gh-muted truncate">{review.repoFullName}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge(review.status)}
            {review.status === 'completed' && (
              <span className={`text-lg font-bold ${getScoreColor(review.score)}`}>
                {review.score}
              </span>
            )}
          </div>
        </div>

        {review.status === 'completed' && (review.issues?.length > 0) && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {severityCounts.critical > 0 && (
              <span className="text-xs text-severity-critical">{severityCounts.critical} critical</span>
            )}
            {severityCounts.high > 0 && (
              <span className="text-xs text-severity-high">{severityCounts.high} high</span>
            )}
            {severityCounts.medium > 0 && (
              <span className="text-xs text-severity-medium">{severityCounts.medium} medium</span>
            )}
            {severityCounts.low > 0 && (
              <span className="text-xs text-severity-low">{severityCounts.low} low</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gh-muted">
            <Clock size={12} />
            {new Date(review.createdAt).toLocaleDateString()}
          </div>
          <ExternalLink size={14} className="text-gh-muted group-hover:text-gh-accent transition-colors" />
        </div>
      </div>
    </Link>
  );
}
