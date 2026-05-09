'use client';

import { useState, useCallback } from 'react';
import api from '@/api/axios';
import { Review, DashboardStats, Repo, PR } from '@/types';
import toast from 'react-hot-toast';

export function useReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startReview = useCallback(async (prUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/review/start', { prUrl });
      toast.success('Review started! AI agent is analyzing the PR...');
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to start review';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReview = useCallback(async (id: string): Promise<Review | null> => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/review/${id}`);
      return data;
    } catch (err: any) {
      toast.error('Failed to load review');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (page = 1): Promise<{ reviews: Review[]; pagination: any }> => {
    try {
      const { data } = await api.get(`/api/review/history?page=${page}`);
      return data;
    } catch {
      return { reviews: [], pagination: { total: 0 } };
    }
  }, []);

  const getStats = useCallback(async (): Promise<DashboardStats> => {
    try {
      const { data } = await api.get('/api/review/stats');
      return data;
    } catch {
      return { totalReviews: 0, issuesFound: 0, securityFlags: 0, avgScore: 0 };
    }
  }, []);

  const postToGitHub = useCallback(async (reviewId: string) => {
    try {
      await api.post(`/api/review/${reviewId}/post-comment`);
      toast.success('Review posted to GitHub PR!');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to post to GitHub');
      return false;
    }
  }, []);

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      await api.delete(`/api/review/${reviewId}`);
      toast.success('Review deleted');
      return true;
    } catch {
      toast.error('Failed to delete review');
      return false;
    }
  }, []);

  const getRepos = useCallback(async (search = ''): Promise<Repo[]> => {
    try {
      const { data } = await api.get(`/api/repos?search=${search}`);
      return data.repos || [];
    } catch {
      return [];
    }
  }, []);

  const getRepoPRs = useCallback(async (repoFullName: string): Promise<PR[]> => {
    try {
      const { data } = await api.get(`/api/repos/${repoFullName}/prs`);
      return data.prs || [];
    } catch {
      return [];
    }
  }, []);

  return {
    loading,
    error,
    startReview,
    getReview,
    getHistory,
    getStats,
    postToGitHub,
    deleteReview,
    getRepos,
    getRepoPRs,
  };
}
