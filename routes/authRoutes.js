import express from "express";
import {
  register,
  login,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected (requires token)
router.get("/users", protect, getAllUsers);
router.put("/users/:id", protect, updateUser);
router.delete("/users/:id", protect, deleteUser);

export default router;
