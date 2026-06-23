const mongoose = require('mongoose');
const {
    healthInterestsModel: {healthInterestsSchema},
    privacyPreferencesModel: {privacyPreferencesSchema},
    finalTouchesModel: {finalTouchesSchema}} = require('models/profileSubModels/patient');

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

}, { timestamps: true });


patientSchema.index({ user: 1 });

module.exports = mongoose.model('Patient', patientSchema);
