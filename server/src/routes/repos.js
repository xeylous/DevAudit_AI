const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, repoController.listRepos);
router.get('/:owner/:repo/prs', authMiddleware, repoController.listPRs);

module.exports = router;
