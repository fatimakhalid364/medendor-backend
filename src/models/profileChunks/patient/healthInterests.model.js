const mongoose = require('mongoose');

const healthInterestsSchema = new mongoose.Schema({
    primaryConcerns: {
        type: [String],
        default: [],
        trim: true
    },
    otherInterests: {
        type: [String],
        default: [],
        trim: true
    },
    medicalHistory: {
        type: String,
        trim: true
    },
    currentDiagnosis: {
        type: String,
        trim: true
    },
    ongoingConditions: {
        type: String,
        trim: true
    }
}, { _id: false });

module.exports = { healthInterestsSchema };
