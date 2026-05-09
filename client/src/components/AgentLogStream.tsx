'use client';

import React, { useRef, useEffect } from 'react';
import { AgentLog } from '@/types';
import { Loader2, CheckCircle2, XCircle, Circle } from 'lucide-react';

interface AgentLogStreamProps {
  logs: AgentLog[];
  isActive: boolean;
}

export default function AgentLogStream({ logs, isActive }: AgentLogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

  return (
    <div className="bg-gh-surface border border-gh-border rounded-lg overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-gh-border flex items-center gap-2">
        {isActive && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gh-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gh-accent"></span>
          </span>
        )}
        <h3 className="text-sm font-semibold text-gh-text">Agent Activity</h3>
        {isActive && <span className="text-xs text-gh-muted ml-auto">Processing...</span>}
      </div>

      <div
        ref={scrollRef}
        className="p-4 space-y-3 max-h-[500px] overflow-y-auto"
      >
        {logs.length === 0 && (
          <div className="flex items-center justify-center py-8 text-gh-muted text-sm">
            Waiting for review to start...
          </div>
        )}

        {logs.map((log, index) => (
          <div
            key={index}
            className="flex items-start gap-3 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="mt-0.5 flex-shrink-0">
              {getStatusIcon(log.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gh-text break-words">{log.message}</p>
              <p className="text-xs text-gh-muted mt-0.5">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
              </p>
            </div>
          </div>
        ))}

        {isActive && (
          <div className="flex items-center gap-2 pt-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gh-accent loading-pulse" style={{ animationDelay: '0s' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gh-accent loading-pulse" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gh-accent loading-pulse" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
