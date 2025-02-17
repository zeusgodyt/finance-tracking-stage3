"use client";

import { useState } from "react";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import ExpenseChart from "@/components/ExpenseChart";

export default function Home() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Transaction Tracking</h1>
      <div className="max-w-3xl mx-auto space-y-4">
      <TransactionForm onTransactionAdded={() => setRefresh((prev) => !prev)} />
        <TransactionList refresh={refresh} />
        <ExpenseChart refresh={refresh} />
      </div>
    </div>
  );
}
