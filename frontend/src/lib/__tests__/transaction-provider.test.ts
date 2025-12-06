/**
 * AI-GENERATED_TEST
 * Prompt: "Write a unit test for normalizeTransaction to verify amount is normalized and date is returned correctly"
 */

import { normalizeTransaction } from "@/components/transaction-provider";

describe("normalizeTransaction", () => {
  test("correctly normalizes amount and returns date", () => {
    const input = {
      name: "Test Expense",
      date: "2025-01-10",
      category: "Food",
      amount: -20,
    };

    const result = normalizeTransaction(input);

    expect(result.name).toBe("Test Expense");
    expect(result.category).toBe("Food");
    expect(result.amount).toBe(-20);
    expect(result.date).toBe("2025-01-10");
  });
});
