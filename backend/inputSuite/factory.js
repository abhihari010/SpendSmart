import { ManualFactory } from "./manual.js";

export function selectFactory(kind) {
  const k = (kind || "manual").toLowerCase();
  if (k === "receipt") return null; // receipt factory not yet implemented
  if (k === "card") return null; // card factory not yet implemented
  return new ManualFactory();
}
