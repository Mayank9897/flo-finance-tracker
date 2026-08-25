import React, { useState } from "react";
import { 
  Search, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  Receipt
} from "lucide-react";

export default function TransactionList({
  transactions = [],
  loading,
  onDeleteTransaction,
  onOpenAddModal,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCat, setSelectedCat] = useState("all");

  // Extract unique categories from actual transactions
  const uniqueCategories = Array.from(new Set(transactions.map((t) => t.category)));

  // Filter transactions in memory for ultra-fast UX
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || t.type === selectedType;
    const matchesCat = selectedCat === "all" || t.category === selectedCat;
    return matchesSearch && matchesType && matchesCat;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-400">Manage and inspect all financial records</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-emerald-500/50 transition">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 w-32 sm:w-44"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>

          {/* Category Filter */}
          {uniqueCategories.length > 0 && (
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition max-w-[140px] truncate"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Transactions Table / List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          Fetching records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-500">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">No transactions found</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {transactions.length === 0
                ? "Start by adding your first income or expense entry."
                : "No entries match your current search/filter."}
            </p>
          </div>
          {transactions.length === 0 && (
            <button
              onClick={onOpenAddModal}
              className="mt-2 text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition"
            >
              + Add Transaction
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60 overflow-hidden">
          {filtered.map((item) => {
            const isIncome = item.type === "income";
            return (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-950/40 px-2 rounded-xl transition group"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      isIncome
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {item.description || "No description"}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(item.date)}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Delete Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-sm font-bold tracking-tight ${
                      isIncome ? "text-emerald-400" : "text-slate-200"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </span>

                  <button
                    onClick={() => onDeleteTransaction(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
