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
import { Loader2, Plus } from 'lucide-react';
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
      <Toaster position="top-right" toastOptions={{ style: { background: '#161b22', color: '#e6edf3', border: '1px solid #30363d' } }} />
      <Sidebar />

      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gh-text">Review History</h1>
            <p className="text-sm text-gh-muted mt-1">All your past code reviews</p>
          </div>
          <Link
            href="/repositories"
            className="flex items-center gap-2 px-4 py-2.5 bg-gh-accent hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Review
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
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
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm bg-gh-surface border border-gh-border rounded-lg text-gh-text hover:bg-gh-border disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gh-muted">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm bg-gh-surface border border-gh-border rounded-lg text-gh-text hover:bg-gh-border disabled:opacity-30 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
