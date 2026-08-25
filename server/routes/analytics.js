const express = require("express");
const { pool } = require("../config/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// 1. OVERALL & MONTHLY FINANCIAL SUMMARY
router.get("/summary", async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query; // optional YYYY-MM

    let query = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COUNT(*) AS total_transactions
      FROM transactions 
      WHERE user_id = ?
    `;
    const params = [userId];

    if (month) {
      query += " AND DATE_FORMAT(date, '%Y-%m') = ?";
      params.push(month);
    }

    const [rows] = await pool.query(query, params);
    const summary = rows[0];

    const totalIncome = parseFloat(summary.total_income);
    const totalExpense = parseFloat(summary.total_expense);
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;

    res.json({
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate: Number(savingsRate),
      totalTransactions: summary.total_transactions,
    });
  } catch (error) {
    console.error("Analytics Summary Error:", error);
    res.status(500).json({ message: "Failed to load summary." });
  }
});

// 2. CATEGORY BREAKDOWN (For Donut / Pie chart)
router.get("/categories", async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = "expense", month } = req.query;

    let query = `
      SELECT category, SUM(amount) AS total, COUNT(*) AS count
      FROM transactions
      WHERE user_id = ? AND type = ?
    `;
    const params = [userId, type];

    if (month) {
      query += " AND DATE_FORMAT(date, '%Y-%m') = ?";
      params.push(month);
    }

    query += " GROUP BY category ORDER BY total DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows.map(r => ({ ...r, total: parseFloat(r.total) })));
  } catch (error) {
    console.error("Category Analytics Error:", error);
    res.status(500).json({ message: "Failed to load category analytics." });
  }
});

// 3. MONTHLY CASHFLOW TREND (For Bar Chart - last 6 months)
router.get("/monthly-trend", async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') AS month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
      FROM transactions
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC
    `;

    const [rows] = await pool.query(query, [userId]);
    res.json(
      rows.map(r => ({
        month: r.month,
        income: parseFloat(r.income),
        expense: parseFloat(r.expense),
      }))
    );
  } catch (error) {
    console.error("Monthly Trend Error:", error);
    res.status(500).json({ message: "Failed to load monthly trend." });
  }
});

module.exports = router;
