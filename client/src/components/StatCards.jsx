import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Percent, 
  ArrowUpRight, 
  ArrowDownLeft 
} from "lucide-react";

export default function StatCards({ summary, loading }) {
  const { 
    totalIncome = 0, 
    totalExpense = 0, 
    netBalance = 0, 
    savingsRate = 0,
    totalTransactions = 0
  } = summary || {};

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      title: "Net Balance",
      amount: formatCurrency(netBalance),
      subtext: `${totalTransactions} transactions logged`,
      icon: Wallet,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      accent: netBalance >= 0 ? "text-emerald-400" : "text-rose-400",
    },
    {
      title: "Total Income",
      amount: formatCurrency(totalIncome),
      subtext: "Money in this period",
      icon: ArrowDownLeft,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      accent: "text-emerald-400",
    },
    {
      title: "Total Expenses",
      amount: formatCurrency(totalExpense),
      subtext: "Money spent this period",
      icon: ArrowUpRight,
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      accent: "text-rose-400",
    },
    {
      title: "Savings Rate",
      amount: `${savingsRate}%`,
      subtext: savingsRate >= 20 ? "Healthy savings buffer" : "Below recommended 20%",
      icon: Percent,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      accent: savingsRate >= 20 ? "text-emerald-400" : "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl border ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="h-8 w-28 bg-slate-800 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-white">
                  {card.amount}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
