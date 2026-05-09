const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/start', authMiddleware, reviewController.startReview);
router.get('/stats', authMiddleware, reviewController.getDashboardStats);
router.get('/history', authMiddleware, reviewController.getHistory);
router.get('/:id', authMiddleware, reviewController.getReview);
router.post('/:id/post-comment', authMiddleware, reviewController.postComment);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
