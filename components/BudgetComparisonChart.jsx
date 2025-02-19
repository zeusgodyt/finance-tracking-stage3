"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const REFRESH_DELAY = 1000;

export default function BudgetComparisonChart({ refresh }) {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching budgets...");
        const budgetRes = await fetch("/api/budgets");
        if (!budgetRes.ok) throw new Error("Failed to fetch budgets");
        const budgetData = await budgetRes.json();
        console.log("Budget Data:", budgetData);
        setBudgets(budgetData.data || budgetData);

        console.log("Fetching transactions...");
        const transactionRes = await fetch("/api/transactions");
        if (!transactionRes.ok) throw new Error("Failed to fetch transactions");
        const transactionData = await transactionRes.json();
        console.log("Transaction Data:", transactionData);

        const categoryExpenses = transactionData.reduce((acc, txn) => {
          const category = txn.category?.trim();
          const amount = Number(txn.amount);
          if (!category || isNaN(amount)) return acc;
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        }, {});

        console.log("Processed Expenses:", categoryExpenses);
        setExpenses(categoryExpenses);
      } catch (error) {
        console.error("Error fetching budgets or transactions:", error);
      }
    }

    fetchData();
    const intervalId = setInterval(fetchData, REFRESH_DELAY);
    return () => clearInterval(intervalId);
  }, [refresh]);

  // Ensure valid data before mapping
  const chartData =
    budgets.length > 0
      ? budgets.map((budget) => ({
          category: budget.category.trim(),
          budget: Number(budget.budgetAmount) || 0,
          actual: expenses[budget.category.trim()] || 0, // Ensure this doesn't break
        }))
      : [];

  console.log("Chart Data:", chartData);

  return (
    <div className="h-full min-h-[300px] p-4 bg-white shadow-md rounded-lg flex flex-col">
      <h2 className="text-lg font-bold mb-4">Budget vs Actual Spending</h2>
      <div className="w-full h-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#8884d8" name="Budgeted" barSize={50} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#82ca9d" name="Actual (Spent by me)" barSize={50} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-10">No data available</p>
        )}
      </div>
    </div>
  );
}
