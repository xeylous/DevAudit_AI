'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ReviewCard from '@/components/ReviewCard';
import EmptyState from '@/components/EmptyState';
import AnimatedCounter from '@/components/AnimatedCounter';
import { StatCardSkeleton, ReviewCardSkeleton } from '@/components/Skeleton';
import { FadeIn } from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { useReview } from '@/hooks/useReview';
import api from '@/api/axios';
import {
  FileSearch,
  Bug,
  Shield,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Review, DashboardStats } from '@/types';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser, token } = useStore();
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
    { label: 'Total Reviews', value: stats.totalReviews, icon: FileSearch, color: 'text-severity-medium', bgColor: 'bg-severity-medium/10', glowColor: 'group-hover:shadow-glow-blue' },
    { label: 'Issues Found', value: stats.issuesFound, icon: Bug, color: 'text-severity-high', bgColor: 'bg-severity-high/10', glowColor: 'group-hover:shadow-glow-yellow' },
    { label: 'Security Flags', value: stats.securityFlags, icon: Shield, color: 'text-severity-critical', bgColor: 'bg-severity-critical/10', glowColor: 'group-hover:shadow-glow-red' },
    { label: 'Avg Score', value: stats.avgScore, icon: TrendingUp, color: 'text-severity-low', bgColor: 'bg-severity-low/10', glowColor: 'group-hover:shadow-glow-green' },
  ];

  return (
    <div className="min-h-screen bg-gh-bg">
      <Sidebar />

      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gh-text tracking-tight">Dashboard</h1>
              <p className="text-sm text-gh-muted mt-1">
                Welcome back{user ? `, ${user.username}` : ''}! Here&apos;s your review overview.
              </p>
            </div>
            <Link
              href="/repositories"
              className="flex items-center gap-2 px-5 py-2.5 bg-gh-accent hover:bg-gh-accent-hover text-white rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-glow-green active:scale-95"
            >
              <Plus size={16} />
              New Review
            </Link>
          </div>
        </FadeIn>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map((stat, i) => (
                <FadeIn key={stat.label} delay={i * 80}>
                  <div
                    className={`bg-gh-surface border border-gh-border rounded-xl p-5 card-hover group icon-bounce ${stat.glowColor}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center stat-icon transition-transform duration-200`}>
                        <stat.icon size={20} className={stat.color} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gh-text tracking-tight">
                      <AnimatedCounter target={stat.value} duration={1200} />
                    </div>
                    <div className="text-xs text-gh-muted mt-1 font-medium">{stat.label}</div>
                  </div>
                </FadeIn>
              ))
          }
        </div>

        {/* Recent Reviews */}
        <div className="mb-8">
          <FadeIn>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gh-text">Recent Reviews</h2>
              <Link href="/reviews" className="text-sm text-gh-accent hover:text-emerald-400 transition-colors font-medium flex items-center gap-1 group">
                View all
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </FadeIn>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              type="reviews"
              action={
                <Link
                  href="/repositories"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gh-accent hover:bg-gh-accent-hover text-white rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-glow-green active:scale-95"
                >
                  <Plus size={16} />
                  Start Your First Review
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-enter">
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

