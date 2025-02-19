"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardSummary() {
  const [transactions, setTransactions] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categorySummary, setCategorySummary] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);


  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();
      setTransactions(data);

     
      const total = data.reduce((sum, t) => sum + t.amount, 0);
      setTotalExpenses(total);


      const categoryData = data.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
      setCategorySummary(Object.entries(categoryData));

     
      const recent = [...data].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
      setRecentTransactions(recent);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, []);


  const fetchBudgets = useCallback(async () => {
    try {
      const res = await fetch("/api/budgets");
      if (!res.ok) throw new Error("Failed to fetch budgets");

      const data = await res.json();
      setBudgets(data);

    
      const total = data.reduce((sum, b) => sum + (b.budgetAmount || 0), 0);
      setTotalBudget(total);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  }, []);

  useEffect(() => {

    fetchTransactions();
    fetchBudgets();

    const intervalId = setInterval(() => {
      fetchTransactions();
      fetchBudgets();
    }, 1000); 

    return () => clearInterval(intervalId);
  }, [fetchTransactions, fetchBudgets]);

  const remainingBudget = totalBudget - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      {/* Total Expenses Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</CardContent>
      </Card>

      {/* Category Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {categorySummary.map(([category, amount]) => (
              <li key={category} className="flex justify-between">
                <span>{category}</span>
                <span>₹{amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent Transactions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {recentTransactions.map((t) => (
              <li key={t._id} className="flex justify-between">
                <span>{t.description}</span>
                <span>₹{t.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Budget Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            Total Budget: <span className="text-blue-500">₹{totalBudget.toLocaleString()}</span>
          </p>
          <p className="text-lg font-semibold mt-2">
            Expenses: <span className="text-red-500">₹{totalExpenses.toLocaleString()}</span>
          </p>
          <p className="text-lg font-semibold mt-2">
            Remaining:{" "}
            <span className={remainingBudget < 0 ? "text-red-500" : "text-green-500"}>
              ₹{remainingBudget.toLocaleString()}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
