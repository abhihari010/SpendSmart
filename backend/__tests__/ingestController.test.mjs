/**
 * AI-GENERATED (GPT-5.1 Thinking), 2025-11-25
 * Prompt:
 * "Write Jest tests for an Express-style ingest(req,res) controller that uses
 *  the real selectFactory implementation. Test manual suite success and
 *  unsupported suite error."
 *
 * Edits by Abhishek:
 * - Removed mocking to avoid ESM read-only export issues.
 */

import { ingest } from "../controllers/ingestController.js";

function createMockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

describe("ingest controller", () => {
  test("returns normalized transaction for manual suite", async () => {
    const req = {
      query: { suite: "manual" },
      body: { date: "2025-11-07", amount: 10, category: "snacks" },
    };
    const res = createMockRes();

    await ingest(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.suite).toBe("manual");
    expect(res.body.normalized).toEqual({
      date: "2025-11-07",
      amount: 10,
      category: "snacks",
      source: "manual",
    });
  });

  test("returns 500 when suite is unsupported (receipt)", async () => {
    const req = {
      query: { suite: "receipt" }, // selectFactory('receipt') -> null, causes failure
      body: {},
    };
    const res = createMockRes();

    await ingest(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});
