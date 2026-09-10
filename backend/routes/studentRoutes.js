const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
} = require("../controllers/studentController");

const router = express.Router();

// All student routes require login
router.use(protect);

// Create student
router.post("/", createStudent);

// Get all students
router.get("/", getStudents);

// Get one student
router.get("/:id", getStudent);

// Update student
router.put("/:id", updateStudent);

// Deactivate student
router.delete("/:id", deleteStudent);

module.exports = router;