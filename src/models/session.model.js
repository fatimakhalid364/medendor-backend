const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        refreshTokenHash: {
            type: String,
            required: true,
        },

        refreshJti: {
            type: String,
            required: true,
        },

        csrfTokenHash: {
            type: String,
            required: true,
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },

        lastActivityAt: {
            type: Date,
            default: Date.now,
        },

        // Current sliding expiry.
        expiresAt: {
            type: Date,
            required: true,
        },

        // Hard maximum lifetime.
        absoluteExpiresAt: {
            type: Date,
            required: true,
        },

        // null = active
        // Date = revoked
        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

sessionSchema.index({
    user: 1,
    revokedAt: 1,
});

module.exports = mongoose.model('Session', sessionSchema);