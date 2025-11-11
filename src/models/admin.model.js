const mongoose = require('mongoose');
const {enum: {adminStatusArray, specialtiesArray}} = require('constants');

const adminSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: adminStatusArray, default: 'invited', trim: true },
    startDate: { type: Date, default: null, trim: true },
    endDate: { type: Date, default: null, trim: true },
    phone: { type: String, default: null, trim: true },
    department: { type: String, enum: specialtiesArray, default: null, trim: true },
    region: { type: String, default: null, trim: true },
    }, {
    timestamps: true, strict: true, optimisticConcurrency: true 
});


adminSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Admin', adminSchema);