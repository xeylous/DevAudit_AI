'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Shield } from 'lucide-react';
import { GithubIcon as Github } from '@/components/GithubIcon';

export default function Navbar() {
  const { user, isAuthenticated } = useStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gh-accent rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gh-text">DevAudit <span className="text-gh-accent">AI</span></span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-gh-accent hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <a
                href={`${apiUrl}/api/auth/github`}
                className="flex items-center gap-2 px-4 py-2 bg-gh-accent hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Github size={18} />
                Login with GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
