const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/github', authController.githubOAuth);
router.get('/github/callback', authController.githubCallback);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
