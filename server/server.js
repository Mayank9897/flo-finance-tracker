const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./config/db");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const analyticsRoutes = require("./routes/analytics");
const budgetRoutes = require("./routes/budgets");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Flo Finance API is up and running." });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Flo Finance Server running on http://localhost:${PORT}`);
  await initDB();
});
