import express from "express";
import { addFeeling, getFeelings, deleteFeeling } from "../controllers/feelingController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/add", protect, addFeeling);
router.get("/", protect, getFeelings);
router.delete("/:id", protect, deleteFeeling);

export default router;
