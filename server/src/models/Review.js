const mongoose = require('mongoose');

const agentStepSchema = new mongoose.Schema({
  step: { type: String, required: true },
  status: { type: String, enum: ['pending', 'running', 'done', 'error'], default: 'pending' },
  message: { type: String, default: '' },
  startedAt: { type: Date },
  completedAt: { type: Date }
}, { _id: false });

const issueSchema = new mongoose.Schema({
  file: { type: String, required: true },
  line: { type: Number, default: 0 },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  type: { type: String, enum: ['bug', 'security', 'style', 'performance', 'error-handling'], default: 'bug' },
  title: { type: String, required: true },
  explanation: { type: String, default: '' },
  suggestedFix: { type: String, default: '' }
}, { _id: false });

const securityIssueSchema = new mongoose.Schema({
  file: { type: String, required: true },
  line: { type: Number, default: 0 },
  vulnerability: { type: String, required: true },
  impact: { type: String, default: '' },
  fix: { type: String, default: '' }
}, { _id: false });

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  language: { type: String, default: '' },
  additions: { type: Number, default: 0 },
  deletions: { type: Number, default: 0 },
  chunks: [{ lineStart: Number, code: String }]
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repoFullName: { type: String, default: '' },
  prUrl: { type: String, required: true },
  prTitle: { type: String, default: '' },
  prNumber: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  agentSteps: [agentStepSchema],
  files: [fileSchema],
  issues: [issueSchema],
  securityIssues: [securityIssueSchema],
  summary: { type: String, default: '' },
  criticalFixes: [{ type: String }],
  score: { type: Number, default: 0 },
  scoreReason: { type: String, default: '' },
  suggestedTests: [{ type: String }],
  postedToGitHub: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Review', reviewSchema);
