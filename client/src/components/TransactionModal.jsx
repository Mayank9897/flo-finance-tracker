import React, { useState } from "react";
import { X, PlusCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { api } from "../api";

const EXPENSE_CATEGORIES = [
  "🍕 Food & Dining",
  "🚗 Transportation",
  "🛍️ Shopping",
  "💡 Utilities & Bills",
  "🍿 Entertainment",
  "🏥 Health & Medical",
  "📚 Education",
  "📦 Other Expense",
];

const INCOME_CATEGORIES = [
  "💼 Salary",
  "💻 Freelance",
  "📈 Investments",
  "🎁 Gifts",
  "💵 Other Income",
];

export default function TransactionModal({ isOpen, onClose, onTransactionAdded }) {
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentCategories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.createTransaction({
        type,
        category,
        amount: Number(amount),
        date,
        description: description.trim() || "No description",
      });

      // Reset Form
      setAmount("");
      setDescription("");
      onTransactionAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Record</h3>
              <p className="text-xs text-slate-400">Log an income or expense entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Transaction Type Segmented Toggle */}
        <div className="mt-5 grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition ${
              type === "expense"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition ${
              type === "income"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-700"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Category Chips Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Category
            </label>
            <div className="flex flex-wrap gap-2">
              {currentCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                    category === cat
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery store run or Freelance milestone"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{submitting ? "Saving..." : "Save Record"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
