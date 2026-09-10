const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Staff = require("../models/Staff");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // Find staff
    const staff = await Staff.findOne({ username });

    if (!staff) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      staff.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: staff._id,
        username: staff.username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",

      token,

      staff: {
        id: staff._id,
        username: staff.username,
        name: staff.name
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ==========================================
// UPDATE STAFF PROFILE
// ==========================================

const updateProfile = async (req, res) => {
  try {
    const { name, username } = req.body;

    if (!name || !username) {
      return res.status(400).json({
        message:
          "Name and username are required."
      });
    }

    const staffId = req.staff.id;

    // Check whether username is already used
    const existingStaff = await Staff.findOne({
      username: username.trim(),
      _id: { $ne: staffId }
    });

    if (existingStaff) {
      return res.status(400).json({
        message:
          "This username is already in use."
      });
    }

    const staff = await Staff.findByIdAndUpdate(
      staffId,
      {
        name: name.trim(),
        username: username.trim()
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-passwordHash");

    if (!staff) {
      return res.status(404).json({
        message: "Staff account not found."
      });
    }

    res.json({
      message: "Profile updated successfully.",
      staff
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update profile."
    });
  }
};


// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Current password and new password are required."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must contain at least 6 characters."
      });
    }

    const staff = await Staff.findById(
      req.staff.id
    );

    if (!staff) {
      return res.status(404).json({
        message: "Staff account not found."
      });
    }

    // Verify old password
    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        staff.passwordHash
      );

    if (!passwordMatch) {
      return res.status(400).json({
        message:
          "Current password is incorrect."
      });
    }

    // Prevent same password
    const samePassword =
      await bcrypt.compare(
        newPassword,
        staff.passwordHash
      );

    if (samePassword) {
      return res.status(400).json({
        message:
          "New password must be different from the current password."
      });
    }

    // Encrypt new password
    const newPasswordHash =
      await bcrypt.hash(
        newPassword,
        10
      );

    staff.passwordHash =
      newPasswordHash;

    await staff.save();

    res.json({
      message:
        "Password changed successfully."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Unable to change password."
    });
  }
};


module.exports = {
  
  login,
  updateProfile,
  changePassword
};
