const mysql = require("mysql2/promise");
require("dotenv").config();

const port = Number(process.env.DB_PORT) || 3307;

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: port,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "flo_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Auto-initialize Database & Tables if they do not exist
async function initDB() {
  try {
    // 1. Initial connection without database to create DB if needed
    const initialConnection = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: port,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    const dbName = process.env.DB_NAME || "flo_tracker";
    await initialConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await initialConnection.end();

    // 2. Create tables inside the database
    const conn = await pool.getConnection();

    // Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Transactions table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('income','expense') NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        date DATE NOT NULL,
        description VARCHAR(255) DEFAULT 'No description',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, date),
        INDEX idx_user_type (user_id, type)
      );
    `);

    // Budgets table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        limit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        month CHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_budget (user_id, category, month),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    conn.release();
    console.log("✅ Database & tables verified successfully.");
  } catch (error) {
    console.error("❌ MySQL Initialization Notice/Error:", error.message);
  }
}

module.exports = { pool, initDB };
