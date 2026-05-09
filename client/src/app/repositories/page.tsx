'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store/useStore';
import { useReview } from '@/hooks/useReview';
import { Toaster } from 'react-hot-toast';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import {
  Search,
  GitBranch,
  Star,
  Lock,
  Globe,
  Code,
  GitPullRequest,
  Loader2,
  X,
} from 'lucide-react';
import { Repo, PR } from '@/types';

export default function Repositories() {
  const router = useRouter();
  const { user, setUser, token } = useStore();
  const { getRepos, getRepoPRs, startReview } = useReview();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [prs, setPrs] = useState<PR[]>([]);
  const [prsLoading, setPrsLoading] = useState(false);
  const [prUrl, setPrUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auth check + fetch user
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

  // Fetch repos
  useEffect(() => {
    if (!token) return;
    const fetchRepos = async () => {
      setLoading(true);
      const data = await getRepos(search);
      setRepos(data);
      setLoading(false);
    };
    fetchRepos();
  }, [token, search]);

  // Fetch PRs when repo selected
  const openReviewModal = async (repo: Repo) => {
    setSelectedRepo(repo);
    setPrUrl(`https://github.com/${repo.fullName}/pull/`);
    setPrsLoading(true);
    const data = await getRepoPRs(repo.fullName);
    setPrs(data);
    setPrsLoading(false);
  };

  const handleStartReview = async (url?: string) => {
    const finalUrl = url || prUrl;
    if (!finalUrl || !finalUrl.includes('/pull/')) {
      toast.error('Please enter a valid PR URL');
      return;
    }
    setSubmitting(true);
    try {
      const result = await startReview(finalUrl);
      setSelectedRepo(null);
      router.push(`/review/${result.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const languageColors: Record<string, string> = {
    JavaScript: 'bg-yellow-400',
    TypeScript: 'bg-blue-400',
    Python: 'bg-green-400',
    Java: 'bg-orange-400',
    Go: 'bg-cyan-400',
    Rust: 'bg-orange-600',
    Ruby: 'bg-red-400',
    'C++': 'bg-pink-400',
    C: 'bg-gray-400',
    'C#': 'bg-purple-400',
    PHP: 'bg-indigo-400',
    Swift: 'bg-orange-500',
    Kotlin: 'bg-purple-500',
  };

  return (
    <div className="min-h-screen bg-gh-bg">
      <Toaster position="top-right" toastOptions={{ style: { background: '#161b22', color: '#e6edf3', border: '1px solid #30363d' } }} />
      <Sidebar />

      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gh-text">Repositories</h1>
            <p className="text-sm text-gh-muted mt-1">Select a repository to review a Pull Request</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gh-muted" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gh-bg border border-gh-border rounded-lg text-sm text-gh-text placeholder-gh-muted focus:outline-none focus:ring-1 focus:ring-gh-accent transition-colors"
            />
          </div>
        </div>

        {/* Repo Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-gh-accent" />
          </div>
        ) : repos.length === 0 ? (
          <EmptyState type="repos" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="bg-gh-surface border border-gh-border rounded-lg p-5 hover:border-gh-accent/30 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <GitBranch size={16} className="text-gh-accent flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-gh-text truncate">{repo.name}</h3>
                  </div>
                  {repo.isPrivate ? (
                    <Lock size={14} className="text-gh-muted flex-shrink-0" />
                  ) : (
                    <Globe size={14} className="text-gh-muted flex-shrink-0" />
                  )}
                </div>

                {repo.description && (
                  <p className="text-xs text-gh-muted line-clamp-2 mb-4">{repo.description}</p>
                )}

                <div className="flex items-center gap-4 mb-4">
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${languageColors[repo.language] || 'bg-gh-muted'}`} />
                      <span className="text-xs text-gh-muted">{repo.language}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-gh-muted" />
                    <span className="text-xs text-gh-muted">{repo.stars}</span>
                  </div>
                </div>

                <button
                  onClick={() => openReviewModal(repo)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gh-accent/10 hover:bg-gh-accent hover:text-white text-gh-accent rounded-lg text-sm font-medium transition-all duration-200 border border-gh-accent/20 hover:border-gh-accent"
                >
                  <GitPullRequest size={14} />
                  Review a PR
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* PR Review Modal */}
      {selectedRepo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRepo(null)}>
          <div
            className="bg-gh-surface border border-gh-border rounded-xl max-w-lg w-full p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gh-text">Review a Pull Request</h3>
                <p className="text-sm text-gh-muted mt-0.5">{selectedRepo.fullName}</p>
              </div>
              <button onClick={() => setSelectedRepo(null)} className="text-gh-muted hover:text-gh-text transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* PR URL Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gh-text mb-2">PR URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://github.com/owner/repo/pull/123"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-gh-bg border border-gh-border rounded-lg text-sm text-gh-text placeholder-gh-muted focus:outline-none focus:ring-1 focus:ring-gh-accent"
                />
                <button
                  onClick={() => handleStartReview()}
                  disabled={submitting}
                  className="px-4 py-2.5 bg-gh-accent hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Code size={14} />}
                  Review
                </button>
              </div>
            </div>

            {/* Open PRs */}
            <div>
              <h4 className="text-sm font-medium text-gh-text mb-3">Or select an open PR:</h4>
              {prsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-gh-accent" />
                </div>
              ) : prs.length === 0 ? (
                <p className="text-sm text-gh-muted text-center py-4">No open pull requests</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {prs.map((pr) => (
                    <button
                      key={pr.number}
                      onClick={() => handleStartReview(pr.url)}
                      disabled={submitting}
                      className="w-full flex items-center gap-3 p-3 bg-gh-bg hover:bg-gh-border/30 rounded-lg text-left transition-colors disabled:opacity-50"
                    >
                      <GitPullRequest size={16} className="text-gh-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gh-text truncate">{pr.title}</p>
                        <p className="text-xs text-gh-muted">#{pr.number} by {pr.user}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
