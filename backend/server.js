const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const protect = require("./middleware/authMiddleware");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());


// Authentication
app.use("/api/auth", authRoutes);


// Students
app.use("/api/students", studentRoutes);


// Payments
app.use("/api/payments", paymentRoutes);


app.use(
  "/api/settings",
  settingsRoutes
);

// Test
app.get("/api/test", (req, res) => {
  res.json({
    message: "Tuition Center API is working"
  });
});



// Protected test
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You can access this protected route",
    staff: req.staff
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});