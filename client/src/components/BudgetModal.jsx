import React, { useState } from "react";
import { X, Target, Save } from "lucide-react";
import { api } from "../api";

const CATEGORIES = [
  "🍕 Food & Dining",
  "🚗 Transportation",
  "🛍️ Shopping",
  "💡 Utilities & Bills",
  "🍿 Entertainment",
  "🏥 Health & Medical",
  "📚 Education",
  "📦 Other Expense",
];

export default function BudgetModal({ isOpen, onClose, selectedMonth, onBudgetSaved }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!limitAmount || Number(limitAmount) <= 0) {
      setError("Please enter a valid monthly limit amount.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await api.saveBudget({
        category,
        limit_amount: Number(limitAmount),
        month: selectedMonth,
      });
      setLimitAmount("");
      onBudgetSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Set Category Budget</h3>
              <p className="text-xs text-slate-400">Month: {selectedMonth}</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Monthly Limit (₹)
            </label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 5000"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
              required
            />
          </div>

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
              disabled={saving}
              className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Budget"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
