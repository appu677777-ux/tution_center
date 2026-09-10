const Payment = require("../models/Payment");
const Student = require("../models/Student");

// ==========================================
// ADD PAYMENT
// ==========================================

const addPayment = async (req, res) => {
  try {
    const {
      studentId,
      amount,
      paymentMethod,
      paymentDate,
      remarks
    } = req.body;

    // Validate required fields
    if (!studentId || !amount || !paymentMethod) {
      return res.status(400).json({
        message:
          "Student, amount and payment method are required"
      });
    }

    // Find student
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Get all previous payments
    const previousPayments = await Payment.find({
      studentId
    });

    // Calculate total paid
    const totalPaid = previousPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    // Calculate current balance
    const balance =
      student.totalFee - totalPaid;

    // Prevent overpayment
    if (amount > balance) {
      return res.status(400).json({
        message: `Payment cannot be greater than balance of ₹${balance}`
      });
    }

    // Generate receipt number
    const paymentCount = await Payment.countDocuments();

    const receiptNumber =
      `REC-${String(paymentCount + 1).padStart(4, "0")}`;

    // Create payment
    const payment = await Payment.create({
      studentId,
      amount,
      paymentMethod,
      paymentDate: paymentDate || new Date(),
      receiptNumber,
      remarks
    });

    // Calculate new totals
    const newTotalPaid =
      totalPaid + Number(amount);

    const newBalance =
      student.totalFee - newTotalPaid;

    res.status(201).json({
      message: "Payment added successfully",

      payment,

      feeSummary: {
        totalFee: student.totalFee,
        totalPaid: newTotalPaid,
        balance: newBalance
      }
    });

  } catch (error) {
    console.error(
      "Add payment error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to add payment"
    });
  }
};


// ==========================================
// GET STUDENT PAYMENT HISTORY
// ==========================================

const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const payments = await Payment.find({
      studentId
    }).sort({
      paymentDate: -1
    });

    // Calculate total paid
    const totalPaid = payments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    const balance =
      student.totalFee - totalPaid;

    res.json({
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId
      },

      feeSummary: {
        totalFee: student.totalFee,
        totalPaid,
        balance
      },

      payments
    });

  } catch (error) {
    console.error(
      "Get payments error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to get payment history"
    });
  }
};


// ==========================================
// GET ALL PAYMENTS
// ==========================================

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate(
        "studentId",
        "name studentId"
      )
      .sort({
        paymentDate: -1
      });

    res.json({
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error(
      "Get all payments error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to get payments"
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found."
      });
    }

    await Payment.findByIdAndDelete(id);

    res.json({
      message: "Payment deleted successfully."
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to delete payment."
    });
  }
};


module.exports = {
  addPayment,
  getStudentPayments,
  getAllPayments,
  deletePayment
};