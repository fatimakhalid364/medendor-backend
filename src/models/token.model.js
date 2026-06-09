const TokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    jti: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ['access', 'refresh'],
        required: true
    },

    revoked: {
        type: Boolean,
        default: false
    },

    ip: String,

    userAgent: String,

    expiresAt: {
        type: Date,
        required: true
    },

     absoluteExpiresAt: {
        type: Date,
        required: true
    }

}, {
    timestamps: true,
    strict: true,
    optimisticConcurrency: true
});