import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};

router.get("/", protect, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Fetch users failed" });
  }
});

router.delete("/:id", protect, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
