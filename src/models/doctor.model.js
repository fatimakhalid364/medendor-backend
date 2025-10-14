const mongoose = require('mongoose');
const {
    availabilityModel: {availabilitySchema}, 
    credentialsModel: {credentialsSchema}, 
    professionalDetailsModel: {professionalDetailsSchema},
    finalTouchesModel: {finalTouchesSchema}} = require('doctorProfile');


const doctorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    basicProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'BasicProfile', required: true },
    professionalDetails: {type: professionalDetailsSchema, default: {}},
    credentials: {type: credentialsSchema, default: {}},
    availability: {type: availabilitySchema, default: {}},
    joinedCommunities: {
        type: [String],
        default: [],
    },
    finalTouches: {type: finalTouchesSchema, default: {}},
    isVerifiedDoctor: {
        type: Boolean,
        default: false,
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
}, { timestamps: true });

doctorSchema.index({ user: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);