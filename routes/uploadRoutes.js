// routes/uploadRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// ===============================
// 🔹 MULTIPLE FILE UPLOAD
// ===============================
// Use field name "files" in frontend FormData
router.post("/multiple", protect, upload.array("files", 5), async (req, res) => {
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
      raw: req.files, // complete files info if needed
    });
  } catch (err) {
    console.error("⚠️ Multi Upload Error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

export default router;
