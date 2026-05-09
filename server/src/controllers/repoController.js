const { getUserRepos, getOpenPRs } = require('../services/githubService');
const Repository = require('../models/Repository');

exports.listRepos = async (req, res) => {
  try {
    const accessToken = req.user.getDecryptedToken();
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';

    const repos = await getUserRepos(accessToken, page, 30);

    // Cache repos in DB
    for (const repo of repos) {
      await Repository.findOneAndUpdate(
        { userId: req.user._id, githubRepoId: repo.id },
        {
          userId: req.user._id,
          githubRepoId: repo.id,
          fullName: repo.full_name,
          description: repo.description || '',
          language: repo.language || '',
          stars: repo.stargazers_count || 0,
          isPrivate: repo.private,
          updatedAt: repo.updated_at
        },
        { upsert: true, new: true }
      );
    }

    let formattedRepos = repos.map(repo => ({
      id: repo.id,
      fullName: repo.full_name,
      name: repo.name,
      description: repo.description || '',
      language: repo.language || '',
      stars: repo.stargazers_count || 0,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
      defaultBranch: repo.default_branch,
      openIssuesCount: repo.open_issues_count
    }));

    // Apply search filter
    if (search) {
      formattedRepos = formattedRepos.filter(r =>
        r.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    res.json({ repos: formattedRepos });
  } catch (error) {
    console.error('List repos error:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

exports.listPRs = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const accessToken = req.user.getDecryptedToken();

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid repository path' });
    }

    const prs = await getOpenPRs(owner, repo, accessToken);

    const formattedPRs = prs.map(pr => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      user: pr.user.login,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      url: pr.html_url
    }));

    res.json({ prs: formattedPRs });
  } catch (error) {
    console.error('List PRs error:', error.message);
    res.status(500).json({ error: 'Failed to fetch pull requests' });
  }
};
