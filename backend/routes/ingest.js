import { Router } from "express";
import multer from "multer";
import { ingest } from "../controllers/ingestController.js";

const r = Router();

// Configure multer for file uploads (memory storage for receipt images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// POST /api/ingest?suite=manual|receipt|card
// For receipt suite, expects multipart/form-data with 'file' field
// For manual suite, expects JSON body
r.post("/", (req, res, next) => {
  const suite = (req.query.suite || "manual").toString().toLowerCase();
  
  if (suite === "receipt") {
    // Use multer middleware for receipt uploads
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "File upload failed" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Receipt image file is required" });
      }
      next();
    });
  } else {
    // For manual suite, proceed without file upload
    next();
  }
}, ingest);

export default r;
