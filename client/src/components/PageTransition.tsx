'use client';

import React, { useEffect, useState, useRef, RefObject, ReactNode } from 'react';

// Hook: animate element when it enters the viewport
export function useInView(options?: IntersectionObserverInit): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null!);
  const [isInView, setIsInView] = useState(false);

  // Memoize options to avoid re-creating observer
  const threshold = options?.threshold ?? 0.1;
  const rootMargin = options?.rootMargin ?? '0px';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isInView];
}

// Component: fade-in wrapper that triggers on viewport entry
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  duration?: number;
}

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  duration = 500,
}: FadeInProps) {
  const [ref, isInView] = useInView();

  const transforms: Record<string, string> = {
    up: 'translateY(20px)',
    down: 'translateY(-20px)',
    left: 'translateX(20px)',
    right: 'translateX(-20px)',
    none: 'none',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'none' : transforms[direction],
        transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

// Component: stagger children animations
interface StaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function Stagger({ children, staggerDelay = 80, className = '' }: StaggerProps) {
  const [ref, isInView] = useInView();

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'none' : 'translateY(16px)',
            transition: `opacity 0.5s ease ${index * staggerDelay}ms, transform 0.5s ease ${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
