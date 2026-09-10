const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const connectDB = require("../config/db");
const Staff = require("../models/Staff");

dotenv.config();

const createStaff = async () => {
  try {
    await connectDB();

    const username = "farispkm";
    const name = "Tuition Center Staff";
    const password = "tutor@2026";

    // Check if staff already exists
    const existingStaff = await Staff.findOne({ username });

    if (existingStaff) {
      console.log("Staff account already exists.");
      process.exit(0);
    }

    // Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    await Staff.create({
      username,
      name,
      passwordHash
    });

    console.log("Staff account created successfully.");
    console.log("Username:", username);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Error creating staff:", error.message);
    process.exit(1);
  }
};

createStaff();