import { connectToDatabase } from "@/lib/mongodb";
import Budget from "@/models/Budget";
import { NextResponse } from "next/server";

// GET: Fetch all budgets
export async function GET() {
  try {
    await connectToDatabase();
    const budgets = await Budget.find({});

    // Normalize category names
    const normalizedBudgets = budgets.map((budget) => ({
      ...budget._doc,
      category: budget.category.trim(), // Trim category names
    }));

    return NextResponse.json(normalizedBudgets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}


// POST: Add or update a budget
export async function POST(req) {
  try {
    const { category, budgetAmount, month } = await req.json();
    if (!category || !budgetAmount || !month) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectToDatabase();
    let budget = await Budget.findOne({ category, month });

    if (budget) {
      budget.budgetAmount = budgetAmount;
      await budget.save();
    } else {
      budget = await Budget.create({ category, budgetAmount, month });
    }

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
  }
}

// DELETE: Remove a budget
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    console.log("🛠 DELETE request received for month:", month);

    if (!month) {
      console.error("🚨 No month provided in DELETE request");
      return NextResponse.json({ error: "Month parameter is required" }, { status: 400 });
    }

    await connectToDatabase();
    console.log("✅ Connected to MongoDB");

    // Fetch existing budgets for debugging
    const existingBudgets = await Budget.find({ month });
    console.log("🔍 Existing budgets found:", existingBudgets);

    if (existingBudgets.length === 0) {
      console.warn("⚠️ No budgets found for the specified month:", month);
      return NextResponse.json({ error: "No budgets found for the specified month" }, { status: 404 });
    }

    // Delete all budgets for the given month
    const result = await Budget.deleteMany({ month });
    console.log("🗑 Deletion result:", result);

    if (result.deletedCount === 0) {
      console.warn("⚠️ Delete operation succeeded but no records were deleted");
      return NextResponse.json({ error: "No budgets were deleted" }, { status: 404 });
    }

    console.log("✅ Budgets successfully deleted for month:", month);
    return NextResponse.json({ message: "Budgets reset successfully" }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in DELETE /api/budgets:", error);
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}

