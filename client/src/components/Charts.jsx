import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, PieChart as PieIcon } from "lucide-react";

const COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
  "#64748b", // Slate
];

// Custom Dark Tooltip
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
        <p className="font-semibold text-slate-200 mb-1.5">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="capitalize">{entry.name}:</span>
            <span className="font-bold text-white">
              ₹{Number(entry.value).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function Charts({ monthlyData = [], categoryData = [], loading }) {
  const formattedCategoryData = categoryData.map((item) => ({
    name: item.category,
    value: Number(item.total),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Cashflow Comparison (Bar Chart) - Spans 2 Cols */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Cashflow Dynamics</h3>
          </div>
          <span className="text-xs text-slate-400">Past 6 Months Overview</span>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            Loading chart data...
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No transaction records to display.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Expense Category Breakdown (Donut Chart) - Spans 1 Col */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Expense by Category</h3>
          </div>
          <span className="text-xs text-slate-400">Distribution</span>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            Loading chart...
          </div>
        ) : formattedCategoryData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No expenses logged this month.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {formattedCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}
