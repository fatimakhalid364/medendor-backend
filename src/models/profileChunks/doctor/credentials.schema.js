const mongoose = require('mongoose');
const {educationSchema} = require('./education.schema');
const {enum: {issuingAuthArray}} = require('constants');

const credentialsSchema = new mongoose.Schema({
    medicalLicenseNumber: { type: String, trim: true },
    issuingAuthority: {
        type: String,
        trim: true,
        enum: issuingAuthArray,
    },
    licenseCertificateUrl: { type: String },
    education: {
        type: [educationSchema],
        default: []
    },
    certifications: {
        type: [String],
        default: []
    }
}, { _id: false });

module.exports = { credentialsSchema };