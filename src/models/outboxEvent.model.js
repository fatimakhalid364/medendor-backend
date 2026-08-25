const mongoose = require('mongoose');
const {eventOutboxStatusArray} = require('constants/enum');

const OutboxEventSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
        },

        payload: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },

        status: {
            type: String,
            required: true,
            enum: eventOutboxStatusArray,
            default: 'pending',
        },

        attempts: {
            type: Number,
            default: 0,
        },

        nextAttemptAt: {
            type: Date,
            default: null,
        },

        lastError: {
            type: String,
            default: null,
        },

        processedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Helps the worker efficiently find events that need processing.
OutboxEventSchema.index({
    status: 1,
    nextAttemptAt: 1,
    createdAt: 1,
});

module.exports = mongoose.model(
    'OutboxEvent',
    OutboxEventSchema
);