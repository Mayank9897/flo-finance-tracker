import React from "react";
import { Target, AlertTriangle, Plus, CheckCircle2 } from "lucide-react";

export default function BudgetSection({ budgets = [], onOpenBudgetModal }) {
  if (budgets.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Monthly Budgets</h3>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <Plus className="w-4 h-4" /> Set Limit
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          No budget limits configured for this month. Set monthly spending targets to keep your expenses in check.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">Monthly Category Budgets</h3>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          <Plus className="w-4 h-4" /> Adjust Limits
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const percent = Math.min(Math.round((b.current_spent / b.limit_amount) * 100), 100);
          const isExceeded = b.current_spent > b.limit_amount;
          const isWarning = !isExceeded && percent >= 80;

          let barColor = "bg-emerald-500";
          if (isExceeded) barColor = "bg-rose-500";
          else if (isWarning) barColor = "bg-amber-500";

          return (
            <div
              key={b.id}
              className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {b.category}
                </span>
                <span className="text-xs text-slate-400">
                  {percent}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Spent: <span className="font-semibold text-white">₹{b.current_spent.toLocaleString("en-IN")}</span>
                </span>
                <span className="text-slate-400">
                  Limit: <span className="font-semibold text-slate-300">₹{b.limit_amount.toLocaleString("en-IN")}</span>
                </span>
              </div>

              {isExceeded && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Exceeded by ₹{(b.current_spent - b.limit_amount).toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
