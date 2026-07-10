const mongoose = require('mongoose');
const {adminStatusArray, specialtiesArray, adminLevelsArray} = require('constants/enum');

const adminSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    status: { type: String, required: true, enum: adminStatusArray, default: null, trim: true },
    permissions: {
        manageUsers: {type: Boolean, default: true},
        managePosts: {type: Boolean, default: true},
        viewAnalytics: {type: Boolean, default: true},
    },
    level: { type: String, required: true, enum: adminLevelsArray, required: true, trim: true },
    startDate: { type: Date, required: true, default: null },
    endDate: { type: Date, required: true, default: null },
    phone: { type: String, required: true, default: null, trim: true },
    department: { type: String, required: true, enum: specialtiesArray, default: null, trim: true },
    region: { type: String, required: true, default: null, trim: true },
    }, {
    timestamps: true, strict: true, optimisticConcurrency: true 
});


adminSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Admin', adminSchema);
