const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUserProfile, getUserEmails } = require('../services/githubService');

const JWT_SECRET = process.env.JWT_SECRET || 'devaudit_jwt_secret_2024';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

exports.githubOAuth = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
    scope: 'read:user user:email repo',
    state: Math.random().toString(36).substring(7)
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${CLIENT_URL}/auth/callback?error=no_code`);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback'
    }, {
      headers: { Accept: 'application/json' }
    });

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      return res.redirect(`${CLIENT_URL}/auth/callback?error=no_token`);
    }

    // Fetch user profile
    const profile = await getUserProfile(access_token);
    const email = await getUserEmails(access_token);

    // Upsert user in database
    let user = await User.findOne({ githubId: String(profile.id) });
    
    if (user) {
      user.username = profile.login;
      user.email = email || profile.email || '';
      user.avatarUrl = profile.avatar_url;
      user.accessToken = access_token;
      await user.save();
    } else {
      user = await User.create({
        githubId: String(profile.id),
        username: profile.login,
        email: email || profile.email || '',
        avatarUrl: profile.avatar_url,
        accessToken: access_token,
        plan: { type: 'free', reviewsUsed: 0, limit: 10 }
      });
    }

    // Sign JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error.message);
    res.redirect(`${CLIENT_URL}/auth/callback?error=oauth_failed`);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      githubId: user.githubId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
