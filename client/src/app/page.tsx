'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { GithubIcon as Github } from '@/components/GithubIcon';
import {
  Shield,
  Search,
  Lightbulb,
  ArrowRight,
  GitPullRequest,
  Zap,
  Lock,
  CheckCircle2,
  Star,
  GitFork,
} from 'lucide-react';

export default function Landing() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <div className="min-h-screen bg-gh-bg relative overflow-hidden">
      <Navbar />

      {/* Animated gradient orbs */}
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />
      <div className="gradient-orb gradient-orb-3" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gh-border bg-gh-surface/50 text-sm text-gh-muted mb-8 animate-fade-in">
            <Zap size={14} className="text-gh-accent" />
            Powered by Gemini AI
            <span className="w-1.5 h-1.5 rounded-full bg-gh-accent animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gh-text leading-tight mb-6 animate-fade-in-up">
            Your AI Senior Engineer,{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-gh-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Available 24/7
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gh-muted max-w-3xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            DevAudit AI reviews every Pull Request like a 10x developer — catching bugs, security issues, 
            and code smells before they hit production.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <a
              href={`${apiUrl}/api/auth/github`}
              className="flex items-center gap-2 px-8 py-3.5 bg-gh-accent hover:bg-green-600 text-white rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-gh-accent/25 animate-glow"
            >
              <Github size={20} />
              Login with GitHub
              <ArrowRight size={18} />
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-8 py-3.5 border border-gh-border hover:border-gh-muted text-gh-text rounded-xl text-base font-medium transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 mt-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {[
              { label: 'PRs Reviewed', value: '10K+' },
              { label: 'Bugs Caught', value: '50K+' },
              { label: 'Developers', value: '2K+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gh-text">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gh-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gh-text mb-3">
              Intelligent Code Review
            </h2>
            <p className="text-gh-muted max-w-2xl mx-auto">
              Our multi-step AI agent doesn&apos;t just scan — it understands your code like a senior engineer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: 'Agentic Review',
                description: 'Multi-step analysis pipeline: parse, analyze per-file, security scan, and synthesize. Not a single-prompt hack.',
                color: 'text-severity-medium',
                borderColor: 'hover:border-severity-medium/30',
              },
              {
                icon: Lock,
                title: 'Security Scan',
                description: 'Deep security audit checking for SQL injection, XSS, hardcoded secrets, auth bypasses, and more.',
                color: 'text-severity-critical',
                borderColor: 'hover:border-severity-critical/30',
              },
              {
                icon: Lightbulb,
                title: 'Smart Suggestions',
                description: 'AI-generated fix suggestions, test cases, and a plain-English summary for every PR reviewed.',
                color: 'text-severity-high',
                borderColor: 'hover:border-severity-high/30',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`bg-gh-surface border border-gh-border rounded-xl p-6 transition-all duration-300 ${feature.borderColor} hover:transform hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gh-bg flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gh-text mb-2">{feature.title}</h3>
                <p className="text-sm text-gh-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gh-text mb-3">
              How It Works
            </h2>
            <p className="text-gh-muted">Three simple steps to AI-powered code reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: GitFork,
                title: 'Connect GitHub',
                description: 'Sign in with your GitHub account. We securely access your repositories.',
              },
              {
                step: '02',
                icon: GitPullRequest,
                title: 'Open a PR',
                description: 'Paste any PR URL or select from your open pull requests.',
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Get AI Review',
                description: 'Watch the AI agent analyze your code in real-time and receive detailed feedback.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="text-5xl font-extrabold text-gh-border/50 mb-4">{item.step}</div>
                <div className="w-14 h-14 rounded-full bg-gh-surface border border-gh-border flex items-center justify-center mx-auto mb-4">
                  <item.icon size={24} className="text-gh-accent" />
                </div>
                <h3 className="text-lg font-semibold text-gh-text mb-2">{item.title}</h3>
                <p className="text-sm text-gh-muted">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 -right-4 text-gh-border">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gh-surface border border-gh-border rounded-2xl p-8 sm:p-12">
            <Shield size={40} className="text-gh-accent mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gh-text mb-3">
              Ready to level up your code reviews?
            </h2>
            <p className="text-gh-muted mb-8">
              Join thousands of developers who trust DevAudit AI for their code quality.
            </p>
            <a
              href={`${apiUrl}/api/auth/github`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gh-accent hover:bg-green-600 text-white rounded-xl text-base font-semibold transition-all"
            >
              <Github size={20} />
              Get Started — Free
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gh-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-gh-accent" />
            <span className="text-sm font-semibold text-gh-text">DevAudit <span className="text-gh-accent">AI</span></span>
          </div>
          <p className="text-xs text-gh-muted">
            © {new Date().getFullYear()} DevAudit AI. Built with ❤️ and Gemini.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gh-muted hover:text-gh-text transition-colors">
              <Github size={18} />
            </a>
            <div className="flex items-center gap-1 text-gh-muted">
              <Star size={14} />
              <span className="text-xs">Star on GitHub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
