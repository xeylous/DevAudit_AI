const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  githubRepoId: { type: Number, required: true },
  fullName: { type: String, required: true },
  description: { type: String, default: '' },
  language: { type: String, default: '' },
  stars: { type: Number, default: 0 },
  isPrivate: { type: Boolean, default: false },
  updatedAt: { type: Date },
  lastReviewedAt: { type: Date }
});

repositorySchema.index({ userId: 1, githubRepoId: 1 }, { unique: true });

module.exports = mongoose.model('Repository', repositorySchema);
