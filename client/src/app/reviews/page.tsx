'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ReviewCard from '@/components/ReviewCard';
import EmptyState from '@/components/EmptyState';
import { ReviewCardSkeleton } from '@/components/Skeleton';
import { FadeIn } from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { useReview } from '@/hooks/useReview';
import api from '@/api/axios';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Review } from '@/types';
import Link from 'next/link';

export default function Reviews() {
  const router = useRouter();
  const { user, setUser, token } = useStore();
  const { getHistory } = useReview();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) { router.push('/'); return; }
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data);
      } catch { router.push('/'); }
    };
    if (!user) fetchUser();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchReviews = async () => {
      setLoading(true);
      const data = await getHistory(page);
      setReviews(data.reviews);
      setTotalPages(data.pagination?.pages || 1);
      setLoading(false);
    };
    fetchReviews();
  }, [token, page]);

  return (
    <div className="min-h-screen bg-gh-bg">
      <Sidebar />

      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gh-text tracking-tight">Review History</h1>
              <p className="text-sm text-gh-muted mt-1">All your past code reviews</p>
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

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 stagger-enter">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <FadeIn>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-gh-surface border border-gh-border rounded-xl text-gh-text hover:bg-gh-border disabled:opacity-30 transition-all duration-200 active:scale-95"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                            page === pageNum
                              ? 'bg-gh-accent text-white shadow-glow-green'
                              : 'bg-gh-surface border border-gh-border text-gh-muted hover:text-gh-text hover:bg-gh-border'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-gh-surface border border-gh-border rounded-xl text-gh-text hover:bg-gh-border disabled:opacity-30 transition-all duration-200 active:scale-95"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </FadeIn>
            )}
          </>
        )}
      </main>
    </div>
  );
}
