const Student = require("../models/Student");

// ==========================================
// CREATE STUDENT
// ==========================================

const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      message: "Student created successfully",
      student
    });

  } catch (error) {
    console.error("Create student error:", error.message);

    // Duplicate value
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Student ID or admission number already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create student"
    });
  }
};


// ==========================================
// GET ALL STUDENTS
// ==========================================

const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ createdAt: -1 });

    res.json({
      count: students.length,
      students
    });

  } catch (error) {
    console.error("Get students error:", error.message);

    res.status(500).json({
      message: "Failed to get students"
    });
  }
};


// ==========================================
// GET SINGLE STUDENT
// ==========================================

const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      student
    });

  } catch (error) {
    console.error("Get student error:", error.message);

    res.status(500).json({
      message: "Failed to get student"
    });
  }
};


// ==========================================
// UPDATE STUDENT
// ==========================================

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student updated successfully",
      student
    });

  } catch (error) {
    console.error("Update student error:", error.message);

    res.status(500).json({
      message: "Failed to update student"
    });
  }
};


// ==========================================
// DELETE / DEACTIVATE STUDENT
// ==========================================

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        status: "Inactive"
      },
      {
        new: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student deactivated successfully",
      student
    });

  } catch (error) {
    console.error("Delete student error:", error.message);

    res.status(500).json({
      message: "Failed to deactivate student"
    });
  }
};


module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
};