import express from "express";
import {
  getAllUsers,
  deleteUser,
  changeUserRole,
  toggleBlockUser,
  getProfile,
  updateProfile,
  updatePassword,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js"; // For avatar/cover upload

const router = express.Router();

// ✅ Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access only" });
  next();
};

// 🔹 ADMIN ROUTES
router.get("/", protect, requireAdmin, getAllUsers);
router.delete("/:id", protect, requireAdmin, deleteUser);
router.put("/:id/role", protect, requireAdmin, changeUserRole);
router.put("/:id/block", protect, requireAdmin, toggleBlockUser);

// 🔹 USER SETTINGS ROUTES
// ✅ Get own profile
router.get("/me", protect, getProfile);

// ✅ Update profile (bio, socials, avatar, cover)
router.put(
  "/me",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  updateProfile
);

// ✅ Update password
router.put("/me/password", protect, updatePassword);

export default router;
