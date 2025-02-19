"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

const REFRESH_DELAY = 100;

export default function Charts({ refresh }) {
  const [chartType, setChartType] = useState("bar"); // Default: Bar Chart
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const transactions = await res.json();

      // Group transactions by month
      const monthlyGrouped = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString("default", { month: "short" });
        acc[month] = (acc[month] || 0) + t.amount;
        return acc;
      }, {});

      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyChartData = monthOrder
        .filter((m) => monthlyGrouped[m])
        .map((month) => ({ month, amount: monthlyGrouped[month] }));

      setMonthlyData(monthlyChartData);

      // Group transactions by category
      const categoryGrouped = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

      const categoryChartData = Object.entries(categoryGrouped).map(([category, amount]) => ({
        name: category,
        value: amount,
      }));

      setCategoryData(categoryChartData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    const intervalId = setInterval(fetchTransactions, REFRESH_DELAY);
    return () => clearInterval(intervalId);
  }, [fetchTransactions, refresh]);

  const COLORS = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF9833"];

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Expense Analytics</h2>

      {/* Dropdown to select chart type */}
      <div className="mb-4">
        <label htmlFor="chartType" className="mr-2 font-semibold">Select Chart:</label>
        <select
          id="chartType"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="bar">Monthly Expenses (Bar Chart)</option>
          <option value="pie">Category-wise Expenses (Pie Chart)</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        {chartType === "bar" ? (
          <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 14 }} />
            <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} />
            <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]} />
            <Legend />
            <Bar dataKey="amount" fill="#4F46E5" barSize={60} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
