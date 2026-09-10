const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "GPay"],
      required: true
    },

    paymentDate: {
      type: Date,
      default: Date.now
    },

    receiptNumber: {
      type: String,
      unique: true,
      required: true
    },

    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Faster payment history lookup
paymentSchema.index({
  studentId: 1,
  paymentDate: -1
});

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);