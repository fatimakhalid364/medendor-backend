const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    degree: { type: String, trim: true },
    institute: { type: String, trim: true },
    country: { type: String, trim: true },
    startYear: Number,
    endYear: Number,
    currentlyStudying: { type: Boolean, default: false },
}, { _id: false });

module.exports = { educationSchema };