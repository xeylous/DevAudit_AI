const Review = require('../models/Review');
const { runPipeline } = require('../services/agentService');
const { parsePRUrl, postPRComment } = require('../services/githubService');

exports.startReview = async (req, res) => {
  try {
    const { prUrl } = req.body;
    const user = req.user;

    if (!prUrl) {
      return res.status(400).json({ error: 'PR URL is required' });
    }

    // Validate PR URL format
    let parsed;
    try {
      parsed = parsePRUrl(prUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid GitHub PR URL. Expected format: https://github.com/owner/repo/pull/123' });
    }

    // Check rate limit (free plan)
    if (user.plan && user.plan.type === 'free' && user.plan.reviewsUsed >= user.plan.limit) {
      return res.status(429).json({ error: 'Daily review limit reached. Upgrade to Pro for unlimited reviews.' });
    }

    // Create review record
    const review = await Review.create({
      userId: user._id,
      prUrl,
      prNumber: parsed.prNumber,
      repoFullName: `${parsed.owner}/${parsed.repo}`,
      status: 'pending'
    });

    // Increment usage
    user.plan.reviewsUsed = (user.plan.reviewsUsed || 0) + 1;
    await user.save();

    // Get io instance from app
    const io = req.app.get('io');
    const accessToken = user.getDecryptedToken();

    // Run pipeline async (don't await - it runs in background)
    runPipeline(review._id.toString(), user._id, prUrl, accessToken, io)
      .catch(err => console.error('Pipeline error for review', review._id, err.message));

    res.status(201).json({
      id: review._id,
      status: review.status,
      prUrl,
      prNumber: parsed.prNumber,
      repoFullName: `${parsed.owner}/${parsed.repo}`
    });
  } catch (error) {
    console.error('Start review error:', error);
    res.status(500).json({ error: 'Failed to start review' });
  }
};

exports.getReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-issues -securityIssues -files'),
      Review.countDocuments({ userId: req.user._id })
    ]);

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review history' });
  }
};

exports.postComment = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.status !== 'completed') {
      return res.status(400).json({ error: 'Review is not completed yet' });
    }

    const { owner, repo, prNumber } = parsePRUrl(review.prUrl);
    const accessToken = req.user.getDecryptedToken();

    // Format the review as a GitHub comment
    let comment = `## 🤖 DevAudit AI Review\n\n`;
    comment += `**Score: ${review.score}/100** ${review.score >= 70 ? '✅' : review.score >= 40 ? '⚠️' : '❌'}\n\n`;
    comment += `### Summary\n${review.summary}\n\n`;

    if (review.criticalFixes && review.criticalFixes.length > 0) {
      comment += `### 🔴 Critical Fixes Required\n`;
      review.criticalFixes.forEach((fix, i) => {
        comment += `${i + 1}. ${fix}\n`;
      });
      comment += '\n';
    }

    if (review.issues && review.issues.length > 0) {
      comment += `### Issues Found (${review.issues.length})\n\n`;
      comment += `| Severity | File | Line | Issue |\n|----------|------|------|-------|\n`;
      review.issues.slice(0, 15).forEach(issue => {
        const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : issue.severity === 'medium' ? '🔵' : '🟢';
        comment += `| ${icon} ${issue.severity} | \`${issue.file}\` | L${issue.line} | ${issue.title} |\n`;
      });
      comment += '\n';
    }

    if (review.securityIssues && review.securityIssues.length > 0) {
      comment += `### 🔒 Security Issues (${review.securityIssues.length})\n`;
      review.securityIssues.forEach(issue => {
        comment += `- **${issue.vulnerability}** in \`${issue.file}\`: ${issue.impact}\n`;
      });
      comment += '\n';
    }

    if (review.suggestedTests && review.suggestedTests.length > 0) {
      comment += `### 🧪 Suggested Tests\n`;
      review.suggestedTests.forEach((test, i) => {
        comment += `${i + 1}. ${test}\n`;
      });
      comment += '\n';
    }

    comment += `\n---\n*Reviewed by [DevAudit AI](https://github.com) • Score: ${review.score}/100*`;

    await postPRComment(owner, repo, prNumber, comment, accessToken);

    review.postedToGitHub = true;
    await review.save();

    res.json({ success: true, message: 'Review posted to GitHub PR' });
  } catch (error) {
    console.error('Post comment error:', error);
    res.status(500).json({ error: 'Failed to post comment to GitHub' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [totalReviews, completedReviews] = await Promise.all([
      Review.countDocuments({ userId }),
      Review.find({ userId, status: 'completed' })
    ]);

    let totalIssues = 0;
    let totalSecurityIssues = 0;
    let totalScore = 0;
    let scoredReviews = 0;

    completedReviews.forEach(r => {
      totalIssues += (r.issues ? r.issues.length : 0);
      totalSecurityIssues += (r.securityIssues ? r.securityIssues.length : 0);
      if (r.score > 0) {
        totalScore += r.score;
        scoredReviews++;
      }
    });

    res.json({
      totalReviews,
      issuesFound: totalIssues,
      securityFlags: totalSecurityIssues,
      avgScore: scoredReviews > 0 ? Math.round(totalScore / scoredReviews) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
