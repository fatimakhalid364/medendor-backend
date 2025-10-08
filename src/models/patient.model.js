const mongoose = require('mongoose');
const {
    healthInterestsModel: {healthInterestsSchema},
    privacyPreferencesModel: {privacyPreferencesSchema},
    finalTouchesModel: {finalTouchesSchema}} = require('patientProfile');

const patientSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    basicProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'BasicProfile', required: true },
    healthInterests: healthInterestsSchema,
    privacyPreferences: privacyPreferencesSchema,
    finalTouches: finalTouchesSchema,

}, { timestamps: true });


patientSchema.index({ user: 1 });

module.exports = mongoose.model('Patient', patientSchema);