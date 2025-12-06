/**
 * AI-GENERATED (GPT-5.1 Thinking), 2025-11-25
 * Prompt:
 * "Write Jest + Supertest tests for /api/health and /api/transactions
 *  for the SpendSmart backend. Validate Zod rules including date,
 *  invalid payloads, and range filtering."
 *
 * Edits by Abhishek:
 * - Adjusted expectations to match our exact schema and defaults.
 */

import request from "supertest";
import app from "../app.js";

beforeEach(() => {
  // reset in-memory transactions before each test
  app.locals.tx = [];
});

describe("GET /api/health", () => {
  test("returns ok: true", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("POST /api/transactions", () => {
  test("creates a valid transaction", async () => {
    const payload = {
      date: "2025-11-07",
      amount: 25.5,
      category: "groceries",
    };

    const res = await request(app).post("/api/transactions").send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      date: "2025-11-07",
      amount: 25.5,
      category: "groceries",
      source: "manual", // default from schema
    });
    expect(typeof res.body.id).toBe("string");
  });

  test("rejects missing date", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .send({ amount: 10, category: "snacks" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid transaction payload");
    expect(res.body.details.fieldErrors.date).toBeDefined();
  });

  test("rejects invalid date format", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .send({ date: "not-a-date", amount: 10, category: "snacks" });

    expect(res.status).toBe(400);
    const msgs = res.body.details.fieldErrors.date || [];
    expect(msgs.join(" ")).toMatch(/valid date/i);
  });

  test("rejects future date", async () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const futureStr = future.toISOString().slice(0, 10);

    const res = await request(app)
      .post("/api/transactions")
      .send({ date: futureStr, amount: 10, category: "snacks" });

    expect(res.status).toBe(400);
    const msgs = res.body.details.fieldErrors.date || [];
    expect(msgs.join(" ")).toMatch(/future/i);
  });
});

describe("GET /api/transactions", () => {
  const fmt = (d) => d.toISOString().slice(0, 10);

  test("returns all transactions when no range is provided", async () => {
    const today = new Date();
    const todayStr = fmt(today);

    // seed two valid transactions on the same (non-future) day
    await request(app).post("/api/transactions").send({
      date: todayStr,
      amount: 10,
      category: "test1",
    });
    await request(app).post("/api/transactions").send({
      date: todayStr,
      amount: 20,
      category: "test2",
    });

    const res = await request(app).get("/api/transactions");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test("filters transactions by date range", async () => {
    const now = new Date();

    const oldDate = new Date(now);
    oldDate.setDate(now.getDate() - 40); // outside range (too old)

    const midDate = new Date(now);
    midDate.setDate(now.getDate() - 10); // inside range

    const oldStr = fmt(oldDate);
    const midStr = fmt(midDate);
    const nowStr = fmt(now);

    // transaction outside range
    await request(app).post("/api/transactions").send({
      date: oldStr,
      amount: 10,
      category: "out-of-range",
    });

    // transaction inside range
    await request(app).post("/api/transactions").send({
      date: midStr,
      amount: 20,
      category: "in-range",
    });

    const res = await request(app).get(
      `/api/transactions?from=${midStr}&to=${nowStr}`
    );

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].date).toBe(midStr);
    expect(res.body[0].category).toBe("in-range");
  });
});
