require("dotenv").config();

const mongoose = require("mongoose");
const Student = require("../models/Student");

const MONGO_URI = process.env.MONGO_URI;

// ======================================================
// FEE SETTINGS
// CHANGE THESE TO YOUR ACTUAL FEES
// ======================================================

const FEES = {
  "8": {
    monthly: 1500
  },

  "9": {
    monthly: 1750
  },

  "10": {
    installments: [
      8000,
      8000,
      9000
    ]
  }
};

// ======================================================
// MONTHS
// ======================================================

const MONTHS = [
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
  "April",
  "May"
];

// ======================================================
// MONTHLY FEE STRUCTURE
// ======================================================

const createMonthlyFees = (monthlyAmount) => {
  return MONTHS.map((month, index) => ({
    month,
    monthNumber: index + 1,
    amount: monthlyAmount,
    paid: 0,
    balance: monthlyAmount,
    status: "Pending",
    dueDate: null
  }));
};

// ======================================================
// INSTALLMENT STRUCTURE
// ======================================================

const createInstallments = (amounts) => {
  return amounts.map((amount, index) => ({
    installmentNumber: index + 1,

    title:
      `Installment ${index + 1}`,

    amount,

    paid: 0,

    balance: amount,

    status: "Pending",

    dueDate: null
  }));
};

// ======================================================
// MAIN
// ======================================================

const setupFeeStructures = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing. Check your .env file."
      );
    }

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    const students = await Student.find({})
      .select("_id studentId name standard")
      .sort({ studentId: 1 })
      .lean();

    console.log(
      `Found ${students.length} students`
    );

    let class8 = 0;
    let class9 = 0;
    let class10 = 0;
    let skipped = 0;

    for (const student of students) {

      const standard =
        String(student.standard || "");

      const fee =
        FEES[standard];

      // ----------------------------------------------
      // NO FEE CONFIGURATION
      // ----------------------------------------------

      if (!fee) {
        console.log(
          `Skipped ${student.studentId} - Class ${standard}`
        );

        skipped++;

        continue;
      }

      // ==============================================
      // CLASS 8 / 9 - MONTHLY
      // ==============================================

      if (
        fee.monthly &&
        fee.monthly > 0
      ) {

        const monthlyFees =
          createMonthlyFees(
            fee.monthly
          );

        const totalAmount =
          fee.monthly * MONTHS.length;

        await Student.updateOne(
          {
            _id: student._id
          },
          {
            $set: {
              totalFee: totalAmount,

              feeStructure: {
                type: "monthly",

                monthlyAmount:
                  fee.monthly,

                totalAmount,

                monthlyFees,

                installments: []
              }
            }
          }
        );

        if (standard === "8") {
          class8++;
        }

        if (standard === "9") {
          class9++;
        }

        console.log(
          `${student.studentId} → Class ${standard} → Monthly ₹${fee.monthly} → Total ₹${totalAmount}`
        );
      }

      // ==============================================
      // CLASS 10 - INSTALLMENTS
      // ==============================================

      else if (
        fee.installments &&
        fee.installments.length > 0
      ) {

        const installments =
          createInstallments(
            fee.installments
          );

        const totalAmount =
          fee.installments.reduce(
            (sum, amount) =>
              sum + amount,
            0
          );

        await Student.updateOne(
          {
            _id: student._id
          },
          {
            $set: {
              totalFee: totalAmount,

              feeStructure: {
                type: "installment",

                monthlyAmount: 0,

                totalAmount,

                monthlyFees: [],

                installments
              }
            }
          }
        );

        class10++;

        console.log(
          `${student.studentId} → Class 10 → 3 Installments → Total ₹${totalAmount}`
        );
      }
    }

    console.log(
      "================================"
    );

    console.log(
      `Class 8 updated  : ${class8}`
    );

    console.log(
      `Class 9 updated  : ${class9}`
    );

    console.log(
      `Class 10 updated : ${class10}`
    );

    console.log(
      `Skipped          : ${skipped}`
    );

    console.log(
      "================================"
    );

    console.log(
      "Fee structures created successfully."
    );

    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {

    console.error(
      "Migration error:",
      error.message
    );

    await mongoose.disconnect();

    process.exit(1);
  }
};

setupFeeStructures();