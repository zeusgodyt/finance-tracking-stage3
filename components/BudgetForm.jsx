"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; 

export default function BudgetForm({ refresh, setRefresh }) {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetch("/api/budgets")
      .then((res) => res.json())
      .then((data) => setBudgets(data))
      .catch((error) => console.error("Error fetching budgets:", error));
  }, [refresh]);

  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" }); // "Feb"
    const year = now.getFullYear(); 
    return `${month} ${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const month = getCurrentMonthYear();
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, budgetAmount: Number(amount), month }),
      });

      const result = await response.json();
      console.log("Response from server:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to save budget");
      }

      setCategory("");
      setAmount("");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error saving budget:", error.message);
    }
  };

  const handleResetBudgets = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();
  
    try {
      const month = getCurrentMonthYear(); 
      console.log("Resetting budgets for:", month);
  
      const response = await fetch(`/api/budgets?month=${encodeURIComponent(month)}`, {
        method: "DELETE",
      });
  
      const result = await response.json();
      console.log("Reset Response:", result); 
  
      if (!response.ok) {
        throw new Error(result.error || "Failed to reset budgets");
      }
  
     
      setBudgets([]);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error resetting budgets:", error.message);
    }
  };
  



  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-10">Set Category Budget</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          {["Food", "Transport", "Rent", "Shopping", "Entertainment", "Health", "Bills", "Others"].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Budget Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <div className="flex space-x-2">
          <Button type="submit" className="w-full py-3 text-md ">
            Save Budget
          </Button>
          <Button type="button" onClick={handleResetBudgets} className="w-3/4 py-3 text-md bg-red-500 hover:bg-red-600">
            Reset all Budget
          </Button>
        </div>
      </form>
    </div>
  );
}
