// Manual suite: trusts incoming payload and normalizes it
/**
 * AI-GENERATED (GPT-5 Thinking), 2025-11-07
 * Prompt:
 * Based on the abstract factory pattern design diagram and psuedocode provided
 * in the attached file, can you help me implement an Express controller
 * function that uses the abstract factory to fetch and normalize
 * a transaction. Lets start with just the manual input suite.
 *
 *
 * Edits by Abhishek:
 * - Added an uncategorized default category as a temporary measure. Will
 *  require users to define category later.
 */
export class ManualSource {
  async fetch(payload) {
    return {
      date: payload.date || new Date().toISOString().slice(0, 10),
      amount: Number(payload.amount || 0),
      category: payload.category || "uncategorized",
      note: payload.note || "",
    };
  }
}

export class ManualNormalizer {
  normalize(raw) {
    return {
      date: raw.date,
      amount: Number(raw.amount),
      category: raw.category || "uncategorized",
      source: "manual",
    };
  }
}

export class ManualFactory {
  makeSource() {
    return new ManualSource();
  }
  makeNormalizer() {
    return new ManualNormalizer();
  }
}
