import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import Navbar from "../components/Navbar";
import StatCards from "../components/StatCards";
import Charts from "../components/Charts";
import BudgetSection from "../components/BudgetSection";
import TransactionList from "../components/TransactionList";
import TransactionModal from "../components/TransactionModal";
import BudgetModal from "../components/BudgetModal";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // format: YYYY-MM
  );

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Fetch all dashboard data concurrently
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, txRes, catRes, trendRes, budgetRes] = await Promise.all([
        api.getSummary(selectedMonth),
        api.getTransactions({ month: selectedMonth }),
        api.getCategoryBreakdown(selectedMonth, "expense"),
        api.getMonthlyTrend(),
        api.getBudgets(selectedMonth),
      ]);

      setSummary(sumRes);
      setTransactions(txRes);
      setCategoryData(catRes);
      setMonthlyTrend(trendRes);
      setBudgets(budgetRes);
    } catch (err) {
      console.error("Dashboard Load Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Delete Transaction Handler
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.deleteTransaction(id);
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. Stat Summary Cards */}
        <StatCards summary={summary} loading={loading} />

        {/* 2. Charts (Cashflow Trends + Donut Categories) */}
        <Charts
          monthlyData={monthlyTrend}
          categoryData={categoryData}
          loading={loading}
        />

        {/* 3. Category Budgets & Spending Limits */}
        <BudgetSection
          budgets={budgets}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* 4. Filterable & Searchable Transactions */}
        <TransactionList
          transactions={transactions}
          loading={loading}
          onDeleteTransaction={handleDeleteTransaction}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTransactionAdded={loadDashboardData}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        selectedMonth={selectedMonth}
        onBudgetSaved={loadDashboardData}
      />
    </div>
  );
}
