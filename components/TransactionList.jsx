"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

export default function TransactionList({ refresh }) {
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: "",
    category: "",
  });

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [refresh, fetchTransactions]);

  const handleDelete = async (id) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      fetchTransactions();
    }
  };

  const handleEdit = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split("T")[0],
      category: transaction.category || "",
    });
  }, []);

  const handleUpdate = async () => {
    const updatedTransaction = { ...editingTransaction, ...formData };
    setTransactions((prev) =>
      prev.map((t) => (t._id === editingTransaction._id ? updatedTransaction : t))
    );
    setEditingTransaction(null);
    try {
      const res = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      fetchTransactions();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-xl ">
      <h2 className="text-xl font-bold mb-4 text-center">Transaction List</h2>

      {editingTransaction && (
        <div className="mb-4 p-4 border rounded">
          <h3 className="text-lg font-semibold mb-2">Edit Transaction</h3>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
            placeholder="Amount"
          />
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
            placeholder="Description"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>

          <div className="flex gap-2">
            <Button onClick={handleUpdate}>Save</Button>
            <Button variant="outline" onClick={() => setEditingTransaction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
              <p className="text-lg font-semibold">{transaction.description}</p>
              <p className="text-sm text-gray-700">Category: {transaction.category || "Uncategorized"}</p>
              <p className="text-xl font-bold">₹{transaction.amount}</p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button variant="outline" onClick={() => handleEdit(transaction)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(transaction._id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
