'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import AnimatedCounter from '@/components/AnimatedCounter';
import { FadeIn } from '@/components/PageTransition';
import { GithubIcon as Github } from '@/components/GithubIcon';
import {
  Shield,
  Lightbulb,
  ArrowRight,
  GitPullRequest,
  Zap,
  Lock,
  CheckCircle2,
  Star,
  GitFork,
  Brain,
} from 'lucide-react';

export default function Landing() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax orbs
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="min-h-screen bg-gh-bg relative overflow-hidden">
      <Navbar />

      {/* Animated gradient orbs with parallax */}
      <div
        className="gradient-orb gradient-orb-1"
        style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
      />
      <div
        className="gradient-orb gradient-orb-2"
        style={{ transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)` }}
      />
      <div
        className="gradient-orb gradient-orb-3"
        style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gh-border bg-gh-surface/50 text-sm text-gh-muted mb-8 backdrop-blur-sm">
              <Zap size={14} className="text-gh-accent" />
              <span>Powered by Gemini AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gh-accent animate-pulse" />
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={200}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gh-text leading-[1.1] mb-6 tracking-tight">
              Your AI Senior Engineer,{' '}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-gh-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Available 24/7
              </span>
            </h1>
          </FadeIn>

          {/* Subheadline */}
          <FadeIn delay={300}>
            <p className="text-lg sm:text-xl text-gh-muted max-w-3xl mx-auto mb-10 leading-relaxed">
              DevAudit AI reviews every Pull Request like a 10x developer — catching bugs, security issues,
              and code smells before they hit production.
            </p>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`${apiUrl}/api/auth/github`}
                className="relative flex items-center gap-2 px-8 py-3.5 bg-gh-accent hover:bg-gh-accent-hover text-white rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-glow-green active:scale-95 pulse-ring overflow-hidden group"
              >
                <Github size={20} />
                <span>Login with GitHub</span>
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 px-8 py-3.5 border border-gh-border hover:border-gh-muted text-gh-text rounded-xl text-base font-medium transition-all duration-200 hover:bg-gh-surface/50 active:scale-95"
              >
                See How It Works
              </a>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={500}>
            <div className="flex items-center justify-center gap-8 sm:gap-16 mt-20">
              {[
                { label: 'PRs Reviewed', value: 10000, suffix: '+' },
                { label: 'Bugs Caught', value: 50000, suffix: '+' },
                { label: 'Developers', value: 2000, suffix: '+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="text-2xl sm:text-4xl font-bold text-gh-text tracking-tight">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} duration={2000} />
                  </div>
                  <div className="text-xs sm:text-sm text-gh-muted mt-1.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gh-text mb-4 tracking-tight">
                Intelligent Code Review
              </h2>
              <p className="text-gh-muted max-w-2xl mx-auto leading-relaxed">
                Our multi-step AI agent doesn&apos;t just scan — it understands your code like a senior engineer.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Agentic Review',
                description: 'Multi-step analysis pipeline: parse, analyze per-file, security scan, and synthesize. Not a single-prompt hack.',
                color: 'text-severity-medium',
                glowColor: 'hover:shadow-glow-blue',
                borderColor: 'hover:border-severity-medium/30',
              },
              {
                icon: Lock,
                title: 'Security Scan',
                description: 'Deep security audit checking for SQL injection, XSS, hardcoded secrets, auth bypasses, and more.',
                color: 'text-severity-critical',
                glowColor: 'hover:shadow-glow-red',
                borderColor: 'hover:border-severity-critical/30',
              },
              {
                icon: Lightbulb,
                title: 'Smart Suggestions',
                description: 'AI-generated fix suggestions, test cases, and a plain-English summary for every PR reviewed.',
                color: 'text-severity-high',
                glowColor: 'hover:shadow-glow-yellow',
                borderColor: 'hover:border-severity-high/30',
              },
            ].map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 120} direction="up">
                <div
                  className={`bg-gh-surface border border-gh-border rounded-xl p-6 transition-all duration-400 ${feature.borderColor} ${feature.glowColor} card-hover group`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gh-bg border border-gh-border flex items-center justify-center mb-5 ${feature.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gh-text mb-2">{feature.title}</h3>
                  <p className="text-sm text-gh-muted leading-relaxed">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gh-text mb-4 tracking-tight">
                How It Works
              </h2>
              <p className="text-gh-muted">Three simple steps to AI-powered code reviews</p>
            </div>
          </FadeIn>

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
              <FadeIn key={item.step} delay={index * 150} direction="up">
                <div className="relative text-center group">
                  <div className="text-6xl font-black text-gh-border/30 mb-4 transition-colors duration-300 group-hover:text-gh-accent/20">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gh-surface border border-gh-border flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:scale-110 group-hover:border-gh-accent/30 group-hover:shadow-glow-green">
                    <item.icon size={26} className="text-gh-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-gh-text mb-2">{item.title}</h3>
                  <p className="text-sm text-gh-muted leading-relaxed">{item.description}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-20 -right-4 text-gh-border/40">
                      <ArrowRight size={20} />
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Tech Strip */}
      <section className="relative py-12 px-4 border-y border-gh-border/30">
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gh-muted uppercase tracking-widest mb-6 font-medium">Built with modern technology</p>
            <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-40">
              {['React', 'Next.js', 'Node.js', 'Gemini AI', 'GitHub API', 'MongoDB'].map((tech) => (
                <span key={tech} className="text-sm font-semibold text-gh-text tracking-wide">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gh-surface border border-gh-border rounded-2xl p-8 sm:p-12 relative overflow-hidden">
              {/* Background accent glow */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gh-accent rounded-full blur-[100px]" />
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gh-accent/10 border border-gh-accent/20 flex items-center justify-center mx-auto mb-6">
                  <Shield size={32} className="text-gh-accent" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gh-text mb-4 tracking-tight">
                  Ready to level up your code reviews?
                </h2>
                <p className="text-gh-muted mb-8 max-w-md mx-auto leading-relaxed">
                  Join thousands of developers who trust DevAudit AI for their code quality.
                </p>
                <a
                  href={`${apiUrl}/api/auth/github`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gh-accent hover:bg-gh-accent-hover text-white rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-glow-green active:scale-95"
                >
                  <Github size={20} />
                  Get Started — Free
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-gh-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gh-accent rounded-md flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gh-text">
              DevAudit <span className="text-gh-accent">AI</span>
            </span>
          </div>
          <p className="text-xs text-gh-muted">
            © {new Date().getFullYear()} DevAudit AI. Built with ❤️ and Gemini.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gh-muted hover:text-gh-text transition-colors">
              <Github size={18} />
            </a>
            <div className="flex items-center gap-1 text-gh-muted hover:text-gh-text transition-colors cursor-pointer">
              <Star size={14} />
              <span className="text-xs font-medium">Star on GitHub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
