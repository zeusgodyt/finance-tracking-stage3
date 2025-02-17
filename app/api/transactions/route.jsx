import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

// GET: Fetch transactions
export async function GET() {
  try {
    await connectToDatabase();
    const transactions = await Transaction.find({});
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

// POST: Add a transaction
export async function POST(req) {
  try {
    const { amount, description, date } = await req.json();
    if (!amount || !description || !date) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectToDatabase();
    const newTransaction = await Transaction.create({ amount, description, date });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 });
  }
}
