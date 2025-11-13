// Express backend for SpendSmart starter
import express from "express";
import cors from "cors";
import morgan from "morgan";
import ingestRouter from "./routes/ingest.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/ingest", ingestRouter);

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
  const { date, amount, category } = req.body || {};
  if (!date || typeof amount !== "number" || !category) {
    return res
      .status(400)
      .json({ error: "date, amount(number), category required" });
  }
  const record = {
    id: Date.now().toString(),
    date,
    amount,
    category,
    source: "manual",
  };
  req.app.locals.tx.push(record);
  res.status(201).json(record);
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
