const mongoose = require('mongoose');

const professionalDetailsSchema = new mongoose.Schema({
    specialty: { type: String, trim: true },
    subSpecialty: { type: String, trim: true },
    experience: {
    type: [
        {
        organization: { type: String, trim: true },
        position: { type: String, trim: true },
        startDate: Date,
        endDate: Date,
        currentlyWorking: { type: Boolean, default: false }
        }
    ],
    default: [],
    validate: [arr => arr.length <= 5, 'Maximum 5 experience entries allowed.']
    },
    about: { type: String, trim: true }
}, { _id: false, strict: true });

module.exports = { professionalDetailsSchema };
