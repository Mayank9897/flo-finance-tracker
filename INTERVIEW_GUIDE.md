# 🎯 TCS Technical Interview Cheat Sheet — Flo Finance Tracker

This guide gives you direct, simple, and impressive answers for your technical interview.

---

## 1. 30-Second Elevator Pitch (Memorize this!)
> *"Flo Finance Tracker is a full-stack personal finance and wealth management dashboard. It allows users to track income and expenses across categories, set monthly spending limits, and visualize cashflow trends with real-time charts. I built the frontend with **React and Tailwind CSS** and developed a RESTful API backend using **Node.js and Express.js**, persisting relational financial data in **MySQL** with JWT authentication and bcrypt password hashing."*

---

## 2. Why did you refactor from PHP to React + Node/Express? (Golden Question!)
* **Separation of Concerns:** In traditional PHP monoliths, backend logic and HTML rendering are coupled. In React + Node, the frontend focuses solely on UI state and responsiveness, while Express provides a clean JSON REST API.
* **Single Page Application (SPA) UX:** React updates components (like adding a transaction or updating charts) dynamically without reloading the entire web page.
* **Reusability & Modularity:** React components (like `StatCards`, `Charts`, `TransactionModal`) are reusable and maintainable.

---

## 3. Top 8 Technical Interview Questions & Direct Answers

### Q1: Why did you choose MySQL (Relational DB) over MongoDB for a finance tracker?
> **Answer:** Financial records are strictly structured and relational (every transaction and budget belongs to a specific `user_id` via a Foreign Key). Relational databases provide ACID compliance, ensuring transactional consistency and preventing corrupt balance calculations.

### Q2: How does the data flow when a user adds a transaction?
> **Answer:**
> 1. User fills the form in React (`TransactionModal.jsx`).
> 2. React sends a `POST` request with the JSON payload and JWT Bearer token to `/api/transactions`.
> 3. Express verifies the token in `auth.js` middleware and extracts the `userId`.
> 4. Express executes a parameterized SQL query: `INSERT INTO transactions (user_id, type, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)`.
> 5. The server returns the created record (`201 Created`), and React re-fetches the dashboard analytics to update the UI without page reload.

### Q3: Why do you use Parameterized Queries (`?` placeholders) in SQL?
> **Answer:** Parameterized queries treat user input strictly as data rather than executable SQL commands. This completely eliminates the risk of **SQL Injection attacks**.

### Q4: How does JWT Authentication work in your app?
> **Answer:**
> 1. User logs in with email and password.
> 2. Backend verifies the password using `bcrypt.compare()` and signs a JWT containing `{ id, name, email }` with a secret key.
> 3. The client stores this token in `localStorage` and sends it in the `Authorization: Bearer <token>` header for subsequent protected requests.

### Q5: What SQL queries are used for the analytics charts?
> **Answer:**
> We use aggregate functions and `GROUP BY`:
> - **Category breakdown:** `SELECT category, SUM(amount) FROM transactions WHERE user_id = ? AND type = 'expense' GROUP BY category`
> - **Monthly trends:** `SELECT DATE_FORMAT(date, '%Y-%m') AS month, SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income, SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense FROM transactions WHERE user_id = ? GROUP BY DATE_FORMAT(date, '%Y-%m')`

### Q6: What is CORS and why did you configure it?
> **Answer:** CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks requests from different origins (e.g., React on port 3000 calling Express on port 5000). We used the `cors` middleware in Express to explicitly allow the frontend to communicate with the API.

### Q7: How did you calculate the budget progress and alerts?
> **Answer:**
> We query the budget limit and join it with the actual sum of expenses for that month. In React, we calculate the percentage `(spent / limit) * 100`. If it exceeds 100%, the UI displays a warning banner indicating the exact overspent amount.

### Q8: What would you improve in the future?
> **Answer:**
> 1. Adding CSV/PDF export for financial reports.
> 2. Automated recurring transactions (e.g., monthly subscriptions).
> 3. Integration with bank account APIs via Plaid or Open Banking.

---

## 4. Project Structure (Quick Reference)

```
flo-finance-tracker/
├── client/                     # React Frontend (Vite + Tailwind CSS + Recharts)
│   ├── src/
│   │   ├── api.js              # Centralized API fetch helper
│   │   ├── context/AuthContext # JWT User State & Auth
│   │   ├── components/         # Navbar, StatCards, Charts, BudgetSection, etc.
│   │   └── pages/              # Dashboard.jsx, Auth.jsx
│   └── vite.config.js          # Proxy configuration to backend
├── server/                     # Node.js + Express Backend REST API
│   ├── config/db.js            # MySQL connection pool & auto-migration
│   ├── middleware/auth.js      # JWT verification middleware
│   ├── routes/                 # auth.js, transactions.js, analytics.js, budgets.js
│   └── server.js               # Express application entry point
└── legacy-php/                 # Archived original PHP version (demonstrates refactoring!)
```
