// Centralized API Client

const API_BASE = "/api";

function getAuthHeader() {
  const token = localStorage.getItem("flo_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

export const api = {
  // Auth
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getMe: () => request("/auth/me"),

  // Transactions
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append("type", filters.type);
    if (filters.category) params.append("category", filters.category);
    if (filters.search) params.append("search", filters.search);
    if (filters.month) params.append("month", filters.month);
    return request(`/transactions?${params.toString()}`);
  },
  createTransaction: (tx) =>
    request("/transactions", { method: "POST", body: JSON.stringify(tx) }),
  deleteTransaction: (id) =>
    request(`/transactions/${id}`, { method: "DELETE" }),

  // Analytics
  getSummary: (month) =>
    request(`/analytics/summary${month ? `?month=${month}` : ""}`),
  getCategoryBreakdown: (month, type = "expense") =>
    request(`/analytics/categories?type=${type}${month ? `&month=${month}` : ""}`),
  getMonthlyTrend: () =>
    request("/analytics/monthly-trend"),

  // Budgets
  getBudgets: (month) =>
    request(`/budgets${month ? `?month=${month}` : ""}`),
  saveBudget: (budget) =>
    request("/budgets", { method: "POST", body: JSON.stringify(budget) }),
};
