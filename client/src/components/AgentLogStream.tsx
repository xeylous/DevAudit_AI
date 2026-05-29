'use client';

import React, { useRef, useEffect } from 'react';
import { AgentLog } from '@/types';
import { Loader2, CheckCircle2, XCircle, Circle, Activity } from 'lucide-react';

interface AgentLogStreamProps {
  logs: AgentLog[];
  isActive: boolean;
}

export default function AgentLogStream({ logs, isActive }: AgentLogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [logs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 size={16} className="text-severity-medium animate-spin" />;
      case 'done':
        return <CheckCircle2 size={16} className="text-severity-low" />;
      case 'error':
        return <XCircle size={16} className="text-severity-critical" />;
      default:
        return <Circle size={16} className="text-gh-muted" />;
    }
  };

  const completedCount = logs.filter(l => l.status === 'done').length;
  const totalSteps = logs.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  return (
    <div className="bg-gh-surface border border-gh-border rounded-xl overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gh-border flex items-center gap-2">
        {isActive ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gh-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gh-accent" />
          </span>
        ) : (
          <Activity size={14} className="text-gh-muted" />
        )}
        <h3 className="text-sm font-semibold text-gh-text">Agent Activity</h3>
        {isActive && <span className="text-xs text-gh-muted ml-auto">Processing...</span>}
        {!isActive && logs.length > 0 && (
          <span className="text-xs text-gh-muted ml-auto">
            {completedCount} steps completed
          </span>
        )}
      </div>

      {/* Progress bar */}
      {isActive && totalSteps > 0 && (
        <div className="h-0.5 bg-gh-bg">
          <div
            className="h-full bg-gradient-to-r from-gh-accent to-emerald-400 transition-all duration-700 ease-smooth"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Log entries */}
      <div
        ref={scrollRef}
        className="p-4 space-y-1 max-h-[500px] overflow-y-auto"
      >
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gh-muted">
            <Activity size={32} className="mb-3 animate-float opacity-50" />
            <p className="text-sm font-medium">Waiting for review to start...</p>
            <p className="text-xs mt-1 opacity-60">Agent steps will appear here</p>
          </div>
        )}

        {logs.map((log, index) => (
          <div
            key={index}
            className={`timeline-item flex items-start gap-3 py-2 rounded-lg transition-colors duration-200 ${
              log.status === 'running' ? 'bg-severity-medium/5' : ''
            }`}
            style={{
              animation: `staggerFadeInUp 0.4s ease forwards`,
              animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
            }}
          >
            <div className="mt-0.5 flex-shrink-0">
              {getStatusIcon(log.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm break-words ${
                log.status === 'error' ? 'text-severity-critical' :
                log.status === 'running' ? 'text-gh-text font-medium' :
                'text-gh-muted'
              }`}>
                {log.message}
              </p>
              <p className="text-xs text-gh-muted/60 mt-0.5 font-mono">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
              </p>
            </div>
          </div>
        ))}

        {isActive && (
          <div className="flex items-center gap-2 pt-3 pl-7">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gh-accent loading-pulse" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gh-accent loading-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gh-accent loading-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-xs text-gh-muted">Thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}
