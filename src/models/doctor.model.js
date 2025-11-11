const mongoose = require('mongoose');
const {
    availabilityModel: {availabilitySchema}, 
    credentialsModel: {credentialsSchema}, 
    professionalDetailsModel: {professionalDetailsSchema},
    finalTouchesModel: {finalTouchesSchema}} = require('doctorProfile');
const {enum: {verificationStatusArray}} = require('constants');


const doctorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    basicProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'BasicProfile', required: true},
    professionalDetails: {type: professionalDetailsSchema, default: () => ({})},
    credentials: {type: credentialsSchema, default: () => ({})},
    availability: {type: availabilitySchema, default: () => ({})},
    joinedCommunities: {
        type: [String],
        default: [],
    },
    finalTouches: {type: finalTouchesSchema, default: () => ({})},
    verificationStatus: {
        type: String,
        enum: verificationStatusArray,
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    verifiedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true, strict: true, optimisticConcurrency: true });

doctorSchema.index({ user: 1 }, { unique: true });

doctorSchema.index(
    { verificationStatus: 1, createdAt: -1 },
    { partialFilterExpression: { verificationStatus: 'pending' } }
);


module.exports = mongoose.model('Doctor', doctorSchema);