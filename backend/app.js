// Express backend for SpendSmart starter
import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check endpoint
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Backend listening on http://localhost:${PORT}`)
);
