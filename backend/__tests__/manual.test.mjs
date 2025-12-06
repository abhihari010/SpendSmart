/**
 * AI-GENERATED (GPT-5.1 Thinking), 2025-11-25
 * Prompt:
 * "Write Jest unit tests for ManualSource, ManualNormalizer, and ManualFactory
 *  used in the SpendSmart backend."
 *
 * Edits by Abhishek:
 * - Adjusted expectations to match defaults (uncategorized, note = '').
 */

import {
  ManualSource,
  ManualNormalizer,
  ManualFactory,
} from "../inputSuite/manual.js";

describe("ManualSource", () => {
  test("uses payload values when provided", async () => {
    const src = new ManualSource();
    const payload = {
      date: "2025-11-07",
      amount: 12.34,
      category: "groceries",
      note: "weekly shopping",
    };

    const raw = await src.fetch(payload);

    expect(raw).toEqual({
      date: "2025-11-07",
      amount: 12.34,
      category: "groceries",
      note: "weekly shopping",
    });
  });

  test("applies default values when fields are missing", async () => {
    const src = new ManualSource();
    const raw = await src.fetch({}); // empty payload

    expect(typeof raw.date).toBe("string");
    expect(raw.date).toHaveLength(10); // YYYY-MM-DD
    expect(raw.amount).toBe(0);
    expect(raw.category).toBe("uncategorized");
    expect(raw.note).toBe("");
  });
});

describe("ManualNormalizer", () => {
  test("normalizes raw object into transaction format", () => {
    const normalizer = new ManualNormalizer();
    const raw = {
      date: "2025-11-07",
      amount: "15.50",
      category: "coffee",
      note: "morning drink",
    };

    const tx = normalizer.normalize(raw);

    expect(tx).toEqual({
      date: "2025-11-07",
      amount: 15.5,
      category: "coffee",
      source: "manual",
    });
  });

  test("defaults missing category to 'uncategorized'", () => {
    const normalizer = new ManualNormalizer();
    const raw = {
      date: "2025-11-07",
      amount: 9.99,
      category: undefined,
    };

    const tx = normalizer.normalize(raw);

    expect(tx.category).toBe("uncategorized");
    expect(tx.source).toBe("manual");
  });
});

describe("ManualFactory", () => {
  test("creates a ManualSource and ManualNormalizer", () => {
    const factory = new ManualFactory();

    const source = factory.makeSource();
    const normalizer = factory.makeNormalizer();

    expect(source).toBeInstanceOf(ManualSource);
    expect(normalizer).toBeInstanceOf(ManualNormalizer);
  });
});
