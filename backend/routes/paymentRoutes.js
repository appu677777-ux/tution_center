const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  addPayment,
  getStudentPayments,
  getAllPayments,
  deletePayment
} = require("../controllers/paymentController");

const router = express.Router();

// All payment routes require login
router.use(protect);

// Add payment
router.post("/", addPayment);

// Get all payments
router.get("/", getAllPayments);

// Get payments for one student
router.get(
  "/student/:studentId",
  getStudentPayments
);

// Delete payment
router.delete(
  "/:id",
  deletePayment
);

module.exports = router;