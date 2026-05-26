-- ═══════════════════════════════════════════════
--  FLO EXPENSE TRACKER — Database Setup
--  Run this in phpMyAdmin or MySQL CLI
-- ═══════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS flo_tracker
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE flo_tracker;

-- ─── Users ───────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)        NOT NULL,
    email      VARCHAR(150)        NOT NULL UNIQUE,
    password   VARCHAR(255)        NOT NULL,
    created_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ─── Transactions ─────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT                 NOT NULL,
    type        ENUM('income','expense') NOT NULL,
    category    VARCHAR(100)        NOT NULL,
    amount      DECIMAL(12,2)       NOT NULL,
    date        DATE                NOT NULL,
    description VARCHAR(255)        DEFAULT 'No description',
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date),
    INDEX idx_user_type (user_id, type)
);

-- ─── Budgets ──────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT          NOT NULL,
    category     VARCHAR(100) NOT NULL,
    limit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    month        CHAR(7)      NOT NULL,   -- format: YYYY-MM
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_budget (user_id, category, month),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
