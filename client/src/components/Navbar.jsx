import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Wallet, 
  LogOut, 
  Calendar, 
  PlusCircle, 
  Sliders, 
  User as UserIcon 
} from "lucide-react";

export default function Navbar({ 
  selectedMonth, 
  onMonthChange, 
  onOpenAddModal, 
  onOpenBudgetModal 
}) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">FLO</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                  FINANCE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Personal Wealth & Expense Tracker</p>
            </div>
          </div>

          {/* Controls: Month Selector & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Month Filter */}
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-emerald-500/50 transition">
              <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Set Budget Button */}
            <button
              onClick={onOpenBudgetModal}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition"
              title="Manage Category Budgets"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Budgets</span>
            </button>

            {/* Add Transaction Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Record</span>
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center pl-2 border-l border-slate-800 gap-2">
              <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-200 uppercase">
                {user?.name ? user.name.charAt(0) : <UserIcon className="w-4 h-4" />}
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
