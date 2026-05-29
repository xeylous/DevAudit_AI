'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  LayoutDashboard,
  GitBranch,
  FileSearch,
  LogOut,
  Menu,
  X,
  Shield,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/repositories', icon: GitBranch, label: 'Repositories' },
  { href: '/reviews', icon: FileSearch, label: 'Reviews' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, sidebarOpen, setSidebarOpen } = useStore();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gh-surface border border-gh-border rounded-lg text-gh-text hover:bg-gh-border transition-all duration-200 active:scale-95"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 modal-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-gh-surface border-r border-gh-border flex flex-col transition-transform duration-300 ease-smooth ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gh-border">
          <div className="w-9 h-9 bg-gh-accent rounded-lg flex items-center justify-center shadow-glow-green transition-transform duration-300 hover:scale-105">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gh-text tracking-tight">DevAudit</h1>
            <p className="text-xs text-gh-accent font-semibold -mt-0.5 flex items-center gap-1">
              <Sparkles size={10} />
              AI Powered
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gh-accent/10 text-gh-accent nav-active-pill'
                    : 'text-gh-muted hover:text-gh-text hover:bg-gh-bg'
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-all duration-200 ${
                    isActive ? 'text-gh-accent' : 'group-hover:text-gh-accent'
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-gh-accent animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {user && (
          <div className="border-t border-gh-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative online-ring">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-9 h-9 rounded-full ring-2 ring-gh-border"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gh-text truncate">{user.username}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium ${user.plan?.type === 'pro' ? 'text-severity-high' : 'text-gh-muted'}`}>
                    {user.plan?.type === 'pro' ? '✨ Pro' : 'Free'}
                  </span>
                  <span className="text-gh-border">·</span>
                  <span className="text-xs text-gh-muted">
                    {user.plan?.reviewsUsed || 0}/{user.plan?.limit || 10}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage progress bar */}
            <div className="mb-3 px-1">
              <div className="h-1.5 bg-gh-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gh-accent to-emerald-400 rounded-full progress-fill transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      ((user.plan?.reviewsUsed || 0) / (user.plan?.limit || 10)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gh-muted hover:text-severity-critical hover:bg-severity-critical/10 rounded-lg transition-all duration-200 active:scale-[0.98]"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
