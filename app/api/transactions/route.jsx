import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

// GET: Fetch transactions
export async function GET() {
  try {
    await connectToDatabase();
    const transactions = await Transaction.find({});


    const normalizedTransactions = transactions.map((txn) => ({
      ...txn._doc,
      category: txn.category.trim(),
    }));

    return NextResponse.json(normalizedTransactions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}


// POST: Add a transaction
export async function POST(req) {
  try {
    const { amount, description, date, category } = await req.json();

    // Validate required fields
    if (!amount || !description || !date || !category) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Validate category
    const validCategories = ["Food", "Transport", "Rent", "Shopping", "Entertainment", "Health", "Bills", "Others"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    await connectToDatabase();
    const newTransaction = await Transaction.create({ amount, description, date, category });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 });
  }
}
