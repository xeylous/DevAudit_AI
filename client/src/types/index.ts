export interface User {
  id: string;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  plan: {
    type: 'free' | 'pro';
    reviewsUsed: number;
    limit: number;
  };
  createdAt: string;
}

export interface AgentStep {
  step: string;
  status: 'pending' | 'running' | 'done' | 'error';
  message: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Issue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'bug' | 'security' | 'style' | 'performance' | 'error-handling';
  title: string;
  explanation: string;
  suggestedFix: string;
}

export interface SecurityIssue {
  file: string;
  line: number;
  vulnerability: string;
  impact: string;
  fix: string;
}

export interface ReviewFile {
  filename: string;
  language: string;
  additions: number;
  deletions: number;
  chunks: { lineStart: number; code: string }[];
}

export interface Review {
  _id: string;
  userId: string;
  repoFullName: string;
  prUrl: string;
  prTitle: string;
  prNumber: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  agentSteps: AgentStep[];
  files: ReviewFile[];
  issues: Issue[];
  securityIssues: SecurityIssue[];
  summary: string;
  criticalFixes: string[];
  score: number;
  scoreReason: string;
  suggestedTests: string[];
  postedToGitHub: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Repo {
  id: number;
  fullName: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  isPrivate: boolean;
  updatedAt: string;
  defaultBranch: string;
  openIssuesCount: number;
}

export interface PR {
  number: number;
  title: string;
  state: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface DashboardStats {
  totalReviews: number;
  issuesFound: number;
  securityFlags: number;
  avgScore: number;
}

export interface AgentLog {
  step: string;
  message: string;
  status: 'running' | 'done' | 'error';
  timestamp: Date;
}
