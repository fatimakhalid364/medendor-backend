const mongoose = require('mongoose');
const {educationSchema} = require('./education.schema');
const {enum: {issuingAuthArray}} = require('constants');

const credentialsSchema = new mongoose.Schema({
    medicalLicenseNumber: { type: String, trim: true, required: true },
    issuingAuthority: {
        type: String,
        trim: true,
        enum: issuingAuthArray,
        required: true
    },
    licenseCertificateUrl: { type: String, required: true },
    education: {
        type: [educationSchema],
        default: [],
        required: true,
        validate: [arr => arr.length <= 5, 'Maximum 5 degree entries allowed.']
    },
    certifications: {
        type: [String],
        default: [],
        validate: [arr => arr.length <= 5, 'Maximum 5 certfication entries allowed.']
    }
}, { _id: false });

module.exports = { credentialsSchema };