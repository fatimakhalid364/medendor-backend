const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    jti: String,
    type: { type: String, enum: ['access', 'refresh'] },
    ip: String,
    userAgent: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
}, { timestamps: true, strict: true, optimisticConcurrency: true });

module.exports = mongoose.model('Token', TokenSchema);