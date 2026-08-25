const mongoose = require('mongoose');
const { enum: { rolesArray } } = require('constants');

const UserSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: true, 
        trim: true, 
        minlength: 1,
        maxlength: 50 
    },
    lastName: { 
        type: String, 
        required: true, 
        trim: true , 
        minlength: 1,
        maxlength: 50
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    },
    password: { type: String, required: true},
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
    passwordResetTokenHash: {
        type: String,
        default: null,
    },

    passwordResetExpiresAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true, strict: true, optimisticConcurrency: true });

module.exports = mongoose.model('User', UserSchema);
