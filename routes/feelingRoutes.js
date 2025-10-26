import express from "express";
import { addFeeling, getFeelings, deleteFeeling } from "../controllers/feelingController.js";
const router = express.Router();

// ⚠️ Testing purpose: protect middleware remove kar diya
router.post("/add", addFeeling);
router.get("/", getFeelings);
router.delete("/:id", deleteFeeling);

export default router;
