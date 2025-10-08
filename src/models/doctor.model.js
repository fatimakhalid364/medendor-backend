const mongoose = require('mongoose');
const {
    availabilityModel: {availabilitySchema}, 
    credentialsModel: {credentialsSchema}, 
    professionalDetailsModel: {professionalDetailsSchema},
    joinCommunitiesModel: {joinCommunitiesSchema}, 
    finalTouchesModel: {finalTouchesSchema}} = require('doctorProfile');


const doctorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    basicProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'BasicProfile', required: true },
    professionalDetails: professionalDetailsSchema,
    credentials: credentialsSchema,
    availability: availabilitySchema,
    joinCommunities: joinCommunitiesSchema,
    finalTouches: finalTouchesSchema,
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