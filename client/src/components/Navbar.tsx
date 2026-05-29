'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Shield } from 'lucide-react';
import { GithubIcon as Github } from '@/components/GithubIcon';

export default function Navbar() {
  const { user, isAuthenticated } = useStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'navbar-scrolled' : 'glass'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gh-accent rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-glow-green">
              <Shield size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gh-text tracking-tight">
              DevAudit{' '}
              <span className="bg-gradient-to-r from-gh-accent to-emerald-400 bg-clip-text text-transparent">
                AI
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2 bg-gh-accent hover:bg-gh-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-glow-green active:scale-95"
              >
                Dashboard
              </Link>
            ) : (
              <a
                href={`${apiUrl}/api/auth/github`}
                className="flex items-center gap-2 px-5 py-2 bg-gh-accent hover:bg-gh-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-glow-green active:scale-95"
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
