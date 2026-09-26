const Payment = require("../models/Payment");
const Student = require("../models/Student");

// ======================================================
// HELPER: GENERATE RECEIPT NUMBER
// ======================================================

const generateReceiptNumber = async () => {
  const lastPayment = await Payment.findOne({
    receiptNumber: /^REC-\d+$/
  }).sort({
    receiptNumber: -1
  });

  let nextNumber = 1;

  if (lastPayment?.receiptNumber) {
    const lastNumber = parseInt(
      lastPayment.receiptNumber.replace("REC-", ""),
      10
    );

    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `REC-${String(nextNumber).padStart(4, "0")}`;
};

// ======================================================
// HELPER: UPDATE FEE STATUS
// ======================================================

const getFeeStatus = (paid, amount) => {
  if (paid <= 0) {
    return "Pending";
  }

  if (paid >= amount) {
    return "Paid";
  }

  return "Partial";
};

// ======================================================
// ADD PAYMENT
// ======================================================

const addPayment = async (req, res) => {
  try {
    const {
      studentId,
      amount,
      paymentMethod,
      paymentDate,
      remarks,
      feeType,
      feeReference
    } = req.body;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!studentId || !amount || !paymentMethod) {
      return res.status(400).json({
        message:
          "Student, amount and payment method are required"
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0"
      });
    }

    if (!["Cash", "GPay"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method"
      });
    }

    // --------------------------------------------------
    // FIND STUDENT
    // --------------------------------------------------

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const paymentAmount = Number(amount);

    // ==================================================
    // MONTHLY FEE
    // 8th / 9th
    // ==================================================

    if (feeType === "monthly") {
      if (!feeReference) {
        return res.status(400).json({
          message: "Please select a month"
        });
      }

      if (
        !student.feeStructure ||
        !Array.isArray(student.feeStructure.monthlyFees)
      ) {
        return res.status(400).json({
          message:
            "Monthly fee structure is not configured for this student"
        });
      }

      const monthIndex =
        student.feeStructure.monthlyFees.findIndex(
          (month) =>
            month.month === feeReference ||
            String(month.monthNumber) === String(feeReference)
        );

      if (monthIndex === -1) {
        return res.status(404).json({
          message: `Fee record not found for ${feeReference}`
        });
      }

      const selectedMonth =
        student.feeStructure.monthlyFees[monthIndex];

      const monthAmount = Number(selectedMonth.amount || 0);
      const monthPaid = Number(selectedMonth.paid || 0);

      const monthBalance =
        monthAmount - monthPaid;

      // Prevent overpayment
      if (paymentAmount > monthBalance) {
        return res.status(400).json({
          message:
            `Payment cannot be greater than ${feeReference} balance of ₹${monthBalance}`
        });
      }

      // Update month
      selectedMonth.paid =
        monthPaid + paymentAmount;

      selectedMonth.balance =
        monthAmount - selectedMonth.paid;

      selectedMonth.status =
        getFeeStatus(
          selectedMonth.paid,
          monthAmount
        );

      // ------------------------------------------------
      // RECEIPT
      // ------------------------------------------------

      const receiptNumber =
        await generateReceiptNumber();

      const payment = await Payment.create({
        studentId,
        amount: paymentAmount,
        paymentMethod,
        paymentDate:
          paymentDate || new Date(),
        receiptNumber,
        remarks,
        feeType: "monthly",
        feeReference
      });

      await student.save();

      // ------------------------------------------------
      // CALCULATE OVERALL MONTHLY SUMMARY
      // ------------------------------------------------

      const monthlyFees =
        student.feeStructure.monthlyFees;

      const totalMonthlyFee =
        monthlyFees.reduce(
          (total, month) =>
            total + Number(month.amount || 0),
          0
        );

      const totalMonthlyPaid =
        monthlyFees.reduce(
          (total, month) =>
            total + Number(month.paid || 0),
          0
        );

      const monthlyBalance =
        totalMonthlyFee -
        totalMonthlyPaid;

      return res.status(201).json({
        message:
          "Monthly payment added successfully",

        payment,

        feeSummary: {
          type: "monthly",
          totalFee: totalMonthlyFee,
          totalPaid: totalMonthlyPaid,
          balance: monthlyBalance
        },

        selectedFee: {
          type: "monthly",
          month: selectedMonth.month,
          amount: selectedMonth.amount,
          paid: selectedMonth.paid,
          balance: selectedMonth.balance,
          status: selectedMonth.status
        }
      });
    }

    // ==================================================
    // INSTALLMENT FEE
    // 10th
    // ==================================================

    if (feeType === "installment") {
      if (!feeReference) {
        return res.status(400).json({
          message:
            "Please select an installment"
        });
      }

      if (
        !student.feeStructure ||
        !Array.isArray(student.feeStructure.installments)
      ) {
        return res.status(400).json({
          message:
            "Installment fee structure is not configured for this student"
        });
      }

      const installmentIndex =
        student.feeStructure.installments.findIndex(
          (installment) =>
            String(installment.installmentNumber) ===
              String(feeReference) ||
            installment.title === feeReference
        );

      if (installmentIndex === -1) {
        return res.status(404).json({
          message:
            `Installment ${feeReference} not found`
        });
      }

      const selectedInstallment =
        student.feeStructure.installments[
          installmentIndex
        ];

      const installmentAmount =
        Number(selectedInstallment.amount || 0);

      const installmentPaid =
        Number(selectedInstallment.paid || 0);

      const installmentBalance =
        installmentAmount -
        installmentPaid;

      // Prevent overpayment
      if (paymentAmount > installmentBalance) {
        return res.status(400).json({
          message:
            `Payment cannot be greater than installment balance of ₹${installmentBalance}`
        });
      }

      // Update installment
      selectedInstallment.paid =
        installmentPaid + paymentAmount;

      selectedInstallment.balance =
        installmentAmount -
        selectedInstallment.paid;

      selectedInstallment.status =
        getFeeStatus(
          selectedInstallment.paid,
          installmentAmount
        );

      // ------------------------------------------------
      // RECEIPT
      // ------------------------------------------------

      const receiptNumber =
        await generateReceiptNumber();

      const payment = await Payment.create({
        studentId,
        amount: paymentAmount,
        paymentMethod,
        paymentDate:
          paymentDate || new Date(),
        receiptNumber,
        remarks,
        feeType: "installment",
        feeReference
      });

      await student.save();

      // ------------------------------------------------
      // OVERALL INSTALLMENT SUMMARY
      // ------------------------------------------------

      const installments =
        student.feeStructure.installments;

      const totalInstallmentFee =
        installments.reduce(
          (total, installment) =>
            total +
            Number(installment.amount || 0),
          0
        );

      const totalInstallmentPaid =
        installments.reduce(
          (total, installment) =>
            total +
            Number(installment.paid || 0),
          0
        );

      

      return res.status(201).json({
        message:
          "Installment payment added successfully",

        payment,

        feeSummary: {
          type: "installment",
          totalFee: totalInstallmentFee,
          totalPaid: totalInstallmentPaid,
          balance: installmentBalance
        },

        selectedFee: {
          type: "installment",
          installmentNumber:
            selectedInstallment.installmentNumber,
          title:
            selectedInstallment.title,
          amount:
            selectedInstallment.amount,
          paid:
            selectedInstallment.paid,
          balance:
            selectedInstallment.balance,
          status:
            selectedInstallment.status
        }
      });
    }

    // ==================================================
    // CUSTOM / OLD PAYMENT SYSTEM
    // ==================================================

    const previousPayments =
      await Payment.find({
        studentId
      });

    const totalPaid =
      previousPayments.reduce(
        (total, payment) =>
          total + Number(payment.amount),
        0
      );

    const totalFee =
      Number(student.totalFee || 0);

    const balance =
      totalFee - totalPaid;

    // Prevent overpayment
    if (paymentAmount > balance) {
      return res.status(400).json({
        message:
          `Payment cannot be greater than balance of ₹${balance}`
      });
    }

    // --------------------------------------------------
    // RECEIPT
    // --------------------------------------------------

    const receiptNumber =
      await generateReceiptNumber();

    const payment = await Payment.create({
      studentId,
      amount: paymentAmount,
      paymentMethod,
      paymentDate:
        paymentDate || new Date(),
      receiptNumber,
      remarks,
      feeType: feeType || "custom",
      feeReference:
        feeReference || ""
    });

    // --------------------------------------------------
    // NEW SUMMARY
    // --------------------------------------------------

    const newTotalPaid =
      totalPaid + paymentAmount;

    const newBalance =
      totalFee - newTotalPaid;

    return res.status(201).json({
      message:
        "Payment added successfully",

      payment,

      feeSummary: {
        type: "custom",
        totalFee,
        totalPaid: newTotalPaid,
        balance: newBalance
      }
    });

  } catch (error) {
    console.error(
      "Add payment error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to add payment",
      error:
        error.message
    });
  }
};

// ======================================================
// GET STUDENT PAYMENT HISTORY
// ======================================================

const getStudentPayments = async (
  req,
  res
) => {
  try {
    const { studentId } =
      req.params;

    const student =
      await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message:
          "Student not found"
      });
    }

    const payments =
      await Payment.find({
        studentId
      }).sort({
        paymentDate: -1
      });

    // --------------------------------------------------
    // MONTHLY STUDENT
    // --------------------------------------------------

    if (
      student.feeStructure?.type ===
      "monthly"
    ) {
      const monthlyFees =
        student.feeStructure.monthlyFees ||
        [];

      const totalFee =
        monthlyFees.reduce(
          (total, month) =>
            total +
            Number(month.amount || 0),
          0
        );

      const totalPaid =
        monthlyFees.reduce(
          (total, month) =>
            total +
            Number(month.paid || 0),
          0
        );

      const balance =
        totalFee - totalPaid;

      return res.json({
        student: {
          id: student._id,
          name: student.name,
          studentId:
            student.studentId,
          standard:
            student.standard
        },

        feeStructure: {
          type: "monthly",
          monthlyFees
        },

        feeSummary: {
          type: "monthly",
          totalFee,
          totalPaid,
          balance
        },

        payments
      });
    }

    // --------------------------------------------------
    // INSTALLMENT STUDENT
    // --------------------------------------------------

    if (
      student.feeStructure?.type ===
      "installment"
    ) {
      const installments =
        student.feeStructure.installments ||
        [];

      const totalFee =
        installments.reduce(
          (total, installment) =>
            total +
            Number(installment.amount || 0),
          0
        );

      const totalPaid =
        installments.reduce(
          (total, installment) =>
            total +
            Number(installment.paid || 0),
          0
        );

      const balance =
        totalFee - totalPaid;

      return res.json({
        student: {
          id: student._id,
          name: student.name,
          studentId:
            student.studentId,
          standard:
            student.standard
        },

        feeStructure: {
          type: "installment",
          installments
        },

        feeSummary: {
          type: "installment",
          totalFee,
          totalPaid,
          balance
        },

        payments
      });
    }

    // --------------------------------------------------
    // OLD / CUSTOM STUDENT
    // --------------------------------------------------

    const totalPaid =
      payments.reduce(
        (total, payment) =>
          total +
          Number(payment.amount),
        0
      );

    const totalFee =
      Number(student.totalFee || 0);

    const balance =
      totalFee - totalPaid;

    return res.json({
      student: {
        id: student._id,
        name: student.name,
        studentId:
          student.studentId,
        standard:
          student.standard
      },

      feeStructure: {
        type:
          student.feeStructure?.type ||
          "custom"
      },

      feeSummary: {
        type:
          student.feeStructure?.type ||
          "custom",
        totalFee,
        totalPaid,
        balance
      },

      payments
    });

  } catch (error) {
    console.error(
      "Get student payments error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to get payment history"
    });
  }
};

// ======================================================
// GET ALL PAYMENTS
// ======================================================

const getAllPayments = async (
  req,
  res
) => {
  try {
    const payments =
      await Payment.find()
        .populate(
          "studentId",
          "name studentId standard"
        )
        .sort({
          paymentDate: -1
        });

    res.json({
      count:
        payments.length,
      payments
    });

  } catch (error) {
    console.error(
      "Get all payments error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to get payments"
    });
  }
};

// ======================================================
// DELETE PAYMENT
// ======================================================

const deletePayment = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const payment =
      await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        message:
          "Payment not found."
      });
    }

    // --------------------------------------------------
    // FIND STUDENT
    // --------------------------------------------------

    const student =
      await Student.findById(
        payment.studentId
      );

    // --------------------------------------------------
    // REVERSE MONTHLY PAYMENT
    // --------------------------------------------------

    if (
      student &&
      payment.feeType ===
        "monthly" &&
      student.feeStructure?.monthlyFees
    ) {
      const month =
        student.feeStructure.monthlyFees.find(
          (item) =>
            item.month ===
            payment.feeReference ||
            String(item.monthNumber) ===
            String(payment.feeReference)
        );

      if (month) {
        month.paid = Math.max(
          0,
          Number(month.paid || 0) -
            Number(payment.amount)
        );

        month.balance =
          Number(month.amount || 0) -
          month.paid;

        month.status =
          getFeeStatus(
            month.paid,
            Number(month.amount || 0)
          );
      }

      await student.save();
    }

    // --------------------------------------------------
    // REVERSE INSTALLMENT PAYMENT
    // --------------------------------------------------

    if (
      student &&
      payment.feeType ===
        "installment" &&
      student.feeStructure?.installments
    ) {
      const installment =
        student.feeStructure.installments.find(
          (item) =>
            String(
              item.installmentNumber
            ) ===
              String(
                payment.feeReference
              ) ||
            item.title ===
              payment.feeReference
        );

      if (installment) {
        installment.paid =
          Math.max(
            0,
            Number(
              installment.paid || 0
            ) -
              Number(payment.amount)
          );

        installment.balance =
          Number(
            installment.amount || 0
          ) -
          installment.paid;

        installment.status =
          getFeeStatus(
            installment.paid,
            Number(
              installment.amount || 0
            )
          );
      }

      await student.save();
    }

    // --------------------------------------------------
    // DELETE PAYMENT
    // --------------------------------------------------

    await Payment.findByIdAndDelete(
      id
    );

    res.json({
      message:
        "Payment deleted successfully."
    });

  } catch (error) {
    console.error(
      "Delete payment error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to delete payment."
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  addPayment,
  getStudentPayments,
  getAllPayments,
  deletePayment
};