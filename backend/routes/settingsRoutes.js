const express = require("express");

const router = express.Router();

const {
  getSettings,
  updateSettings
} = require("../controllers/settingsController");

const protect = require("../middleware/authMiddleware");


// Get settings
router.get(
  "/",
  protect,
  getSettings
);


// Update settings
router.put(
  "/",
  protect,
  updateSettings
);


module.exports = router;