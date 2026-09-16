const mongoose = require('mongoose');
const {
    healthInterestsSchema,
    privacyPreferencesSchema,
    finalTouchesSchema
} = require('models/profileChunks/patient');

const patientSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    basicProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'BasicProfile', required: true },
    healthInterests: healthInterestsSchema,
    joinedCommunities: {
        type: [String],
        default: [],
    },
    privacyPreferences: privacyPreferencesSchema,
    finalTouches: finalTouchesSchema,

}, { timestamps: true, strict: true, optimisticConcurrency: true });


patientSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Patient', patientSchema);
