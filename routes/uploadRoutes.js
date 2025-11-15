import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadMultiple } from "../config/cloudinary.js";

const router = express.Router();

// ===============================
// 🔹 MULTIPLE FILE UPLOAD
// ===============================
// Field name: "images"
router.post("/multiple", protect, uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Extract Cloudinary URLs
    const urls = req.files.map(
      (file) => file.path || file?.secure_url || file?.url
    );

    res.json({
      success: true,
      urls,           // array of uploaded URLs
      raw: req.files, // full file info
    });
  } catch (err) {
    console.error("⚠️ Multi Upload Error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

export default router;
