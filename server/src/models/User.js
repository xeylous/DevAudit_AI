const mongoose = require('mongoose');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8').slice(0, 32), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return text;
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8').slice(0, 32), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  accessToken: { type: String, required: true },
  plan: {
    type: { type: String, enum: ['free', 'pro'], default: 'free' },
    reviewsUsed: { type: Number, default: 0 },
    limit: { type: Number, default: 10 }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function () {
  if (this.isModified('accessToken') && this.accessToken && !this.accessToken.includes(':')) {
    this.accessToken = encrypt(this.accessToken);
  }
});

userSchema.methods.getDecryptedToken = function () {
  return decrypt(this.accessToken);
};

module.exports = mongoose.model('User', userSchema);
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
