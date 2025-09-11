const mongoose = require('mongoose');

const finalTouchesSchema = new mongoose.Schema({
    openTo: {
        collaborations: { type: Boolean, default: false },
        jobOpportunities: { type: Boolean, default: false },
        mentoring: { type: Boolean, default: false }
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
    visibilitySettings: {
        showContactInfo: { type: Boolean, default: true },
        showEducation: { type: Boolean, default: true },
        showWorkExperience: { type: Boolean, default: true },
        showLanguagesSpoken: { type: Boolean, default: true },
        showAvailabilityStatus: { type: Boolean, default: true }
    }
}, { _id: false });

module.exports = { finalTouchesSchema };