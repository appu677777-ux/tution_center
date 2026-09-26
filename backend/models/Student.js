const mongoose = require("mongoose");

// ======================================================
// MONTHLY FEE SCHEMA
// Used for 8th & 9th
// ======================================================

const monthlyFeeSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      trim: true
    },

    monthNumber: {
      type: Number,
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    paid: {
      type: Number,
      default: 0,
      min: 0
    },

    balance: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Partial",
        "Paid"
      ],
      default: "Pending"
    },

    dueDate: {
      type: Date
    }
  },
  {
    _id: true
  }
);

// ======================================================
// INSTALLMENT SCHEMA
// Used for 10th
// ======================================================

const installmentSchema = new mongoose.Schema(
  {
    installmentNumber: {
      type: Number,
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    paid: {
      type: Number,
      default: 0,
      min: 0
    },

    balance: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Partial",
        "Paid"
      ],
      default: "Pending"
    },

    dueDate: {
      type: Date
    }
  },
  {
    _id: true
  }
);

// ======================================================
// FEE STRUCTURE
// ======================================================

const feeStructureSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "monthly",
        "installment",
        "custom"
      ],
      default: "custom"
    },

    monthlyAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    monthlyFees: {
      type: [monthlyFeeSchema],
      default: []
    },

    installments: {
      type: [installmentSchema],
      default: []
    }
  },
  {
    _id: false
  }
);

// ======================================================
// STUDENT SCHEMA
// ======================================================

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
      enum: [
        "Male",
        "Female",
        "Other"
      ]
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

    // ==================================================
    // STANDARD
    // ==================================================

    standard: {
      type: String,
      enum: [
        "8",
        "9",
        "10",
        "11",
        "12"
      ],
      default: "10"
    },

    admissionDate: {
      type: Date,
      default: Date.now
    },

    // ==================================================
    // OLD TOTAL FEE
    // Kept for backward compatibility
    // ==================================================

    totalFee: {
      type: Number,
      required: true,
      min: 0
    },

    // ==================================================
    // NEW FEE STRUCTURE
    // ==================================================

    feeStructure: {
      type: feeStructureSchema,
      default: () => ({
        type: "custom",
        monthlyAmount: 0,
        totalAmount: 0,
        monthlyFees: [],
        installments: []
      })
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Completed",
        "Transferred"
      ],
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

// ======================================================
// INDEXES
// ======================================================

studentSchema.index({
  name: 1
});

studentSchema.index({
  academicYear: 1
});

studentSchema.index({
  batch: 1
});

studentSchema.index({
  standard: 1
});

studentSchema.index({
  phone: 1
});

module.exports =
  mongoose.model(
    "Student",
    studentSchema
  );