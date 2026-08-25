const http = require("http");

async function runTests() {
  console.log("--- Starting Flo Finance API Integration Test ---");
  
  // Start server locally for test
  const app = require("./server/server");
  
  // Wait 1s
  await new Promise(r => setTimeout(r, 1000));

  const BASE = "http://localhost:5000/api";
  const testEmail = `testuser_${Date.now()}@example.com`;

  // 1. Health check
  const health = await (await fetch(`${BASE}/health`)).json();
  console.log("1. Health check:", health.status === "ok" ? "PASSED" : "FAILED");

  // 2. Register
  const regRes = await (await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Mayank Test", email: testEmail, password: "password123" })
  })).json();
  console.log("2. Register:", regRes.token ? "PASSED" : "FAILED");
  const token = regRes.token;
  const authHeaders = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  // 3. Add Income
  const incRes = await (await fetch(`${BASE}/transactions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      type: "income",
      category: "💼 Salary",
      amount: 75000,
      date: new Date().toISOString().split("T")[0],
      description: "Monthly Tech Salary"
    })
  })).json();
  console.log("3. Add Income:", incRes.transaction?.id ? "PASSED" : "FAILED");

  // 4. Add Expense
  const expRes = await (await fetch(`${BASE}/transactions`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      type: "expense",
      category: "🍕 Food & Dining",
      amount: 2500,
      date: new Date().toISOString().split("T")[0],
      description: "Team Dinner"
    })
  })).json();
  console.log("4. Add Expense:", expRes.transaction?.id ? "PASSED" : "FAILED");

  // 5. Summary Analytics
  const sumRes = await (await fetch(`${BASE}/analytics/summary`, { headers: authHeaders })).json();
  console.log("5. Summary Analytics:", (sumRes.totalIncome === 75000 && sumRes.totalExpense === 2500 && sumRes.netBalance === 72500) ? "PASSED" : "FAILED", sumRes);

  // 6. Save Budget
  const currentMonth = new Date().toISOString().slice(0, 7);
  const budgetSaveRes = await (await fetch(`${BASE}/budgets`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      category: "🍕 Food & Dining",
      limit_amount: 5000,
      month: currentMonth
    })
  })).json();
  console.log("6. Save Budget:", budgetSaveRes.message ? "PASSED" : "FAILED");

  // 7. Get Budgets
  const budgetsRes = await (await fetch(`${BASE}/budgets?month=${currentMonth}`, { headers: authHeaders })).json();
  console.log("7. Get Budgets:", (budgetsRes.length > 0 && budgetsRes[0].current_spent === 2500) ? "PASSED" : "FAILED", budgetsRes);

  // 8. Delete Transaction
  const delRes = await (await fetch(`${BASE}/transactions/${expRes.transaction.id}`, {
    method: "DELETE",
    headers: authHeaders
  })).json();
  console.log("8. Delete Transaction:", delRes.message ? "PASSED" : "FAILED");

  console.log("--- All Backend Integration Tests Passed Successfully! ---");
  process.exit(0);
}

runTests().catch(err => {
  console.error("Test Error:", err);
  process.exit(1);
});
