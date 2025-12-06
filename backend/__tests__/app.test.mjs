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
  // reset in-memory storage before each test
  app.locals.tx = [];
  app.locals.goals = [];
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

/**
 * Unit tests for spending goals routes
 * @alexanderpeal
 * 
 * AI-GENERATED (GPT-5.1 Thinking), 2025-12-05
 * Prompt:
 * 
 * "Write code creating one unit test for each spending goal route.
 * Add the unit tests in app.test.mjs, which is the most appropiate file, or suggest an alternative. 
 * There should be at least one unit test per function, and at least one integration test incorporating 
 * multiple functions working together"
 *
 * Edits by Alex:
 * - Adjusted test cases to have more relevant information.
 */

describe("POST /api/goals", () => {
  test("creates a valid goal with defaults", async () => {
    const payload = {
      category: "groceries",
      targetAmount: 500,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    };

    const res = await request(app).post("/api/goals").send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      category: "groceries",
      targetAmount: 500,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      period: "monthly", // default from schema
    });
    expect(typeof res.body.id).toBe("string");
    expect(res.body.createdAt).toBeDefined();
  });

  test("creates a goal with custom period", async () => {
    const payload = {
      category: "entertainment",
      targetAmount: 200,
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      period: "weekly",
    };

    const res = await request(app).post("/api/goals").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.period).toBe("weekly");
  });

  test("rejects missing category", async () => {
    const res = await request(app).post("/api/goals").send({
      targetAmount: 500,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid goal payload");
    expect(res.body.details.fieldErrors.category).toBeDefined();
  });

  test("rejects non-positive targetAmount", async () => {
    const res = await request(app).post("/api/goals").send({
      category: "groceries",
      targetAmount: -100,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });

    expect(res.status).toBe(400);
    expect(res.body.details.fieldErrors.targetAmount).toBeDefined();
  });
});

describe("GET /api/goals", () => {
  const fmt = (d) => d.toISOString().slice(0, 10);

  test("returns only active goals (overlapping current date)", async () => {
    const now = new Date();
    const pastStart = new Date(now);
    pastStart.setMonth(now.getMonth() - 1);
    const futureEnd = new Date(now);
    futureEnd.setMonth(now.getMonth() + 1);

    // Active goal (current date is within range)
    await request(app).post("/api/goals").send({
      category: "active-goal",
      targetAmount: 100,
      startDate: fmt(pastStart),
      endDate: fmt(futureEnd),
    });

    // Expired goal (ended in the past)
    const pastEnd = new Date(now);
    pastEnd.setMonth(now.getMonth() - 1);
    const oldStart = new Date(now);
    oldStart.setMonth(now.getMonth() - 2);

    await request(app).post("/api/goals").send({
      category: "expired-goal",
      targetAmount: 200,
      startDate: fmt(oldStart),
      endDate: fmt(pastEnd),
    });

    const res = await request(app).get("/api/goals");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe("active-goal");
  });

  test("returns empty array when no active goals exist", async () => {
    // Add only a future goal
    const futureStart = new Date();
    futureStart.setMonth(futureStart.getMonth() + 1);
    const futureEnd = new Date();
    futureEnd.setMonth(futureEnd.getMonth() + 2);

    await request(app).post("/api/goals").send({
      category: "future-goal",
      targetAmount: 300,
      startDate: fmt(futureStart),
      endDate: fmt(futureEnd),
    });

    const res = await request(app).get("/api/goals");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("PUT /api/goals/:id", () => {
  test("successfully updates an existing goal", async () => {
    // Create a goal first
    const createRes = await request(app).post("/api/goals").send({
      category: "groceries",
      targetAmount: 500,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });
    const goalId = createRes.body.id;

    // Update the goal
    const updateRes = await request(app).put(`/api/goals/${goalId}`).send({
      targetAmount: 750,
      category: "food",
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.targetAmount).toBe(750);
    expect(updateRes.body.category).toBe("food");
    expect(updateRes.body.startDate).toBe("2025-01-01"); // unchanged
    expect(updateRes.body.updatedAt).toBeDefined();
  });

  test("returns 404 for non-existent goal", async () => {
    const res = await request(app).put("/api/goals/nonexistent-id").send({
      targetAmount: 100,
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Goal not found");
  });

  test("rejects invalid update payload", async () => {
    // Create a goal first
    const createRes = await request(app).post("/api/goals").send({
      category: "groceries",
      targetAmount: 500,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });
    const goalId = createRes.body.id;

    // Try to update with invalid targetAmount
    const updateRes = await request(app).put(`/api/goals/${goalId}`).send({
      targetAmount: -50,
    });

    expect(updateRes.status).toBe(400);
    expect(updateRes.body.error).toBe("Invalid update payload");
  });
});

describe("Goals Integration", () => {
  const fmt = (d) => d.toISOString().slice(0, 10);

  test("full CRUD workflow: create, retrieve, update goal", async () => {
    const now = new Date();
    const pastStart = new Date(now);
    pastStart.setMonth(now.getMonth() - 1);
    const futureEnd = new Date(now);
    futureEnd.setMonth(now.getMonth() + 1);

    // Step 1: Create a goal
    const createRes = await request(app).post("/api/goals").send({
      category: "dining",
      targetAmount: 300,
      startDate: fmt(pastStart),
      endDate: fmt(futureEnd),
    });

    expect(createRes.status).toBe(201);
    const goalId = createRes.body.id;

    // Step 2: Retrieve and verify it appears in active goals
    const getRes = await request(app).get("/api/goals");

    expect(getRes.status).toBe(200);
    expect(getRes.body.length).toBe(1);
    expect(getRes.body[0].id).toBe(goalId);
    expect(getRes.body[0].category).toBe("dining");

    // Step 3: Update the goal
    const updateRes = await request(app).put(`/api/goals/${goalId}`).send({
      targetAmount: 400,
      period: "weekly",
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.targetAmount).toBe(400);
    expect(updateRes.body.period).toBe("weekly");
    expect(updateRes.body.category).toBe("dining"); // unchanged

    // Step 4: Verify updated goal is still active
    const finalGetRes = await request(app).get("/api/goals");

    expect(finalGetRes.status).toBe(200);
    expect(finalGetRes.body.length).toBe(1);
    expect(finalGetRes.body[0].targetAmount).toBe(400);
  });
});
