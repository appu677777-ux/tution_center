const Student = require("../models/Student");

// ==========================================
// CREATE STUDENT
// ==========================================

const createStudent = async (req, res) => {
  try {
    const {
      studentId,
      admissionNumber,
      name,
      dateOfBirth,
      gender,
      phone,
      parentName,
      parentPhone,
      address,
      standard,
      division,
      admissionDate,
      totalFee,
      feeStructure,
      status,
      notes
    } = req.body;

    // ==========================================
    // REQUIRED FIELD VALIDATION
    // ==========================================

    if (
      !studentId ||
      !admissionNumber ||
      !name ||
      !parentName ||
      !parentPhone ||
      !standard ||
      !division ||
      totalFee === undefined ||
      totalFee === ""
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    // ==========================================
    // CLASS VALIDATION
    // ==========================================

    if (!["8", "9", "10"].includes(String(standard))) {
      return res.status(400).json({
        message: "Class must be 8, 9, or 10"
      });
    }

    // ==========================================
    // DIVISION VALIDATION
    // ==========================================

    const cleanDivision = String(division)
      .trim()
      .toUpperCase();

    if (!["A", "B", "C", "D"].includes(cleanDivision)) {
      return res.status(400).json({
        message: "Division must be A, B, C, or D"
      });
    }

    // ==========================================
    // CREATE STUDENT
    // ==========================================

    const student = await Student.create({
      studentId: String(studentId).trim(),

      admissionNumber:
        String(admissionNumber).trim(),

      name:
        String(name).trim(),

      dateOfBirth:
        dateOfBirth || undefined,

      gender:
        gender || undefined,

      phone:
        phone ? String(phone).trim() : undefined,

      parentName:
        String(parentName).trim(),

      parentPhone:
        String(parentPhone).trim(),

      address: {
        house:
          address?.house
            ? String(address.house).trim()
            : "",

        place:
          address?.place
            ? String(address.place).trim()
            : "",

        district:
          address?.district
            ? String(address.district).trim()
            : ""
      },

      // ========================================
      // CLASS
      // ========================================

      standard:
        String(standard),

      // ========================================
      // DIVISION
      // ========================================

      division:
        cleanDivision,

      admissionDate:
        admissionDate || undefined,

      totalFee:
        Number(totalFee),

      feeStructure:
        feeStructure || undefined,

      status:
        status || "Active",

      notes:
        notes
          ? String(notes).trim()
          : undefined
    });

    // ==========================================
    // SUCCESS
    // ==========================================

    res.status(201).json({
      message: "Student created successfully",
      student
    });

  } catch (error) {

    console.error(
      "Create student error:",
      error
    );

    // ==========================================
    // DUPLICATE VALUE
    // ==========================================

    if (error.code === 11000) {

      const duplicateField =
        Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "studentId") {
        return res.status(400).json({
          message: "Student ID already exists"
        });
      }

      if (duplicateField === "admissionNumber") {
        return res.status(400).json({
          message: "Admission number already exists"
        });
      }

      return res.status(400).json({
        message: "Student ID or admission number already exists"
      });
    }

    // ==========================================
    // MONGOOSE VALIDATION ERROR
    // ==========================================

    if (error.name === "ValidationError") {

      const messages = Object.values(
        error.errors
      ).map((err) => err.message);

      return res.status(400).json({
        message: messages.join(", ")
      });
    }

    // ==========================================
    // GENERAL ERROR
    // ==========================================

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
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      count: students.length,
      students
    });

  } catch (error) {

    console.error(
      "Get students error:",
      error
    );

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
    ).lean();

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      student
    });

  } catch (error) {

    console.error(
      "Get student error:",
      error
    );

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

    // ==========================================
    // ALLOWED FIELDS ONLY
    // ==========================================

    const {
      studentId,
      admissionNumber,
      name,
      dateOfBirth,
      gender,
      phone,
      parentName,
      parentPhone,
      address,
      standard,
      division,
      admissionDate,
      totalFee,
      feeStructure,
      status,
      notes
    } = req.body;

    // ==========================================
    // CLASS VALIDATION
    // ==========================================

    if (
      standard !== undefined &&
      !["8", "9", "10"].includes(
        String(standard)
      )
    ) {
      return res.status(400).json({
        message: "Class must be 8, 9, or 10"
      });
    }

    // ==========================================
    // DIVISION VALIDATION
    // ==========================================

    let cleanDivision;

    if (division !== undefined) {

      cleanDivision =
        String(division)
          .trim()
          .toUpperCase();

      if (
        !["A", "B", "C", "D"].includes(
          cleanDivision
        )
      ) {
        return res.status(400).json({
          message: "Division must be A, B, C, or D"
        });
      }
    }

    // ==========================================
    // UPDATE DATA
    // ==========================================

    const updateData = {};

    if (studentId !== undefined) {
      updateData.studentId =
        String(studentId).trim();
    }

    if (admissionNumber !== undefined) {
      updateData.admissionNumber =
        String(admissionNumber).trim();
    }

    if (name !== undefined) {
      updateData.name =
        String(name).trim();
    }

    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth =
        dateOfBirth || null;
    }

    if (gender !== undefined) {
      updateData.gender =
        gender || undefined;
    }

    if (phone !== undefined) {
      updateData.phone =
        phone
          ? String(phone).trim()
          : "";
    }

    if (parentName !== undefined) {
      updateData.parentName =
        String(parentName).trim();
    }

    if (parentPhone !== undefined) {
      updateData.parentPhone =
        String(parentPhone).trim();
    }

    if (address !== undefined) {
      updateData.address = {
        house:
          address?.house
            ? String(address.house).trim()
            : "",

        place:
          address?.place
            ? String(address.place).trim()
            : "",

        district:
          address?.district
            ? String(address.district).trim()
            : ""
      };
    }

    // ==========================================
    // CLASS
    // ==========================================

    if (standard !== undefined) {
      updateData.standard =
        String(standard);
    }

    // ==========================================
    // DIVISION
    // ==========================================

    if (cleanDivision !== undefined) {
      updateData.division =
        cleanDivision;
    }

    if (admissionDate !== undefined) {
      updateData.admissionDate =
        admissionDate || null;
    }

    if (totalFee !== undefined) {
      updateData.totalFee =
        Number(totalFee);
    }

    if (feeStructure !== undefined) {
      updateData.feeStructure =
        feeStructure;
    }

    if (status !== undefined) {
      updateData.status =
        status;
    }

    if (notes !== undefined) {
      updateData.notes =
        notes
          ? String(notes).trim()
          : "";
    }

    // ==========================================
    // UPDATE
    // ==========================================

    const student =
      await Student.findByIdAndUpdate(
        req.params.id,
        {
          $set: updateData
        },
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

    console.error(
      "Update student error:",
      error
    );

    // ==========================================
    // DUPLICATE VALUE
    // ==========================================

    if (error.code === 11000) {

      const duplicateField =
        Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "studentId") {
        return res.status(400).json({
          message: "Student ID already exists"
        });
      }

      if (duplicateField === "admissionNumber") {
        return res.status(400).json({
          message: "Admission number already exists"
        });
      }

      return res.status(400).json({
        message: "Student ID or admission number already exists"
      });
    }

    // ==========================================
    // VALIDATION ERROR
    // ==========================================

    if (error.name === "ValidationError") {

      const messages = Object.values(
        error.errors
      ).map((err) => err.message);

      return res.status(400).json({
        message: messages.join(", ")
      });
    }

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

    const student =
      await Student.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status: "Inactive"
          }
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

    console.error(
      "Delete student error:",
      error
    );

    res.status(500).json({
      message: "Failed to deactivate student"
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
};