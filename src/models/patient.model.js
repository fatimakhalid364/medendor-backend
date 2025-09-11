const mongoose = require('mongoose');
const {
    healthInterestsModel: {healthInterestsSchema},
    privacyPreferencesModel: {privacyPreferencesSchema},
    finalTouchesModel: {finalTouchesSchema}} = require('patientProfile');

const patientSchema = new mongoose.Schema({
    healthInterests: healthInterestsSchema,
    privacyPreferences: privacyPreferencesSchema,
    finalTouches: finalTouchesSchema,

}, { _id: false });

module.exports = {patientSchema};