const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  workplaces: {
    type: [
      {
        name: { type: String, trim: true },
        location: { type: String, trim: true },
      }
    ],
    default: [],
    validate: [arr => arr.length <= 5, 'Maximum 5 workplaces entries allowed.']
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
    default: [],
    validate: [arr => arr.length <= 5, 'Maximum 5 appointment-slot entries allowed.']
  }
}, { _id: false });

module.exports = { availabilitySchema };
