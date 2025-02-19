import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ["Food", "Transport", "Rent", "Shopping", "Entertainment", "Health", "Bills", "Others"] 
  }
});

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
export default Transaction;
