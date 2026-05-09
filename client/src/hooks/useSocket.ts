'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store/useStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function useSocket(reviewId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const { addAgentLog, updateCurrentReview, setCurrentReview } = useStore();

  useEffect(() => {
    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      // Join review room if reviewId provided
      if (reviewId) {
        socket.emit('join-review', { reviewId });
      }
    });

    socket.on('agent-step', (data: { step: string; message: string; status: string }) => {
      addAgentLog({
        step: data.step,
        message: data.message,
        status: data.status as 'running' | 'done' | 'error',
        timestamp: new Date(),
      });
    });

    socket.on('review-file', (data: { filename: string; issues: any[] }) => {
      console.log('Review file received:', data.filename);
    });

    socket.on('review-done', (data: { reviewId: string; score: number; summary: string }) => {
      updateCurrentReview({
        status: 'completed',
        score: data.score,
        summary: data.summary,
      });
    });

    socket.on('review-error', (data: { message: string }) => {
      updateCurrentReview({ status: 'failed' });
      addAgentLog({
        step: 'error',
        message: `❌ ${data.message}`,
        status: 'error',
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [reviewId]);

  const joinReview = useCallback((id: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-review', { reviewId: id });
    }
  }, []);

  return { socket: socketRef.current, joinReview };
}
