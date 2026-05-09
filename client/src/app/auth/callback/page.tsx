'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Loader2 } from 'lucide-react';
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
      <div className="text-center">
        <Loader2 size={40} className="animate-spin text-gh-accent mx-auto mb-4" />
        <p className="text-gh-text text-lg font-medium">Authenticating...</p>
        <p className="text-gh-muted text-sm mt-2">Connecting your GitHub account</p>
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
