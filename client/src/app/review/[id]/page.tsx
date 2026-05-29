'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AgentLogStream from '@/components/AgentLogStream';
import CodeDiffViewer from '@/components/CodeDiffViewer';
import ScoreGauge from '@/components/ScoreGauge';
import SeverityBadge from '@/components/SeverityBadge';
import Skeleton from '@/components/Skeleton';
import { FadeIn } from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { useSocket } from '@/hooks/useSocket';
import { useReview } from '@/hooks/useReview';
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
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Review } from '@/types';

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, setUser, token, agentLogs, clearAgentLogs } = useStore();
  const { getReview, postToGitHub } = useReview();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [copiedFix, setCopiedFix] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'security' | 'tests'>('issues');

  // Connect socket for this review
  useSocket(id);

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
      setPosted(true);
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
      <div className="min-h-screen bg-gh-bg">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <Skeleton variant="rect" height="60px" />
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2"><Skeleton variant="rect" height="400px" /></div>
              <div className="lg:col-span-3"><Skeleton variant="rect" height="400px" /></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gh-bg">
      <Sidebar />

      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <button
                onClick={() => router.back()}
                className="mt-1 p-2 hover:bg-gh-surface rounded-xl transition-all duration-200 active:scale-90"
              >
                <ArrowLeft size={18} className="text-gh-muted" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gh-text tracking-tight">
                  {review?.prTitle || `PR #${review?.prNumber}`}
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm text-gh-muted font-mono">{review?.repoFullName}</span>
                  {review?.prUrl && (
                    <a
                      href={review.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gh-accent hover:text-emerald-400 transition-colors font-medium"
                    >
                      <ExternalLink size={12} />
                      View on GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>

            {isCompleted && !review?.postedToGitHub && !posted && (
              <button
                onClick={handlePostToGitHub}
                disabled={posting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gh-accent hover:bg-gh-accent-hover text-white rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-glow-green active:scale-95"
              >
                {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Post to GitHub
              </button>
            )}
            {(review?.postedToGitHub || posted) && (
              <span className="flex items-center gap-2 px-5 py-2.5 bg-severity-low/10 text-severity-low rounded-xl text-sm font-medium border border-severity-low/20">
                <CheckCircle2 size={14} />
                Posted to GitHub
              </span>
            )}
          </div>
        </FadeIn>

        {/* Main content: Agent Logs + Code Diff */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          {/* Agent Log Stream - Left panel */}
          <FadeIn delay={100} className="lg:col-span-2">
            <AgentLogStream logs={agentLogs} isActive={isProcessing || false} />
          </FadeIn>

          {/* Code Diff Viewer - Right panel */}
          <FadeIn delay={200} className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-3">
              <FileCode size={18} className="text-gh-muted" />
              <h2 className="text-sm font-semibold text-gh-text">Changed Files</h2>
              {review?.files && (
                <span className="text-xs text-gh-muted bg-gh-bg px-2 py-0.5 rounded-full">
                  {review.files.length} files
                </span>
              )}
            </div>
            <CodeDiffViewer
              files={review?.files || []}
              issues={review?.issues || []}
            />
          </FadeIn>
        </div>

        {/* Results section - only show when completed */}
        {isCompleted && review && (
          <div className="space-y-6">
            {/* Score + Summary row */}
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Score Gauge */}
              <FadeIn delay={100}>
                <div className="bg-gh-surface border border-gh-border rounded-xl p-6 flex flex-col items-center justify-center">
                  <ScoreGauge score={review.score} />
                  {review.scoreReason && (
                    <p className="text-xs text-gh-muted text-center mt-4 max-w-[200px] leading-relaxed">
                      {review.scoreReason}
                    </p>
                  )}
                </div>
              </FadeIn>

              {/* Summary */}
              <FadeIn delay={200} className="lg:col-span-3">
                <div className="bg-gh-surface border border-gh-border rounded-xl p-6 h-full">
                  <h3 className="text-lg font-semibold text-gh-text mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-gh-accent" />
                    Review Summary
                  </h3>
                  <p className="text-sm text-gh-muted leading-relaxed mb-4">{review.summary}</p>

                  {review.criticalFixes && review.criticalFixes.length > 0 && (
                    <div className="bg-severity-critical/5 border border-severity-critical/10 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-severity-critical flex items-center gap-2 mb-3">
                        <AlertTriangle size={14} />
                        Critical Fixes Required
                      </h4>
                      <ul className="space-y-2">
                        {review.criticalFixes.map((fix, i) => (
                          <li key={i} className="text-sm text-gh-muted pl-4 border-l-2 border-severity-critical/30 leading-relaxed">
                            {fix}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </FadeIn>
            </div>

            {/* Tabs: Issues / Security / Tests */}
            <FadeIn delay={300}>
              <div className="bg-gh-surface border border-gh-border rounded-xl overflow-hidden">
                <div className="flex border-b border-gh-border">
                  {[
                    { id: 'issues' as const, label: 'Issues', count: review.issues?.length || 0, icon: AlertTriangle },
                    { id: 'security' as const, label: 'Security', count: review.securityIssues?.length || 0, icon: Shield },
                    { id: 'tests' as const, label: 'Suggested Tests', count: review.suggestedTests?.length || 0, icon: TestTube },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 border-b-2 ${
                        activeTab === tab.id
                          ? 'border-gh-accent text-gh-accent bg-gh-accent/5'
                          : 'border-transparent text-gh-muted hover:text-gh-text hover:bg-gh-bg/50'
                      }`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gh-accent/15 text-gh-accent'
                          : 'bg-gh-border text-gh-muted'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="p-6 tab-content-enter" key={activeTab}>
                  {/* Issues Tab */}
                  {activeTab === 'issues' && (
                    <div className="space-y-4">
                      {(!review.issues || review.issues.length === 0) ? (
                        <div className="text-center py-12">
                          <CheckCircle2 size={32} className="text-severity-low mx-auto mb-3 animate-bounce-in" />
                          <p className="text-sm text-gh-muted font-medium">No issues found — looking good! 🎉</p>
                        </div>
                      ) : (
                        review.issues.map((issue, i) => (
                          <div
                            key={i}
                            className="bg-gh-bg border border-gh-border rounded-xl p-4 transition-all duration-200 hover:border-gh-border-light"
                            style={{
                              animation: 'staggerFadeInUp 0.4s ease forwards',
                              animationDelay: `${i * 0.05}s`,
                              opacity: 0,
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start gap-3">
                                <SeverityBadge severity={issue.severity} />
                                <div>
                                  <h4 className="text-sm font-semibold text-gh-text">{issue.title}</h4>
                                  <p className="text-xs text-gh-muted mt-0.5 font-mono">
                                    {issue.file} • Line {issue.line} • {issue.type}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gh-muted mt-2 leading-relaxed">{issue.explanation}</p>
                            {issue.suggestedFix && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-semibold text-gh-accent flex items-center gap-1">
                                    <Sparkles size={10} />
                                    Suggested Fix
                                  </span>
                                  <button
                                    onClick={() => copyFix(issue.suggestedFix, i)}
                                    className="flex items-center gap-1 text-xs text-gh-muted hover:text-gh-accent transition-colors px-2 py-1 rounded-lg hover:bg-gh-surface"
                                  >
                                    {copiedFix === i ? (
                                      <><Check size={12} className="text-severity-low" /> Copied!</>
                                    ) : (
                                      <><Copy size={12} /> Copy</>
                                    )}
                                  </button>
                                </div>
                                <pre className="bg-gh-surface rounded-xl p-3 text-xs text-gh-text overflow-x-auto border border-gh-border font-mono leading-relaxed">
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
                        <div className="text-center py-12">
                          <Shield size={32} className="text-severity-low mx-auto mb-3 animate-bounce-in" />
                          <p className="text-sm text-gh-muted font-medium">No security vulnerabilities detected 🔒</p>
                        </div>
                      ) : (
                        review.securityIssues.map((issue, i) => (
                          <div
                            key={i}
                            className="bg-gh-bg border border-severity-critical/15 rounded-xl p-4 hover:border-severity-critical/30 transition-all duration-200"
                            style={{
                              animation: 'staggerFadeInUp 0.4s ease forwards',
                              animationDelay: `${i * 0.05}s`,
                              opacity: 0,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-severity-critical/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Shield size={16} className="text-severity-critical" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gh-text">{issue.vulnerability}</h4>
                                <p className="text-xs text-gh-muted mt-0.5 font-mono">{issue.file} • Line {issue.line}</p>
                                <p className="text-sm text-gh-muted mt-2 leading-relaxed">
                                  <strong className="text-severity-high font-semibold">Impact:</strong> {issue.impact}
                                </p>
                                {issue.fix && (
                                  <p className="text-sm text-gh-muted mt-1 leading-relaxed">
                                    <strong className="text-severity-low font-semibold">Fix:</strong> {issue.fix}
                                  </p>
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
                        <div className="text-center py-12">
                          <TestTube size={32} className="text-gh-muted mx-auto mb-3 animate-bounce-in" />
                          <p className="text-sm text-gh-muted font-medium">No test suggestions</p>
                        </div>
                      ) : (
                        review.suggestedTests.map((test, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 bg-gh-bg border border-gh-border rounded-xl p-4 hover:border-gh-border-light transition-all duration-200"
                            style={{
                              animation: 'staggerFadeInUp 0.4s ease forwards',
                              animationDelay: `${i * 0.05}s`,
                              opacity: 0,
                            }}
                          >
                            <div className="w-8 h-8 rounded-lg bg-severity-medium/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <TestTube size={16} className="text-severity-medium" />
                            </div>
                            <p className="text-sm text-gh-muted leading-relaxed">{test}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        )}

        {/* Processing state */}
        {isProcessing && (
          <FadeIn>
            <div className="bg-gh-surface border border-gh-border rounded-xl p-10 text-center">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full border-2 border-gh-border" />
                <div className="absolute inset-0 rounded-full border-2 border-gh-accent border-t-transparent processing-orbit" />
                <div className="absolute inset-2 rounded-full border-2 border-severity-medium border-b-transparent processing-orbit" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={20} className="text-gh-accent" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gh-text mb-2">AI Agent is analyzing your PR...</h3>
              <p className="text-sm text-gh-muted max-w-md mx-auto leading-relaxed">
                Watch the agent activity panel for real-time progress. This usually takes 30-60 seconds.
              </p>
            </div>
          </FadeIn>
        )}

        {/* Failed state */}
        {review?.status === 'failed' && (
          <FadeIn>
            <div className="bg-gh-surface border border-severity-critical/20 rounded-xl p-10 text-center animate-shake">
              <div className="w-16 h-16 rounded-2xl bg-severity-critical/10 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={28} className="text-severity-critical" />
              </div>
              <h3 className="text-lg font-semibold text-gh-text mb-2">Review Failed</h3>
              <p className="text-sm text-gh-muted mb-6 max-w-md mx-auto leading-relaxed">
                Something went wrong during the analysis. This can happen due to rate limits or network issues. Please try again.
              </p>
              <button
                onClick={() => router.push('/repositories')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gh-accent hover:bg-gh-accent-hover text-white rounded-xl text-sm font-medium transition-all duration-200 active:scale-95"
              >
                <RotateCcw size={14} />
                Try Again
              </button>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
