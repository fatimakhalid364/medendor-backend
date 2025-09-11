const mongoose = require('mongoose');
const {enum: {workPlacesArray}} = require('constants');

const availabilitySchema = new mongoose.Schema({
  workplaces: {
    type: [
      {
        name: { type: String, trim: true },
        location: { type: String, trim: true },
        type: {
          type: String,
          enum: workPlacesArray,
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
