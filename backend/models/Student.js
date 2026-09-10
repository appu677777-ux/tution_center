const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    dateOfBirth: {
      type: Date
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    },

    phone: {
      type: String,
      trim: true
    },

    parentName: {
      type: String,
      required: true,
      trim: true
    },

    parentPhone: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      house: String,
      place: String,
      district: String
    },

    academicYear: {
      type: String,
      required: true,
      trim: true
    },

    course: {
      type: String,
      required: true,
      trim: true
    },

    batch: {
      type: String,
      required: true,
      trim: true
    },

    admissionDate: {
      type: Date,
      default: Date.now
    },

    totalFee: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Completed", "Transferred"],
      default: "Active"
    },

    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster searching/filtering
studentSchema.index({ name: 1 });
studentSchema.index({ academicYear: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ phone: 1 });

module.exports = mongoose.model("Student", studentSchema);