"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const REFRESH_DELAY = 1000; // 1 second delay for refresh

export default function ExpenseChart({ refresh }) {
  const [data, setData] = useState([]);

  // Fetch transactions and update chart
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const transactions = await res.json();

      // Group by month
      const grouped = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString("default", { month: "short" });
        acc[month] = (acc[month] || 0) + t.amount;
        return acc;
      }, {});

      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const chartData = monthOrder
        .filter((m) => grouped[m])
        .map((month) => ({ month, amount: grouped[month] }));

      setData(chartData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, []);

  // Effect for initial load and refresh
  useEffect(() => {
    // Initial fetch
    fetchTransactions();

    // Set up refresh interval
    const intervalId = setInterval(fetchTransactions, REFRESH_DELAY);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchTransactions, refresh]); // Re-run when refresh prop changes

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-4">
      <h2 className="text-xl font-bold mt-6 mb-2">Monthly Expenses</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 14 }} />
          <YAxis 
            tick={{ fontSize: 14 }} 
            tickFormatter={(value) => `₹${value.toLocaleString()}`} 
          />
          <Tooltip 
            formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]}
            contentStyle={{ fontSize: 14 }}
          />
          <Bar 
            dataKey="amount" 
            fill="#4F46E5" 
            barSize={60}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
