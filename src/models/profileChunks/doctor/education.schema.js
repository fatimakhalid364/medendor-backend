const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    degree: { type: String, trim: true },
    institute: { type: String, trim: true },
    country: { type: String, trim: true },
    startYear: {
        type: Number,
        validate: {
            validator(value) {
                value <= this.endYear;
            },
            message: "Start year cannot be after end year."
        }
    },
    endYear: {
        type: Number,
        validate: {
            validator(value) {
                return value == null || value >= this.startYear;
            },
            message: "End year cannot be before start year."
        }
    },
    currentlyStudying: { type: Boolean, default: false },
}, { _id: false });

module.exports = { educationSchema };