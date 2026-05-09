'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AgentLogStream from '@/components/AgentLogStream';
import CodeDiffViewer from '@/components/CodeDiffViewer';
import ScoreGauge from '@/components/ScoreGauge';
import SeverityBadge from '@/components/SeverityBadge';
import { useStore } from '@/store/useStore';
import { useSocket } from '@/hooks/useSocket';
import { useReview } from '@/hooks/useReview';
import { Toaster } from 'react-hot-toast';
import api from '@/api/axios';
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Shield,
  TestTube,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { Review, Issue } from '@/types';
import Link from 'next/link';

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, setUser, token, agentLogs, clearAgentLogs } = useStore();
  const { getReview, postToGitHub } = useReview();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [copiedFix, setCopiedFix] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'security' | 'tests'>('issues');

  // Connect socket for this review
  const { socket } = useSocket(id);

  // Auth check
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

  // Clear logs when entering a new review
  useEffect(() => {
    clearAgentLogs();
  }, [id]);

  // Fetch review data
  useEffect(() => {
    if (!token || !id) return;

    const fetchReview = async () => {
      setLoading(true);
      const data = await getReview(id);
      if (data) setReview(data);
      setLoading(false);
    };

    fetchReview();

    // Poll for updates while processing
    const interval = setInterval(async () => {
      const data = await getReview(id);
      if (data) {
        setReview(data);
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [token, id]);

  const handlePostToGitHub = async () => {
    if (!review) return;
    setPosting(true);
    const success = await postToGitHub(review._id);
    if (success) {
      setReview({ ...review, postedToGitHub: true });
    }
    setPosting(false);
  };

  const copyFix = (fix: string, index: number) => {
    navigator.clipboard.writeText(fix);
    setCopiedFix(index);
    setTimeout(() => setCopiedFix(null), 2000);
  };

  const isProcessing = review?.status === 'processing' || review?.status === 'pending';
  const isCompleted = review?.status === 'completed';

  if (loading) {
    return (
      <div className="min-h-screen bg-gh-bg flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-gh-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gh-bg">
      <Toaster position="top-right" toastOptions={{ style: { background: '#161b22', color: '#e6edf3', border: '1px solid #30363d' } }} />
      <Sidebar />

      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <button onClick={() => router.back()} className="mt-1 p-1.5 hover:bg-gh-surface rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-gh-muted" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gh-text">
                {review?.prTitle || `PR #${review?.prNumber}`}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gh-muted">{review?.repoFullName}</span>
                {review?.prUrl && (
                  <a href={review.prUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gh-accent hover:text-green-400 transition-colors">
                    <ExternalLink size={12} />
                    View on GitHub
                  </a>
                )}
              </div>
            </div>
          </div>

          {isCompleted && !review?.postedToGitHub && (
            <button
              onClick={handlePostToGitHub}
              disabled={posting}
              className="flex items-center gap-2 px-4 py-2.5 bg-gh-accent hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Post to GitHub
            </button>
          )}
          {review?.postedToGitHub && (
            <span className="flex items-center gap-2 px-4 py-2.5 bg-severity-low/10 text-severity-low rounded-lg text-sm font-medium">
              <CheckCircle2 size={14} />
              Posted to GitHub
            </span>
          )}
        </div>

        {/* Main content: Agent Logs + Code Diff */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          {/* Agent Log Stream - Left panel */}
          <div className="lg:col-span-2">
            <AgentLogStream logs={agentLogs} isActive={isProcessing || false} />
          </div>

          {/* Code Diff Viewer - Right panel */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-3">
              <FileCode size={18} className="text-gh-muted" />
              <h2 className="text-sm font-semibold text-gh-text">Changed Files</h2>
              {review?.files && (
                <span className="text-xs text-gh-muted">({review.files.length} files)</span>
              )}
            </div>
            <CodeDiffViewer
              files={review?.files || []}
              issues={review?.issues || []}
            />
          </div>
        </div>

        {/* Results section - only show when completed */}
        {isCompleted && review && (
          <div className="space-y-6 animate-fade-in">
            {/* Score + Summary row */}
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Score Gauge */}
              <div className="bg-gh-surface border border-gh-border rounded-lg p-6 flex flex-col items-center justify-center">
                <ScoreGauge score={review.score} />
                {review.scoreReason && (
                  <p className="text-xs text-gh-muted text-center mt-3 max-w-[200px]">
                    {review.scoreReason}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="lg:col-span-3 bg-gh-surface border border-gh-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gh-text mb-3 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-gh-accent" />
                  Review Summary
                </h3>
                <p className="text-sm text-gh-muted leading-relaxed mb-4">{review.summary}</p>

                {review.criticalFixes && review.criticalFixes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-severity-critical flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} />
                      Critical Fixes Required
                    </h4>
                    <ul className="space-y-1.5">
                      {review.criticalFixes.map((fix, i) => (
                        <li key={i} className="text-sm text-gh-muted pl-4 border-l-2 border-severity-critical/30">
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs: Issues / Security / Tests */}
            <div className="bg-gh-surface border border-gh-border rounded-lg overflow-hidden">
              <div className="flex border-b border-gh-border">
                {[
                  { id: 'issues' as const, label: 'Issues', count: review.issues?.length || 0, icon: AlertTriangle },
                  { id: 'security' as const, label: 'Security', count: review.securityIssues?.length || 0, icon: Shield },
                  { id: 'tests' as const, label: 'Suggested Tests', count: review.suggestedTests?.length || 0, icon: TestTube },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-gh-accent text-gh-accent'
                        : 'border-transparent text-gh-muted hover:text-gh-text'
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-gh-accent/15 text-gh-accent' : 'bg-gh-border text-gh-muted'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Issues Tab */}
                {activeTab === 'issues' && (
                  <div className="space-y-4">
                    {(!review.issues || review.issues.length === 0) ? (
                      <p className="text-sm text-gh-muted text-center py-8">No issues found — looking good! 🎉</p>
                    ) : (
                      review.issues.map((issue, i) => (
                        <div key={i} className="bg-gh-bg border border-gh-border rounded-lg p-4 animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3">
                              <SeverityBadge severity={issue.severity} />
                              <div>
                                <h4 className="text-sm font-medium text-gh-text">{issue.title}</h4>
                                <p className="text-xs text-gh-muted mt-0.5">
                                  {issue.file} • Line {issue.line} • {issue.type}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gh-muted mt-2">{issue.explanation}</p>
                          {issue.suggestedFix && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gh-accent">Suggested Fix</span>
                                <button
                                  onClick={() => copyFix(issue.suggestedFix, i)}
                                  className="flex items-center gap-1 text-xs text-gh-muted hover:text-gh-text transition-colors"
                                >
                                  {copiedFix === i ? <Check size={12} /> : <Copy size={12} />}
                                  {copiedFix === i ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <pre className="bg-gh-surface rounded p-3 text-xs text-gh-text overflow-x-auto border border-gh-border">
                                {issue.suggestedFix}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    {(!review.securityIssues || review.securityIssues.length === 0) ? (
                      <p className="text-sm text-gh-muted text-center py-8">No security vulnerabilities detected 🔒</p>
                    ) : (
                      review.securityIssues.map((issue, i) => (
                        <div key={i} className="bg-gh-bg border border-severity-critical/20 rounded-lg p-4 animate-slide-in">
                          <div className="flex items-start gap-3">
                            <Shield size={16} className="text-severity-critical mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-medium text-gh-text">{issue.vulnerability}</h4>
                              <p className="text-xs text-gh-muted mt-0.5">{issue.file} • Line {issue.line}</p>
                              <p className="text-sm text-gh-muted mt-2"><strong className="text-severity-high">Impact:</strong> {issue.impact}</p>
                              {issue.fix && (
                                <p className="text-sm text-gh-muted mt-1"><strong className="text-severity-low">Fix:</strong> {issue.fix}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tests Tab */}
                {activeTab === 'tests' && (
                  <div className="space-y-3">
                    {(!review.suggestedTests || review.suggestedTests.length === 0) ? (
                      <p className="text-sm text-gh-muted text-center py-8">No test suggestions</p>
                    ) : (
                      review.suggestedTests.map((test, i) => (
                        <div key={i} className="flex items-start gap-3 bg-gh-bg border border-gh-border rounded-lg p-4 animate-slide-in">
                          <TestTube size={16} className="text-severity-medium mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gh-muted">{test}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processing state */}
        {isProcessing && (
          <div className="bg-gh-surface border border-gh-border rounded-lg p-8 text-center animate-fade-in">
            <Loader2 size={32} className="animate-spin text-gh-accent mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gh-text mb-2">AI Agent is analyzing your PR...</h3>
            <p className="text-sm text-gh-muted">Watch the agent activity panel for real-time progress</p>
          </div>
        )}

        {/* Failed state */}
        {review?.status === 'failed' && (
          <div className="bg-gh-surface border border-severity-critical/30 rounded-lg p-8 text-center animate-fade-in">
            <AlertTriangle size={32} className="text-severity-critical mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gh-text mb-2">Review Failed</h3>
            <p className="text-sm text-gh-muted">Something went wrong during the analysis. Please try again.</p>
            <button
              onClick={() => router.push('/repositories')}
              className="mt-4 px-4 py-2 bg-gh-accent hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
