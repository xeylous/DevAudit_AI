const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

async function getUserProfile(accessToken) {
  const { data } = await axios.get(`${GITHUB_API}/user`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
  });
  return data;
}

async function getUserEmails(accessToken) {
  try {
    const { data } = await axios.get(`${GITHUB_API}/user/emails`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    });
    const primary = data.find(e => e.primary) || data[0];
    return primary ? primary.email : '';
  } catch {
    return '';
  }
}

async function getUserRepos(accessToken, page = 1, perPage = 30) {
  const { data } = await axios.get(`${GITHUB_API}/user/repos`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    params: { page, per_page: perPage, sort: 'updated', direction: 'desc', type: 'all' }
  });
  return data;
}

async function getOpenPRs(owner, repo, accessToken) {
  const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/pulls`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    params: { state: 'open', per_page: 30 }
  });
  return data;
}

async function getPRDetails(owner, repo, prNumber, accessToken) {
  const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
  });
  return data;
}

async function getPRDiff(owner, repo, prNumber, accessToken) {
  const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3.diff'
    }
  });
  return data;
}

async function getPRFiles(owner, repo, prNumber, accessToken) {
  const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    params: { per_page: 100 }
  });
  return data;
}

async function postPRComment(owner, repo, prNumber, body, accessToken) {
  const { data } = await axios.post(
    `${GITHUB_API}/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    { body },
    { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
  );
  return data;
}

function parsePRUrl(prUrl) {
  // https://github.com/owner/repo/pull/42
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) throw new Error('Invalid GitHub PR URL');
  return { owner: match[1], repo: match[2], prNumber: parseInt(match[3], 10) };
}

module.exports = {
  getUserProfile,
  getUserEmails,
  getUserRepos,
  getOpenPRs,
  getPRDetails,
  getPRDiff,
  getPRFiles,
  postPRComment,
  parsePRUrl
};
