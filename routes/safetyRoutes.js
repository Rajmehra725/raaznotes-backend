import express from "express";
import { getSafetyTips, addSafetyTip } from "../controllers/safetyController.js";
const router = express.Router();

router.get("/tips", getSafetyTips);
router.post("/add", addSafetyTip);

export default router;
