const mongoose = require('mongoose');
const {enum: {workPlaceStatusArray}} = require('constants');

const availabilitySchema = new mongoose.Schema({
  workplaces: {
    type: [
      {
        name: { type: String, trim: true },
        location: { type: String, trim: true },
        type: {
          type: String,
          enum: workPlaceStatusArray,
        }
      }
    ],
    default: []
  },
  availableForOnlineConsultation: {
    type: Boolean,
    default: false
  },
  acceptingNewPatients: {
    type: Boolean,
    default: false
  },
  consultationFee: {
    type: Number,
    default: null,
    min: 0
  },
  appointmentTimeSlots: {
    type: [String],
    default: []
  }
}, { _id: false });

module.exports = { availabilitySchema };
