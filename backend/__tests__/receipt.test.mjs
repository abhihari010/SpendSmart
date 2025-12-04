/**
 * Jest unit tests for ReceiptSource, ReceiptNormalizer, and ReceiptFactory
 * used in the SpendSmart backend.
 */

import {
  ReceiptSource,
  ReceiptNormalizer,
  ReceiptFactory,
} from "../inputSuite/receipt.js";

describe("ReceiptSource", () => {
  test("throws error when file is missing", async () => {
    const src = new ReceiptSource();
    await expect(src.fetch({})).rejects.toThrow("Receipt image file is required");
  });

  test("parses receipt text correctly", () => {
    const src = new ReceiptSource();
    const receiptText = `
      WALMART
      123 Main St
      Date: 11/07/2025
      
      Items:
      Bread     $2.99
      Milk      $3.49
      Eggs      $4.99
      
      Subtotal: $11.47
      Tax:      $0.92
      TOTAL:    $12.39
    `;

    const parsed = src.parseReceiptText(receiptText);

    expect(parsed.date).toBe("2025-11-07");
    expect(parsed.amount).toBe(12.39);
    expect(parsed.merchant.toLowerCase()).toContain("walmart");
    expect(parsed.category).toBe("groceries");
    expect(parsed.note).toBeTruthy();
  });

  test("defaults to today's date when no date found", () => {
    const src = new ReceiptSource();
    const receiptText = `
      STORE NAME
      Total: $25.50
    `;

    const parsed = src.parseReceiptText(receiptText);
    const today = new Date().toISOString().slice(0, 10);

    expect(parsed.date).toBe(today);
    expect(parsed.amount).toBe(25.5);
  });

  test("extracts amount from various formats", () => {
    const src = new ReceiptSource();
    
    const testCases = [
      { text: "TOTAL: $15.99", expected: 15.99 },
      { text: "Amount: 20.50", expected: 20.5 },
      { text: "Total $5.00", expected: 5.0 },
    ];

    testCases.forEach(({ text, expected }) => {
      const parsed = src.parseReceiptText(text);
      expect(parsed.amount).toBe(expected);
    });
  });

  test("infers category from merchant name", () => {
    const src = new ReceiptSource();
    
    const testCases = [
      { merchant: "Walmart Supercenter", expected: "groceries" },
      { merchant: "Starbucks Coffee", expected: "restaurant" },
      { merchant: "Shell Gas Station", expected: "gas" },
      { merchant: "CVS Pharmacy", expected: "pharmacy" },
      { merchant: "Unknown Store", expected: "uncategorized" },
    ];

    testCases.forEach(({ merchant, expected }) => {
      const parsed = src.parseReceiptText(`\n${merchant}\nTotal: $10.00\n`);
      expect(parsed.category).toBe(expected);
    });
  });
});

describe("ReceiptNormalizer", () => {
  test("normalizes raw receipt data into transaction format", () => {
    const normalizer = new ReceiptNormalizer();
    const raw = {
      date: "2025-11-07",
      amount: 25.99,
      category: "groceries",
      merchant: "Walmart",
      rawText: "receipt text",
      note: "Walmart",
    };

    const tx = normalizer.normalize(raw);

    expect(tx).toEqual({
      date: "2025-11-07",
      amount: -25.99, // Expenses are negative
      category: "groceries",
      source: "receipt",
    });
  });

  test("defaults missing fields", () => {
    const normalizer = new ReceiptNormalizer();
    const raw = {
      amount: 10.0,
    };

    const tx = normalizer.normalize(raw);
    const today = new Date().toISOString().slice(0, 10);

    expect(tx.date).toBe(today);
    expect(tx.amount).toBe(-10.0);
    expect(tx.category).toBe("uncategorized");
    expect(tx.source).toBe("receipt");
  });

  test("ensures amount is negative (expense)", () => {
    const normalizer = new ReceiptNormalizer();
    const raw = {
      date: "2025-11-07",
      amount: 15.50,
      category: "restaurant",
    };

    const tx = normalizer.normalize(raw);

    expect(tx.amount).toBeLessThan(0);
    expect(Math.abs(tx.amount)).toBe(15.5);
  });
});

describe("ReceiptFactory", () => {
  test("creates a ReceiptSource and ReceiptNormalizer", () => {
    const factory = new ReceiptFactory();

    const source = factory.makeSource();
    const normalizer = factory.makeNormalizer();

    expect(source).toBeInstanceOf(ReceiptSource);
    expect(normalizer).toBeInstanceOf(ReceiptNormalizer);
  });
});


