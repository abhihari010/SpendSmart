// Controller that uses the Abstract Factory to fetch & normalize a transaction
import { selectFactory } from "../inputSuite/factory.js";

/**
 * AI-GENERATED (GPT-5 Thinking), 2025-11-07
 * Prompt:
 * Based on the abstract factory pattern design diagram and psuedocode provided
 * in the attached file, can you help me implement an Express controller
 * that uses the abstract factory to fetch and normalize
 * a transaction. Lets start with just the manual input suite.
 *
 *
 * Edits by Abhishek:
 * - Added safer optional chaining and clearer error payload
 */

export async function ingest(req, res) {
  try {
    const suite = (req.query.suite || "manual").toString(); // manual | receipt (not yet implemented) | card (not yet implemented)
    const factory = selectFactory(suite);
    const source = factory.makeSource();
    const raw = await source.fetch(req.body || {}); // may use body for manual
    const normalizer = factory.makeNormalizer();
    const tx = normalizer.normalize(raw);
    return res.json({ suite, raw, normalized: tx });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "ingest failed" });
  }
}
