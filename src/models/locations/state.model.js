const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

stateSchema.index(
  { country: 1, code: 1 },
  { unique: true }
);

module.exports = mongoose.model("State", stateSchema);