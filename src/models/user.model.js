const mongoose = require('mongoose');
const { enum: { rolesArray } } = require('constants');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    role: {
        type: String,
        enum: rolesArray,
        required: true,
        trim: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
}, { timestamps: true, strict: true, optimisticConcurrency: true });

module.exports = mongoose.model('User', UserSchema);
