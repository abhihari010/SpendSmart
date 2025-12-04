import { ManualFactory } from "./manual.js";
import { ReceiptFactory } from "./receipt.js";

export function selectFactory(kind) {
  const k = (kind || "manual").toLowerCase();
  if (k === "receipt") return new ReceiptFactory();
  if (k === "card") return null; // card factory not yet implemented
  return new ManualFactory();
}
