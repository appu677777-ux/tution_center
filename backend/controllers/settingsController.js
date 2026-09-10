const Settings = require("../models/Settings");

// ==========================================
// GET SETTINGS
// ==========================================

const getSettings = async (req, res) => {
  try {
    let settings =
      await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        centerName: "Tuition Center",
        phone: "",
        email: "",
        address: ""
      });
    }

    res.json({
      settings
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Unable to load settings."
    });
  }
};


// ==========================================
// UPDATE SETTINGS
// ==========================================

const updateSettings = async (req, res) => {
  try {
    const {
      centerName,
      phone,
      email,
      address
    } = req.body;

    let settings =
      await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    settings.centerName =
      centerName?.trim() ||
      "Tuition Center";

    settings.phone =
      phone?.trim() || "";

    settings.email =
      email?.trim() || "";

    settings.address =
      address?.trim() || "";

    await settings.save();

    res.json({
      message:
        "Center information updated successfully.",
      settings
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Unable to update center information."
    });
  }
};


module.exports = {
  getSettings,
  updateSettings
};