const express = require("express");
const cors = require("cors");
require("dotenv").config();

const memberRoutes = require("./routes/memberRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/members", memberRoutes);
app.use("/api/payments", authMiddleware, paymentRoutes);
app.use("/api/owner", ownerRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});