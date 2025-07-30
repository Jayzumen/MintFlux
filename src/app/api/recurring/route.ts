import { NextRequest, NextResponse } from "next/server";
import { recurringProcessor } from "@/src/lib/recurring-processor";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Process recurring transactions for the specified user
    await recurringProcessor.processRecurringTransactions(userId);

    return NextResponse.json({
      success: true,
      message: "Recurring transactions processed successfully",
    });
  } catch (error) {
    console.error("Error processing recurring transactions:", error);
    return NextResponse.json(
      { error: "Failed to process recurring transactions" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Recurring transaction processor API",
    endpoints: {
      POST: "Process recurring transactions for a user",
    },
  });
}
