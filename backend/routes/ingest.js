import { Router } from "express";
import { ingest } from "../controllers/ingestController.js";

const r = Router();

// POST /api/ingest?suite=manual|receipt|card
r.post("/", ingest);

export default r;
