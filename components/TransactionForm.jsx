"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["Food", "Transport", "Rent", "Shopping", "Entertainment", "Health", "Bills", "Others"];

export default function TransactionForm({ onTransactionAdded }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(""); 
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !description || !date || !category) {
      setError("All fields are required");
      return;
    }

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), description, date, category }),
    });

    if (res.ok) {
      setAmount("");
      setDescription("");
      setDate("");
      setCategory("");
      onTransactionAdded(); 
    } else {
      console.error("Failed to add transaction");
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-2">Add Transaction</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        
        {/* Category Dropdown */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full">
          Add Transaction
        </Button>
      </form>
    </div>
  );
}
