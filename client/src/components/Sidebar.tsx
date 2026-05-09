'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  LayoutDashboard,
  GitBranch,
  FileSearch,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gh-surface border border-gh-border rounded-lg text-gh-text hover:bg-gh-border transition-colors"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-gh-surface border-r border-gh-border flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gh-border">
          <div className="w-9 h-9 bg-gh-accent rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gh-text tracking-tight">DevAudit</h1>
            <p className="text-xs text-gh-accent font-medium -mt-0.5">AI</p>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gh-accent/10 text-gh-accent border border-gh-accent/20'
                    : 'text-gh-muted hover:text-gh-text hover:bg-gh-bg'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {user && (
          <div className="border-t border-gh-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full ring-2 ring-gh-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gh-text truncate">{user.username}</p>
                <p className="text-xs text-gh-muted">
                  {user.plan?.type === 'pro' ? '✨ Pro' : 'Free'} • {user.plan?.reviewsUsed || 0}/{user.plan?.limit || 10}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gh-muted hover:text-severity-critical hover:bg-severity-critical/10 rounded-lg transition-colors"
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
