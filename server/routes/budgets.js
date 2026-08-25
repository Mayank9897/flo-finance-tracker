const express = require("express");
const { pool } = require("../config/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// 1. GET BUDGETS & ACTUAL SPENDING FOR A MONTH
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = req.query.month || new Date().toISOString().slice(0, 7); // format: YYYY-MM

    // Fetch budget targets along with actual spent amount using LEFT JOIN & subquery
    const query = `
      SELECT 
        b.id,
        b.category,
        b.limit_amount,
        b.month,
        COALESCE(spent.total_spent, 0) AS current_spent
      FROM budgets b
      LEFT JOIN (
        SELECT category, SUM(amount) AS total_spent
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND DATE_FORMAT(date, '%Y-%m') = ?
        GROUP BY category
      ) spent ON b.category = spent.category
      WHERE b.user_id = ? AND b.month = ?
      ORDER BY b.category ASC
    `;

    const [rows] = await pool.query(query, [userId, currentMonth, userId, currentMonth]);
    res.json(
      rows.map(r => ({
        ...r,
        limit_amount: parseFloat(r.limit_amount),
        current_spent: parseFloat(r.current_spent),
      }))
    );
  } catch (error) {
    console.error("Fetch Budgets Error:", error);
    res.status(500).json({ message: "Failed to load budgets." });
  }
});

// 2. SET / UPDATE BUDGET (Upsert)
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, limit_amount, month } = req.body;

    if (!category || limit_amount === undefined || !month) {
      return res.status(400).json({ message: "Category, limit amount, and month are required." });
    }

    const query = `
      INSERT INTO budgets (user_id, category, limit_amount, month)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount)
    `;

    await pool.query(query, [userId, category, Number(limit_amount), month]);

    res.json({ message: "Budget saved successfully!" });
  } catch (error) {
    console.error("Save Budget Error:", error);
    res.status(500).json({ message: "Failed to save budget." });
  }
});

module.exports = router;
