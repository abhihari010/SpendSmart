import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import ingestRouter from './routes/ingest.js';
import authRouter from './routes/auth.js';
import { z } from "zod";

dotenv.config();

connectDB();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Initialize in-memory storage
app.locals.tx = [];
app.locals.goals = [];

// Zod schema for a transaction payload
// AI-GENERATED (GPT-5 Thinking), 2025-11-07
// Prompt: "Create a Zod schema for a transaction with date, amount, category,
// and optional source (manual|receipt|card). Coerce amount to number."
const TxSchema = z.object({
  // AI-GENERATED (Cursor AI Assistant), 2025-01-XX
  // Prompt: "Add validation to the date field to ensure it's a valid date and not in the future.
  // The date should be required and must be today or earlier."
  //
  // Modifications by Abhishek:
  // - Added date format validation using .refine() to check if date is parseable
  // - Added future date validation to prevent dates after today
  // - Set today's time to end of day (23:59:59) to allow today's date
  date: z
    .string()
    .min(1, "date is required")
    .refine(
      (dateStr) => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      },
      { message: "date must be a valid date" }
    )
    .refine(
      (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        return date <= today;
      },
      { message: "date cannot be in the future" }
    ),
  amount: z.coerce.number().finite("amount must be a number"),
  category: z.string().min(1, "category is required"),
  description: z.string().optional(),
  source: z.enum(["manual", "receipt", "card"]).optional().default("manual"),
});

// Zod schema for a budgeting goal
const GoalSchema = z.object({
  category: z.string().min(1, "category is required"),
  targetAmount: z.coerce.number().positive("target amount must be positive"),
  startDate: z.string().min(1, "start date is required"),
  endDate: z.string().min(1, "end date is required"),
  period: z.enum(["weekly", "monthly", "custom"]).optional().default("monthly"),
});

/**
 * SpendSmart backend — Express + in-memory storage
 *
 * AI-GENERATED (GPT-5 Thinking), 2025-11-07
 * Prompt:
 * Create a small Express server that exposes /api/health,
 *  POST/GET /api/transactions.
 *  Use CORS, express.json, and morgan('dev'). Store data in memory for now we will
 *  add persistence later. Validate inputs and return 400 on bad input."
 *
 * Edits by Abhi:
 * - Tweaked error messages for clarity
 * - Kept endpoints minimal for milestone demo
 */

// Routes
app.use('/api/ingest', ingestRouter);
app.use('/api/v1/auth', authRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/transactions", (req, res) => {
  // Use Zod to validate and coerce the incoming body
  const parsed = TxSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid transaction payload",
      details: parsed.error.flatten(), // { fieldErrors, formErrors }
    });
  }

  const { date, amount, category, description, source } = parsed.data;

  const record = {
    id: Date.now().toString(),
    date,
    amount,
    category,
    description, // will be included if provided
    source, // will default to "manual" if not provided
  };

  req.app.locals.tx.push(record);
  return res.status(201).json(record);
});

app.get("/api/transactions", (req, res) => {
  const from = req.query.from
    ? new Date(req.query.from)
    : new Date("1970-01-01");
  const to = req.query.to ? new Date(req.query.to) : new Date("2999-12-31");
  const rows = (req.app.locals.tx || []).filter((r) => {
    const d = new Date(r.date);
    return d >= from && d <= to;
  });
  res.json(rows);
});

// beginning of @alexanderpeal's section

/**
 * SpendSmart backend — Routes for spending goals
 * @alexanderpeal
 *
 * AI-GENERATED (Sonnet 4.5), 2025-11-13
 *
 * Prompt 1:
 *
 * Analyze this repo, it's supposed to be a barebones repo for a simple budgeting app.
 * Tell me the existing functionality, and help me implement a simple feature for
 * tracking budgeting goals.
 *
 * (... output suggests creating CRUD endpoints for goals ... )
 *
 * Prompt 2:
 *
 * Show me how to create endpoints based on what you suggested.
 * Maybe have it pull from req.apps.locals.tx.push. Doesn't need to
 * be working code - prioritize simplicity.
 *
 * Follow these guidelines:
 * Create goal: Should be a POST, similar to parsed data in api/transactions
 * Get goals: Return all active goals
 * Update goal: given a goal id, update the goal.
 */
app.post("/api/goals", (req, res) => {
  const parsed = GoalSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid goal payload",
      details: parsed.error.flatten(),
    });
  }

  const { category, targetAmount, startDate, endDate, period } = parsed.data;

  const goal = {
    id: Date.now().toString(),
    category,
    targetAmount,
    startDate,
    endDate,
    period,
    createdAt: new Date().toISOString(),
  };

  // Initialize goals array if it doesn't exist
  if (!req.app.locals.goals) {
    req.app.locals.goals = [];
  }

  req.app.locals.goals.push(goal);
  return res.status(201).json(goal);
});

// GET /api/goals - Get all active goals (goals that overlap with current date)
app.get("/api/goals", (req, res) => {
  const now = new Date();
  const allGoals = req.app.locals.goals || [];

  // Filter to only active goals (current date is between start and end)
  const activeGoals = allGoals.filter((goal) => {
    const start = new Date(goal.startDate);
    const end = new Date(goal.endDate);
    return now >= start && now <= end;
  });

  res.json(activeGoals);
});

// PUT /api/goals/:id - Update an existing goal
app.put("/api/goals/:id", (req, res) => {
  const goalId = req.params.id;
  const goals = req.app.locals.goals || [];

  // Find the goal by ID
  const goalIndex = goals.findIndex((g) => g.id === goalId);

  if (goalIndex === -1) {
    return res.status(404).json({ error: "Goal not found" });
  }

  // Partial validation - only validate fields that are provided
  const updateSchema = GoalSchema.partial();
  const parsed = updateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid update payload",
      details: parsed.error.flatten(),
    });
  }

  // Update the goal with new data
  const updatedGoal = {
    ...goals[goalIndex],
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  goals[goalIndex] = updatedGoal;
  return res.json(updatedGoal);
});

// End of @alexanderpeal's section
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Server Error' 
  });
});

export default app;

// Only start the HTTP server when *not* running tests
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

