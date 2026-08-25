const express = require("express");
const { pool } = require("../config/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware); // Protect all transaction routes

// 1. GET ALL TRANSACTIONS (with optional filters)
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, category, search, month } = req.query;

    let query = "SELECT * FROM transactions WHERE user_id = ?";
    const params = [userId];

    if (type && type !== "all") {
      query += " AND type = ?";
      params.push(type);
    }

    if (category && category !== "all") {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (description LIKE ? OR category LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (month) {
      // month format: YYYY-MM
      query += " AND DATE_FORMAT(date, '%Y-%m') = ?";
      params.push(month);
    }

    query += " ORDER BY date DESC, id DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Fetch Transactions Error:", error);
    res.status(500).json({ message: "Failed to fetch transactions." });
  }
});

// 2. ADD A TRANSACTION
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, category, amount, date, description } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({ message: "Type, category, amount, and date are required." });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number." });
    }

    const [result] = await pool.query(
      "INSERT INTO transactions (user_id, type, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, type, category, Number(amount), date, description || "No description"]
    );

    const [newTx] = await pool.query("SELECT * FROM transactions WHERE id = ?", [result.insertId]);

    res.status(201).json({
      message: "Transaction added successfully!",
      transaction: newTx[0],
    });
  } catch (error) {
    console.error("Add Transaction Error:", error);
    res.status(500).json({ message: "Failed to add transaction." });
  }
});

// 3. UPDATE A TRANSACTION
router.put("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const txId = req.params.id;
    const { type, category, amount, date, description } = req.body;

    // Check ownership
    const [existing] = await pool.query(
      "SELECT id FROM transactions WHERE id = ? AND user_id = ?",
      [txId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Transaction not found or unauthorized." });
    }

    await pool.query(
      "UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ? AND user_id = ?",
      [type, category, Number(amount), date, description || "No description", txId, userId]
    );

    const [updated] = await pool.query("SELECT * FROM transactions WHERE id = ?", [txId]);

    res.json({
      message: "Transaction updated successfully!",
      transaction: updated[0],
    });
  } catch (error) {
    console.error("Update Transaction Error:", error);
    res.status(500).json({ message: "Failed to update transaction." });
  }
});

// 4. DELETE A TRANSACTION
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const txId = req.params.id;

    const [result] = await pool.query(
      "DELETE FROM transactions WHERE id = ? AND user_id = ?",
      [txId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found or unauthorized." });
    }

    res.json({ message: "Transaction deleted successfully!" });
  } catch (error) {
    console.error("Delete Transaction Error:", error);
    res.status(500).json({ message: "Failed to delete transaction." });
  }
});

module.exports = router;
