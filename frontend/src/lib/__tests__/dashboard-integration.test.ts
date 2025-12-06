/**
 * AI-GENERATED_TEST
 * Prompt: "Write an integration test verifying totalIncome, totalExpenses, and balance using calculateTotals"
 */

import { calculateTotals } from "@/components/transaction-provider";

describe("Dashboard totals integration", () => {
  test("income, expenses, and balance update after transactions added", () => {
    const transactions = [
      { id: "1", name: "Paycheck", date: "2025-01-05", category: "Income", amount: 1000 },
      { id: "2", name: "Food", date: "2025-01-06", category: "Food", amount: -50 },
      { id: "3", name: "Clothes", date: "2025-01-07", category: "Shopping", amount: -75 },
    ];

    const totals = calculateTotals(transactions);

    expect(totals.totalIncome).toBe(1000);
    expect(totals.totalExpenses).toBe(125);
    expect(totals.balance).toBe(875);
  });
});
