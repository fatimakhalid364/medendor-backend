const mongoose = require('mongoose');
const { enum: { genderArray } } = require('constants');

const privacyPreferencesSchema = new mongoose.Schema({
    preferredDoctorGender: {
        type: String,
        enum: genderArray,
        trim: true
    },
    
    allowDirectMessages: {
        type: Boolean,
        default: true
    },
    allowAnonymousPosting: {
        type: Boolean,
        default: false
    },
    visibilitySettings: {
        hideAge: {
        type: Boolean,
        default: false,
        },
        showHealthConcernsToDoctorsOnly: {
        type: Boolean,
        default: false,
        },
        showLocationToDoctorsOnly: {
        type: Boolean,
        default: true,
        },
        allowProfileToAppearInSearch: {
        type: Boolean,
        default: true,
        },
        showAvailabilityStatus: {
        type: Boolean,
        default: true,
        },
    },
}, { _id: false });

module.exports = { privacyPreferencesSchema };
