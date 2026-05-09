const { runPipeline } = require('../services/agentService');

let reviewQueue = null;

function initQueue(io) {
  // Only use Bull/Redis if REDIS_URL is configured
  // Otherwise, fall back to direct execution (for simpler local dev)
  if (process.env.REDIS_URL) {
    try {
      const Bull = require('bull');
      reviewQueue = new Bull('review-processing', process.env.REDIS_URL, {
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 1
        }
      });

      reviewQueue.process(2, async (job) => {
        const { reviewId, userId, prUrl, accessToken } = job.data;
        return await runPipeline(reviewId, userId, prUrl, accessToken, io);
      });

      reviewQueue.on('failed', (job, err) => {
        console.error(`Job ${job.id} failed:`, err.message);
      });

      console.log('✅ Bull queue initialized with Redis');
    } catch (err) {
      console.warn('⚠️ Redis not available, using direct execution:', err.message);
      reviewQueue = null;
    }
  } else {
    console.log('ℹ️ No REDIS_URL configured, reviews will run directly (no queue)');
  }
}

async function addReviewJob(data) {
  if (reviewQueue) {
    return await reviewQueue.add(data);
  }
  // Direct execution fallback (no Redis needed)
  return null;
}

module.exports = { initQueue, addReviewJob };
