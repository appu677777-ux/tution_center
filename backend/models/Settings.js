const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    centerName: {
      type: String,
      default: "Tuition Center",
      trim: true
    },

    phone: {
      type: String,
      default: "",
      trim: true
    },

    email: {
      type: String,
      default: "",
      trim: true
    },

    address: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Settings",
  settingsSchema
);