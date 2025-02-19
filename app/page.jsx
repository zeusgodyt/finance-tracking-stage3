"use client";

import { useState } from "react";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import ExpenseChart from "@/components/ExpenseChart";
import DashboardSummary from "@/components/DashboardSummary";
import BudgetForm from "@/components/BudgetForm";
import BudgetComparisonChart from "@/components/BudgetComparisonChart";

export default function Home() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      {/* Dashboard Summary (Full Width) */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center">
        Personal Finance Visualizer
      </h1>
      <DashboardSummary refresh={refresh} />

      {/* Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <BudgetForm refresh={refresh} setRefresh={setRefresh} />
        <TransactionForm
          onTransactionAdded={() => setRefresh((prev) => !prev)}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpenseChart refresh={refresh} />
        <BudgetComparisonChart key={refresh} refresh={refresh} />
      </div>

      {/* Transaction List (Full Width at Bottom) */}
      <TransactionList refresh={refresh} />
    </div>
  );
}
