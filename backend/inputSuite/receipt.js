// Receipt suite: processes image uploads and extracts transaction data via OCR
/**
 * Receipt scanning implementation for SpendSmart
 * Uses OCR to extract transaction details from receipt images
 */

import { createWorker } from "tesseract.js";

export class ReceiptSource {
  /**
   * Fetches receipt data from an uploaded image file
   * @param {Object} payload - Contains the uploaded file (req.file from multer)
   * @returns {Promise<Object>} Raw OCR-extracted data
   */
  async fetch(payload) {
    if (!payload || !payload.file) {
      throw new Error("Receipt image file is required");
    }

    const { file } = payload;
    
    // Perform OCR on the image using Tesseract.js
    const worker = await createWorker("eng");
    try {
      const { data: { text } } = await worker.recognize(
        file.buffer || file.path
      );
      
      // Extract structured data from OCR text
      return this.parseReceiptText(text);
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Parses OCR text to extract receipt information
   * @param {string} text - Raw OCR text from receipt
   * @returns {Object} Parsed receipt data
   */
  parseReceiptText(text) {
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
    
    // Try to extract date (common formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
    let date = null;
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,   // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/,   // MM-DD-YYYY or DD-MM-YYYY
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          // Try to parse and format as YYYY-MM-DD
          try {
            const dateStr = match[0];
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              date = parsed.toISOString().slice(0, 10);
              break;
            }
          } catch (e) {
            // Continue searching
          }
        }
      }
      if (date) break;
    }

    // Default to today if no date found
    if (!date) {
      date = new Date().toISOString().slice(0, 10);
    }

    // Try to extract total amount (look for patterns like $XX.XX, TOTAL: $XX.XX, etc.)
    let amount = 0;
    const amountPatterns = [
      /total[:\s]*\$?(\d+\.?\d*)/i,
      /amount[:\s]*\$?(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)/,
      /(\d+\.\d{2})/,
    ];

    // Search from bottom to top (totals usually at bottom)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      for (const pattern of amountPatterns) {
        const match = line.match(pattern);
        if (match) {
          const parsed = parseFloat(match[1] || match[0].replace("$", ""));
          if (!isNaN(parsed) && parsed > 0) {
            amount = parsed;
            break;
          }
        }
      }
      if (amount > 0) break;
    }

    // Try to extract merchant/store name (usually first few lines)
    let merchant = "";
    const merchantLines = lines.slice(0, Math.min(5, lines.length));
    if (merchantLines.length > 0) {
      // Take the first substantial line as merchant name
      merchant = merchantLines.find((line) => line.length > 3 && !line.match(/^\d/)) || "";
    }

    // Try to infer category from merchant name or text
    let category = this.inferCategory(merchant, text);

    return {
      date,
      amount,
      category,
      merchant,
      rawText: text,
      note: merchant || "Receipt scan",
    };
  }

  /**
   * Infers category from merchant name or receipt text
   * @param {string} merchant - Merchant name
   * @param {string} text - Full receipt text
   * @returns {string} Inferred category
   */
  inferCategory(merchant, text) {
    const lowerMerchant = merchant.toLowerCase();
    const lowerText = text.toLowerCase();

    // Category keywords mapping
    const categoryKeywords = {
      groceries: ["grocery", "supermarket", "walmart", "target", "kroger", "safeway", "food", "market"],
      restaurant: ["restaurant", "cafe", "coffee", "starbucks", "mcdonald", "burger", "pizza", "dining", "food"],
      gas: ["gas", "fuel", "shell", "exxon", "chevron", "bp", "mobil", "petrol"],
      pharmacy: ["pharmacy", "cvs", "walgreens", "rite aid", "drug"],
      retail: ["store", "shop", "retail", "amazon", "best buy", "home depot"],
      entertainment: ["movie", "cinema", "theater", "netflix", "spotify", "game"],
      transportation: ["uber", "lyft", "taxi", "bus", "train", "metro"],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => lowerMerchant.includes(keyword) || lowerText.includes(keyword))) {
        return category;
      }
    }

    return "uncategorized";
  }
}

export class ReceiptNormalizer {
  /**
   * Normalizes raw receipt data into transaction format
   * @param {Object} raw - Raw receipt data from ReceiptSource
   * @returns {Object} Normalized transaction
   */
  normalize(raw) {
    return {
      date: raw.date || new Date().toISOString().slice(0, 10),
      amount: -Math.abs(Number(raw.amount || 0)), // Expenses are negative
      category: raw.category || "uncategorized",
      source: "receipt",
    };
  }
}

export class ReceiptFactory {
  makeSource() {
    return new ReceiptSource();
  }
  makeNormalizer() {
    return new ReceiptNormalizer();
  }
}

