'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ReviewCard from '@/components/ReviewCard';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store/useStore';
import { useReview } from '@/hooks/useReview';
import { Toaster } from 'react-hot-toast';
import api from '@/api/axios';
import {
  FileSearch,
  Bug,
  Shield,
  TrendingUp,
  Plus,
  Loader2,
} from 'lucide-react';
import { Review, DashboardStats } from '@/types';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, token } = useStore();
  const { getHistory, getStats } = useReview();
  const [stats, setStats] = useState<DashboardStats>({ totalReviews: 0, issuesFound: 0, securityFlags: 0, avgScore: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data);
      } catch {
        router.push('/');
      }
    };

    if (!user) {
      fetchUser();
    }
  }, [token]);

  // Fetch dashboard data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, historyData] = await Promise.all([
          getStats(),
          getHistory(1)
        ]);
        setStats(statsData);
        setReviews(historyData.reviews);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const statCards = [
    { label: 'Total Reviews', value: stats.totalReviews, icon: FileSearch, color: 'text-severity-medium' },
    { label: 'Issues Found', value: stats.issuesFound, icon: Bug, color: 'text-severity-high' },
    { label: 'Security Flags', value: stats.securityFlags, icon: Shield, color: 'text-severity-critical' },
    { label: 'Avg Score', value: stats.avgScore, icon: TrendingUp, color: 'text-severity-low' },
  ];

  return (
    <div className="min-h-screen bg-gh-bg">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#161b22', color: '#e6edf3', border: '1px solid #30363d' },
        }}
      />
      <Sidebar />

      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gh-text">Dashboard</h1>
            <p className="text-sm text-gh-muted mt-1">
              Welcome back{user ? `, ${user.username}` : ''}! Here&apos;s your review overview.
            </p>
          </div>
          <Link
            href="/repositories"
            className="flex items-center gap-2 px-4 py-2.5 bg-gh-accent hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Review
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-gh-surface border border-gh-border rounded-lg p-4 hover:border-gh-accent/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-gh-text">{stat.value}</div>
              <div className="text-xs text-gh-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Reviews */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gh-text">Recent Reviews</h2>
            <Link href="/reviews" className="text-sm text-gh-accent hover:text-green-400 transition-colors">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-gh-accent" />
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              type="reviews"
              action={
                <Link
                  href="/repositories"
                  className="flex items-center gap-2 px-4 py-2 bg-gh-accent hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Start Your First Review
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.slice(0, 6).map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
