// Express backend for SpendSmart starter
import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/ingest", ingestRouter);
import { z } from "zod";

// Zod schema for a transaction payload
// AI-GENERATED (GPT-5 Thinking), 2025-11-07
// Prompt: "Create a Zod schema for a transaction with date, amount, category,
// and optional source (manual|receipt|card). Coerce amount to number."
const TxSchema = z.object({
  date: z.string().min(1, "date is required"),
  amount: z.coerce.number().finite("amount must be a number"),
  category: z.string().min(1, "category is required"),
  source: z.enum(["manual", "receipt", "card"]).optional().default("manual"),
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

  const { date, amount, category, source } = parsed.data;

  const record = {
    id: Date.now().toString(),
    date,
    amount,
    category,
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Backend listening on http://localhost:${PORT}`)
);
