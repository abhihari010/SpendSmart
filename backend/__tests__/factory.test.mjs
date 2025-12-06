/**
 * AI-GENERATED (GPT-5.1 Thinking), 2025-11-25
 * Prompt:
 * "Write Jest tests for selectFactory that currently returns ManualFactory
 *  for manual/undefined and null for receipt/card."
 */

import { selectFactory } from "../inputSuite/factory.js";
import { ManualFactory } from "../inputSuite/manual.js";

describe("selectFactory", () => {
  test("returns ManualFactory when kind is 'manual'", () => {
    const factory = selectFactory("manual");
    expect(factory).toBeInstanceOf(ManualFactory);
  });

  test("defaults to ManualFactory when kind is undefined", () => {
    const factory = selectFactory(undefined);
    expect(factory).toBeInstanceOf(ManualFactory);
  });

  test("returns null for 'receipt' (not yet implemented)", () => {
    const factory = selectFactory("receipt");
    expect(factory).toBeNull();
  });

  test("returns null for 'card' (not yet implemented)", () => {
    const factory = selectFactory("card");
    expect(factory).toBeNull();
  });
});
