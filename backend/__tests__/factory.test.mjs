/**
 * AI-GENERATED (GPT-5.1 Thinking), 2025-11-25
 * Prompt:
 * "Write Jest tests for selectFactory that currently returns ManualFactory
 *  for manual/undefined and null for receipt/card."
 * 
 * Updated to reflect receipt factory implementation
 */

import { selectFactory } from "../inputSuite/factory.js";
import { ManualFactory } from "../inputSuite/manual.js";
import { ReceiptFactory } from "../inputSuite/receipt.js";

describe("selectFactory", () => {
  test("returns ManualFactory when kind is 'manual'", () => {
    const factory = selectFactory("manual");
    expect(factory).toBeInstanceOf(ManualFactory);
  });

  test("defaults to ManualFactory when kind is undefined", () => {
    const factory = selectFactory(undefined);
    expect(factory).toBeInstanceOf(ManualFactory);
  });

  test("returns ReceiptFactory when kind is 'receipt'", () => {
    const factory = selectFactory("receipt");
    expect(factory).toBeInstanceOf(ReceiptFactory);
  });

  test("returns null for 'card' (not yet implemented)", () => {
    const factory = selectFactory("card");
    expect(factory).toBeNull();
  });
});
