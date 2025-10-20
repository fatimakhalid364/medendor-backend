const mongoose = require('mongoose');
const { enum: { genderArray } } = require('constants');

const basicProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gender: { type: String, trim: true, enum: genderArray },
    age: { type: Number, min: 25 },
    profilePicture: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    languagesSpoken: { type: [String], default: [] },
    followerCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },
}, { timestamps: true, strict: true, optimisticConcurrency: true });

basicProfileSchema.index({ user: 1 });

module.exports = mongoose.model('BasicProfile', basicProfileSchema);
