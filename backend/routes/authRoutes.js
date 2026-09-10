const express = require("express");

const router = express.Router();

const {
  login,
  updateProfile,
  changePassword
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// Login
router.post("/login", login);

// Update staff profile
router.put("/profile", protect, updateProfile);

// Change password
router.put("/password", protect, changePassword);

module.exports = router;