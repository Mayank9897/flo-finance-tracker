import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import { Wallet } from "lucide-react";

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-pulse">
          <Wallet className="h-6 w-6 text-slate-950 stroke-[2.5]" />
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Initializing Flo Finance...
        </p>
      </div>
    );
  }

  return user ? <Dashboard /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
