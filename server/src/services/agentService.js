const { callGemini } = require('./geminiService');
const { getPRDiff, getPRDetails, getPRFiles, parsePRUrl } = require('./githubService');
const Review = require('../models/Review');

function emitStep(io, reviewId, step, message, status) {
  io.to(`review:${reviewId}`).emit('agent-step', { step, message, status });
}

async function updateReviewStep(review, stepName, status, message) {
  const stepIndex = review.agentSteps.findIndex(s => s.step === stepName);
  if (stepIndex >= 0) {
    review.agentSteps[stepIndex].status = status;
    review.agentSteps[stepIndex].message = message || '';
    if (status === 'running') review.agentSteps[stepIndex].startedAt = new Date();
    if (status === 'done' || status === 'error') review.agentSteps[stepIndex].completedAt = new Date();
  }
  await review.save();
}

async function runPipeline(reviewId, userId, prUrl, accessToken, io) {
  let review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');

  try {
    review.status = 'processing';
    review.agentSteps = [
      { step: 'parse', status: 'pending' },
      { step: 'analyze', status: 'pending' },
      { step: 'security', status: 'pending' },
      { step: 'synthesis', status: 'pending' },
      { step: 'complete', status: 'pending' }
    ];
    await review.save();

    const { owner, repo, prNumber } = parsePRUrl(prUrl);

    // ===== STEP 1: FETCH & PARSE =====
    emitStep(io, reviewId, 'parse', '⚙ Fetching PR diff from GitHub...', 'running');
    await updateReviewStep(review, 'parse', 'running');

    let prDetails, diff, prFiles;
    try {
      [prDetails, diff, prFiles] = await Promise.all([
        getPRDetails(owner, repo, prNumber, accessToken),
        getPRDiff(owner, repo, prNumber, accessToken),
        getPRFiles(owner, repo, prNumber, accessToken)
      ]);
    } catch (err) {
      throw new Error(`Failed to fetch PR from GitHub: ${err.message}`);
    }

    review.prTitle = prDetails.title || `PR #${prNumber}`;
    review.prNumber = prNumber;
    review.repoFullName = `${owner}/${repo}`;
    await review.save();

    // Parse diff with Gemini
    emitStep(io, reviewId, 'parse', '🧠 Parsing PR diff structure...', 'running');

    const truncatedDiff = diff.length > 15000 ? diff.substring(0, 15000) + '\n... (truncated)' : diff;

    const parseResult = await callGemini(`
You are a code review tool. Parse this git diff and return a JSON object.

Git Diff:
\`\`\`
${truncatedDiff}
\`\`\`

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "files": [
    {
      "filename": "path/to/file.js",
      "language": "javascript",
      "additions": 10,
      "deletions": 5,
      "chunks": [
        { "lineStart": 1, "code": "the changed code here" }
      ]
    }
  ]
}
`);

    let parsedFiles = [];
    if (parseResult && parseResult.files) {
      parsedFiles = parseResult.files;
    } else if (prFiles && prFiles.length > 0) {
      // Fallback: use GitHub API file data
      parsedFiles = prFiles.map(f => ({
        filename: f.filename,
        language: f.filename.split('.').pop() || 'unknown',
        additions: f.additions || 0,
        deletions: f.deletions || 0,
        chunks: [{ lineStart: 1, code: f.patch || '' }]
      }));
    }

    review.files = parsedFiles;
    await review.save();

    emitStep(io, reviewId, 'parse', '✅ PR diff parsed successfully', 'done');
    await updateReviewStep(review, 'parse', 'done');

    // ===== STEP 2: PER-FILE ANALYSIS =====
    emitStep(io, reviewId, 'analyze', '🔍 Analyzing code changes file by file...', 'running');
    await updateReviewStep(review, 'analyze', 'running');

    let allIssues = [];
    const filesToAnalyze = parsedFiles.slice(0, 8); // Limit to 8 files to avoid rate limits

    for (let i = 0; i < filesToAnalyze.length; i++) {
      const file = filesToAnalyze[i];
      emitStep(io, reviewId, 'analyze', `🧠 Analyzing file: ${file.filename} (${i + 1}/${filesToAnalyze.length})...`, 'running');

      try {
        const codeContent = file.chunks?.map(c => c.code).join('\n') || '';
        if (!codeContent.trim()) continue;

        const truncatedCode = codeContent.length > 5000 ? codeContent.substring(0, 5000) + '\n... (truncated)' : codeContent;

        const analysisResult = await callGemini(`
You are a senior software engineer doing a thorough code review.
File: ${file.filename} | Language: ${file.language}

Changed code:
\`\`\`
${truncatedCode}
\`\`\`

Analyze for: bugs, security vulnerabilities, performance issues, code smells, missing error handling.
Return ONLY valid JSON (no markdown, no explanation):
{
  "issues": [
    {
      "line": 10,
      "severity": "high",
      "type": "bug",
      "title": "Issue title",
      "explanation": "Detailed explanation",
      "suggestedFix": "How to fix it"
    }
  ]
}

severity must be one of: critical, high, medium, low
type must be one of: bug, security, style, performance, error-handling
If no issues found, return: { "issues": [] }
`);

        if (analysisResult && analysisResult.issues) {
          const fileIssues = analysisResult.issues.map(issue => ({
            ...issue,
            file: file.filename
          }));
          allIssues.push(...fileIssues);

          io.to(`review:${reviewId}`).emit('review-file', {
            filename: file.filename,
            issues: fileIssues
          });
        }
      } catch (err) {
        console.error(`Error analyzing file ${file.filename}:`, err.message);
      }
    }

    review.issues = allIssues;
    await review.save();

    emitStep(io, reviewId, 'analyze', `✅ Analyzed ${filesToAnalyze.length} files, found ${allIssues.length} issues`, 'done');
    await updateReviewStep(review, 'analyze', 'done');

    // ===== STEP 3: SECURITY DEEP SCAN =====
    emitStep(io, reviewId, 'security', '🔒 Running security deep scan...', 'running');
    await updateReviewStep(review, 'security', 'running');

    let securityIssues = [];
    try {
      const allCode = parsedFiles.slice(0, 5).map(f => 
        `File: ${f.filename}\n${f.chunks?.map(c => c.code).join('\n') || ''}`
      ).join('\n\n---\n\n');

      const truncatedAllCode = allCode.length > 10000 ? allCode.substring(0, 10000) + '\n... (truncated)' : allCode;

      const securityResult = await callGemini(`
Security audit mode. You are a security expert.
Given these code changes, check for:
- SQL injection
- XSS vulnerabilities
- Hardcoded secrets/credentials
- Insecure dependencies
- Authentication/authorization bypasses
- Input validation gaps
- Path traversal
- Sensitive data exposure

Code changes:
\`\`\`
${truncatedAllCode}
\`\`\`

Return ONLY valid JSON (no markdown):
{
  "securityIssues": [
    {
      "file": "filename.js",
      "line": 10,
      "vulnerability": "Name of vulnerability",
      "impact": "What could go wrong",
      "fix": "How to fix"
    }
  ]
}
If no security issues found, return: { "securityIssues": [] }
`);

      if (securityResult && securityResult.securityIssues) {
        securityIssues = securityResult.securityIssues;
      }
    } catch (err) {
      console.error('Security scan error:', err.message);
    }

    review.securityIssues = securityIssues;
    await review.save();

    emitStep(io, reviewId, 'security', `✅ Security scan complete, found ${securityIssues.length} vulnerabilities`, 'done');
    await updateReviewStep(review, 'security', 'done');

    // ===== STEP 4: SYNTHESIS =====
    emitStep(io, reviewId, 'synthesis', '📊 Generating final review summary...', 'running');
    await updateReviewStep(review, 'synthesis', 'running');

    try {
      const issuesSummary = allIssues.slice(0, 20).map(i => 
        `- [${i.severity}] ${i.file}:${i.line} - ${i.title}`
      ).join('\n');

      const fileList = parsedFiles.map(f => f.filename).join(', ');

      const synthesisResult = await callGemini(`
You are a tech lead writing a PR review.

Issues found:
${issuesSummary || 'No issues found'}

Security issues: ${securityIssues.length}
Files changed: ${fileList}
Total issues: ${allIssues.length}

Write a comprehensive review. Return ONLY valid JSON:
{
  "summary": "A 2-3 sentence PR summary for a non-technical manager",
  "criticalFixes": ["Top 3 most critical things to fix"],
  "score": 75,
  "scoreReason": "Reasoning for the score (1-2 sentences)",
  "suggestedTests": ["2-3 suggested test cases for the most critical changes"]
}

Score should be 0-100 where:
- 90-100: Excellent, ready to merge
- 70-89: Good, minor issues
- 40-69: Needs work, moderate issues
- 0-39: Critical issues, do not merge
`);

      if (synthesisResult && !synthesisResult.rawText) {
        review.summary = synthesisResult.summary || 'Review completed.';
        review.criticalFixes = synthesisResult.criticalFixes || [];
        review.score = Math.min(100, Math.max(0, synthesisResult.score || 50));
        review.scoreReason = synthesisResult.scoreReason || '';
        review.suggestedTests = synthesisResult.suggestedTests || [];
      } else {
        review.summary = 'Review completed. Please check the individual file analysis for details.';
        review.score = allIssues.length === 0 ? 85 : Math.max(20, 85 - (allIssues.length * 5));
        review.scoreReason = `Found ${allIssues.length} issues across ${parsedFiles.length} files.`;
        review.criticalFixes = allIssues.filter(i => i.severity === 'critical' || i.severity === 'high').slice(0, 3).map(i => i.title);
        review.suggestedTests = ['Add unit tests for the changed functions', 'Test edge cases for input validation'];
      }
    } catch (err) {
      console.error('Synthesis error:', err.message);
      review.summary = 'Review completed with some analysis steps.';
      review.score = 50;
      review.scoreReason = 'Some analysis steps encountered errors.';
    }

    await review.save();

    emitStep(io, reviewId, 'synthesis', `✅ Final score: ${review.score}/100`, 'done');
    await updateReviewStep(review, 'synthesis', 'done');

    // ===== STEP 5: COMPLETE =====
    review.status = 'completed';
    review.completedAt = new Date();
    await updateReviewStep(review, 'complete', 'done');
    await review.save();

    emitStep(io, reviewId, 'complete', '🎉 Review complete!', 'done');

    io.to(`review:${reviewId}`).emit('review-done', {
      reviewId: review._id,
      score: review.score,
      summary: review.summary,
      issueCount: review.issues.length,
      securityIssueCount: review.securityIssues.length
    });

    return review;

  } catch (error) {
    console.error('Pipeline error:', error);
    review.status = 'failed';
    await review.save();
    
    emitStep(io, reviewId, 'error', `❌ Review failed: ${error.message}`, 'error');
    io.to(`review:${reviewId}`).emit('review-error', { message: error.message });
    
    throw error;
  }
}

module.exports = { runPipeline };
