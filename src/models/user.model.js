const mongoose = require('mongoose');
const { roles: {rolesArray, rolesObj} } = require('constants');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: rolesArray,
        required: true
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    isEmailVerified: {
    type: Boolean,
    default: false
    }
});

module.exports = mongoose.model('User', UserSchema);