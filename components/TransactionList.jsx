"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

export default function TransactionList({ refresh }) {
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({ amount: "", description: "", date: "" });

  // Fetch transactions with optimistic updates
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
    // Optimistic update
    setTransactions(prev => prev.filter(t => t._id !== id));
    
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        // Revert on failure
        fetchTransactions();
      }
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
    });
  }, []);

  const handleUpdate = async () => {
    const updatedTransaction = { ...editingTransaction, ...formData };
    
    // Optimistic update
    setTransactions(prev => 
      prev.map(t => t._id === editingTransaction._id ? updatedTransaction : t)
    );
    setEditingTransaction(null);

    try {
      const res = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // Revert on failure
        fetchTransactions();
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      fetchTransactions();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">Transaction List</h2>
      
      {/* Edit Form */}
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
          <div className="flex gap-2">
            <Button onClick={handleUpdate}>Save</Button>
            <Button variant="outline" onClick={() => setEditingTransaction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">{transaction.description}</td>
                <td className="px-6 py-4">₹{transaction.amount}</td>
                <td className="px-6 py-4">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(transaction)}
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(transaction._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
