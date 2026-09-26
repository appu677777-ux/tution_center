const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ==========================================
    // STUDENT
    // ==========================================

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    // ==========================================
    // PAYMENT AMOUNT
    // ==========================================

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    // ==========================================
    // PAYMENT METHOD
    // ==========================================

    paymentMethod: {
      type: String,
      enum: ["Cash", "GPay"],
      required: true
    },

    // ==========================================
    // PAYMENT DATE
    // ==========================================

    paymentDate: {
      type: Date,
      default: Date.now
    },

    // ==========================================
    // FEE TYPE
    // ==========================================

    feeType: {
      type: String,

      enum: [
        "monthly",
        "installment",
        "custom"
      ],

      default: "custom"
    },

    // ==========================================
    // FEE REFERENCE
    // ==========================================

    /*
      Examples:

      Monthly:
      "June"
      "July"
      "August"
      "September"

      Installment:
      "Installment 1"
      "Installment 2"
      "Installment 3"
    */

    feeReference: {
      type: String,
      trim: true,
      default: ""
    },

    // ==========================================
    // RECEIPT
    // ==========================================

    receiptNumber: {
      type: String,
      unique: true,
      required: true
    },

    // ==========================================
    // REMARKS
    // ==========================================

    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// INDEXES
// ==========================================

// Faster student payment history
paymentSchema.index({
  studentId: 1,
  paymentDate: -1
});

// Faster monthly/installment lookup
paymentSchema.index({
  studentId: 1,
  feeType: 1,
  feeReference: 1
});

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);