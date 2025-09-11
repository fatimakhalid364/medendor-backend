const mongoose = require('mongoose');

const finalTouchesSchema = new mongoose.Schema({
    lookingFor: {
        medicalAdvice: { type: Boolean, default: false },
        emotionalSupport: { type: Boolean, default: false },
        communityDiscussions: { type: Boolean, default: false }
    },
    
    notificationPreferences: {
        emailNotifications: {
        type: Boolean,
        default: true,
        },
        inAppNotifications: {
        type: Boolean,
        default: true,
        },
        newsletterSubscribed: {
        type: Boolean,
        default: false,
        },
    },
}, { _id: false });

module.exports = { finalTouchesSchema };
