'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Shield, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      router.push('/?error=auth_failed');
      return;
    }

    if (token) {
      setToken(token);
      router.push('/dashboard');
    } else {
      router.push('/?error=no_token');
    }
  }, [searchParams, router, setToken]);

  return (
    <div className="min-h-screen bg-gh-bg flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gh-accent/10 border border-gh-accent/20 flex items-center justify-center">
            <Shield size={32} className="text-gh-accent" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-gh-accent/30 border-t-gh-accent processing-orbit" />
        </div>
        <p className="text-gh-text text-lg font-semibold tracking-tight">Authenticating...</p>
        <p className="text-gh-muted text-sm mt-2">Connecting your GitHub account</p>
        <div className="flex justify-center gap-1 mt-4">
          <span className="w-1.5 h-1.5 rounded-full bg-gh-accent loading-pulse" style={{ animationDelay: '0s' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gh-accent loading-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gh-accent loading-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gh-bg flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-gh-accent" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
