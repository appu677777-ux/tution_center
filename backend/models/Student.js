const mongoose = require("mongoose");

// ======================================================
// MONTHLY FEE SCHEMA
// Used for Class 8 & 9
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
// Used for Class 10
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
    // ==================================================
    // STUDENT IDENTIFICATION
    // ==================================================

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


    // ==================================================
    // PERSONAL INFORMATION
    // ==================================================

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


    // ==================================================
    // PARENT / GUARDIAN
    // ==================================================

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


    // ==================================================
    // ADDRESS
    // ==================================================

    address: {
      house: {
        type: String,
        trim: true
      },

      place: {
        type: String,
        trim: true
      },

      district: {
        type: String,
        trim: true
      }
    },


    // ==================================================
    // CLASS
    // Only Class 8, 9 and 10
    // ==================================================

    standard: {
      type: String,
      enum: [
        "8",
        "9",
        "10"
      ],
      required: true
    },


    // ==================================================
    // DIVISION
    // ==================================================

    division: {
      type: String,
      enum: [
        "A",
        "B",
        "C",
        "D"
      ],
      required: true,
      uppercase: true,
      trim: true
    },


    // ==================================================
    // ADMISSION DATE
    // ==================================================

    admissionDate: {
      type: Date,
      default: Date.now
    },


    // ==================================================
    // TOTAL FEE
    // Kept for backward compatibility
    // ==================================================

    totalFee: {
      type: Number,
      required: true,
      min: 0
    },


    // ==================================================
    // FEE STRUCTURE
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


    // ==================================================
    // STUDENT STATUS
    // ==================================================

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


    // ==================================================
    // NOTES
    // ==================================================

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
  standard: 1
});

studentSchema.index({
  division: 1
});

studentSchema.index({
  phone: 1
});

studentSchema.index({
  standard: 1,
  division: 1
});


// ======================================================
// EXPORT
// ======================================================

module.exports =
  mongoose.model(
    "Student",
    studentSchema
  );