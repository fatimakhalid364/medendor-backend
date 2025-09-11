const mongoose = require('mongoose');
const { doctorSchema } = require('./doctor.model');
const { patientSchema } = require('./patient.model');

const ProfileSchema = new mongoose.Schema({
    gender: { type: String, trim: true },
    age: { type: Number, min: 0 },
    profilePicture: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    languagesSpoken: { type: [String], default: [] },
    followerCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },

    doctorDetails: doctorSchema,
    patientDetails: patientSchema
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
